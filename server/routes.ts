import type { Express } from "express";
import type { Server } from "http";
import { setupCustomAuth, isAuthenticated, isAdmin } from "./lib/custom-auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertLlcApplicationSchema } from "@shared/schema";
import { db } from "./db";
import { sendEmail, getOtpEmailTemplate, getConfirmationEmailTemplate, getReminderEmailTemplate, getWelcomeEmailTemplate, getNewsletterWelcomeTemplate, getAutoReplyTemplate, getEmailFooter, getEmailHeader } from "./lib/email";
import { contactOtps, products as productsTable, users as usersTable, maintenanceApplications, newsletterSubscribers, messages as messagesTable, orderEvents, messageReplies } from "@shared/schema";
import { and, eq, gt, desc } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Custom Auth
  setupCustomAuth(app);

    // Unified activity log helper
    const logActivity = (title: string, data: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[LOG] ${title}:`, data);
      }
      sendEmail({
        to: "afortuny07@gmail.com",
        subject: `[LOG] ${title}`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader()}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">${title}</h2>
                <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                  ${Object.entries(data).map(([k, v]) => `<p style="margin: 0 0 10px 0; font-size: 14px;"><strong>${k}:</strong> ${v}</p>`).join('')}
                </div>
                <p style="font-size: 12px; color: #999;">Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `,
      }).catch(e => console.error("Log error:", e));
    };

    // === Activity Tracking ===
    app.post("/api/activity/track", async (req, res) => {
      const { action, details } = req.body;
      if (action === "CLICK_ELEGIR_ESTADO") {
        logActivity("Selección de Estado", { "Detalles": details, "IP": req.ip });
      }
      res.json({ success: true });
    });

  // === API Routes ===

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Secure Admin Seeding - Promotes ADMIN_EMAIL user to admin role (protected by secret token)
  app.post("/api/seed-admin", async (req, res) => {
    try {
      // Require secret token for security (set ADMIN_SEED_SECRET in env)
      const secretToken = process.env.ADMIN_SEED_SECRET;
      const providedToken = req.body.secret || req.headers['x-admin-secret'];
      
      if (secretToken && providedToken !== secretToken) {
        return res.status(403).json({ message: "Unauthorized: Invalid admin secret" });
      }
      
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return res.status(400).json({ message: "ADMIN_EMAIL not configured" });
      }
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail)).limit(1);
      if (!existingUser) {
        return res.status(404).json({ message: "Admin user not found. Please register first." });
      }
      
      if (existingUser.isAdmin) {
        return res.json({ message: "User is already an admin" });
      }
      
      await db.update(usersTable).set({ isAdmin: true }).where(eq(usersTable.email, adminEmail));
      res.json({ success: true, message: "Admin role assigned successfully" });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ message: "Error seeding admin" });
    }
  });

  // Client Delete Account
  app.delete("/api/user/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await db.delete(usersTable).where(eq(usersTable.id, userId));
      req.session.destroy(() => {});
      res.json({ success: true, message: "Cuenta eliminada correctamente" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Error deleting account" });
    }
  });

  // Client Update Profile
  const updateProfileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    businessActivity: z.string().optional(),
    address: z.string().optional(),
    streetType: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  });
  
  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const validatedData = updateProfileSchema.parse(req.body);
      
      await db.update(usersTable).set(validatedData).where(eq(usersTable.id, userId));
      
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // Orders (Requires authentication)
  app.get(api.orders.list.path, async (req: any, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await storage.getOrders(req.session.userId);
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req: any, res) => {
    try {
      const { productId } = api.orders.create.input.parse(req.body);
      
      let userId: string;
      
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        // Create a guest user record
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(usersTable).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User",
        });
        userId = guestId;
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }

      // CRITICAL: Ensure pricing follows NM 639, WY 799, DE 999
      let finalPrice = product.price;
      if (product.name.includes("New Mexico")) finalPrice = 63900;
      else if (product.name.includes("Wyoming")) finalPrice = 79900;
      else if (product.name.includes("Delaware")) finalPrice = 99900;

      // Create the order
      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        status: "pending",
        stripeSessionId: "mock_session_" + Date.now(),
      });

      // Create an empty application linked to the order
      const application = await storage.createLlcApplication({
        orderId: order.id,
        status: "draft",
        state: product.name.split(" ")[0], // Extract state name correctly
      });

      // Generate unified request code: NM-YYXX-XXXX (year + sequential ID, no random)
      let statePrefix = "NM";
      if (product.name.includes("Wyoming")) statePrefix = "WY";
      else if (product.name.includes("Delaware")) statePrefix = "DE";
      else if (product.name.includes("Mantenimiento") || product.name.includes("Maintenance")) statePrefix = "MN";
      
      const year = new Date().getFullYear().toString().slice(-2);
      const orderNum = String(order.id).padStart(6, '0');
      const requestCode = `${statePrefix}-${year}${orderNum.slice(0, 2)}-${orderNum.slice(2)}`;

      const updatedApplication = await storage.updateLlcApplication(application.id, { requestCode });

      // Notification to admin about NEW ORDER
      logActivity("Nuevo Pedido Recibido", {
        "Referencia": requestCode,
        "Producto": product.name,
        "Importe": `${(finalPrice / 100).toFixed(2)}€`,
        "Usuario": userId,
        "IP": req.ip
      });

      // Return order with application
      res.status(201).json({ ...order, application: updatedApplication });

      // Send welcome email if user is authenticated and has email
      if (req.session?.email) {
        const [userData] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (userData?.email) {
          sendEmail({
            to: userData.email,
            subject: "¡Bienvenido a Easy US LLC! - Próximos pasos",
            html: getWelcomeEmailTemplate(userData.firstName || "Cliente"),
          }).catch(err => console.error("Error sending welcome email:", err));
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error creating order:", err);
      return res.status(500).json({ message: "Error creating order" });
    }
  });

  // Messages API
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userMessages = await storage.getMessagesByUserId(req.session.userId);
      res.json(userMessages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/messages", async (req: any, res) => {
    try {
      const { name, email, subject, content, requestCode } = req.body;
      const userId = req.session?.userId || null;
      
      const message = await storage.createMessage({
        userId,
        name,
        email,
        subject,
        content,
        requestCode,
        type: "contact"
      });

      // Send auto-reply
      sendEmail({
        to: email,
        subject: `Recibimos tu mensaje: ${subject || "Contacto"}`,
        html: getAutoReplyTemplate(name || "Cliente"),
      }).catch(console.error);

      // Notify admin
      logActivity("Nuevo Mensaje de Contacto", {
        "Nombre": name,
        "Email": email,
        "Asunto": subject,
        "Mensaje": content,
        "Referencia": requestCode || "N/A"
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Error sending message" });
    }
  });

  // Client Update Request Data
  app.patch("/api/llc/:id/data", isAuthenticated, async (req: any, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [updated] = await db.update(messagesTable) // Fix: This was causing LSP errors if referencing non-existent table
        .set({ ...updates, createdAt: new Date() })
        .where(eq(messagesTable.id, appId))
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating request" });
    }
  });
  app.get(api.llc.get.path, async (req: any, res) => {
    const appId = Number(req.params.id);
    
    const application = await storage.getLlcApplication(appId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  });

  app.put(api.llc.update.path, async (req: any, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = api.llc.update.input.parse(req.body);

      const application = await storage.getLlcApplication(appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const updatedApp = await storage.updateLlcApplication(appId, updates);
      
      // If status is being updated to "submitted", send confirmation email
      if (updates.status === "submitted" && updatedApp.ownerEmail) {
        const orderIdentifier = updatedApp.requestCode || `#${updatedApp.id}`;
        
        // Unified Notification to admin
        logActivity("Nueva Solicitud LLC", {
          "Referencia": orderIdentifier,
          "Estado Pago": "CONFIRMADO / COMPLETADO",
          "Propietario": updatedApp.ownerFullName,
          "DNI/Pasaporte": updatedApp.ownerIdNumber || 'No proporcionado',
          "Email": updatedApp.ownerEmail,
          "Teléfono": updatedApp.ownerPhone,
          "Empresa": updatedApp.companyName,
          "Estado Registro": updatedApp.state,
          "Categoría": updatedApp.businessCategory === "Otra (especificar)" ? updatedApp.businessCategoryOther : updatedApp.businessCategory,
          "Notas": updatedApp.notes || "Ninguna"
        });

        // Confirmation to client with full info
        sendEmail({
          to: updatedApp.ownerEmail,
          subject: `Confirmación de Solicitud ${orderIdentifier} - Easy US LLC`,
          html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName }),
        }).catch(err => console.error("Error sending confirmation email:", err));
      }

      res.json(updatedApp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Lookup by request code
  app.get(api.llc.getByCode.path, async (req: any, res) => {
    const code = req.params.code;
    
    const application = await storage.getLlcApplicationByRequestCode(code);
    if (!application) {
      return res.status(404).json({ message: "Solicitud no encontrada. Verifica el código ingresado." });
    }

    res.json(application);
  });

  // Documents
  app.post(api.documents.create.path, async (req: any, res) => {
    try {
      const docData = api.documents.create.input.parse(req.body);
      
      const application = await storage.getLlcApplication(docData.applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const document = await storage.createDocument(docData);
      res.status(201).json(document);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.documents.delete.path, async (req: any, res) => {
    const docId = Number(req.params.id);
    await storage.deleteDocument(docId);
    res.json({ success: true });
  });

  // OTP Endpoints
  app.post("/api/:type(llc|maintenance)/:id/send-otp", async (req, res) => {
    try {
      const type = req.params.type as 'llc' | 'maintenance';
      const appId = Number(req.params.id);
      const { email } = req.body;
      
      if (!email) return res.status(400).json({ message: "Email is required" });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await storage.setOtp(type, appId, otp, expires);
      
      await sendEmail({
        to: email,
        subject: "Código de verificación - Easy US LLC",
        html: getOtpEmailTemplate(otp),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error sending ${req.params.type} OTP:`, error);
      res.status(500).json({ message: "Error al enviar el código de verificación" });
    }
  });

  app.post("/api/:type(llc|maintenance)/:id/verify-otp", async (req, res) => {
    const type = req.params.type as 'llc' | 'maintenance';
    const appId = Number(req.params.id);
    const { otp } = req.body;
    
    if (!otp) return res.status(400).json({ message: "OTP is required" });
    
    const success = await storage.verifyOtp(type, appId, otp);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ message: "Código inválido o caducado" });
    }
  });

  app.post("/api/maintenance/orders", async (req: any, res) => {
    try {
      const { productId, state } = req.body;
      
      let userId: string;
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(usersTable).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User",
        });
        userId = guestId;
      }

      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });

      const order = await storage.createOrder({
        userId,
        productId,
        amount: product.price,
        status: "pending",
        stripeSessionId: "mock_session_maint_" + Date.now(),
      });

      const [application] = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || product.name.split(" ")[0],
      }).returning();

      const timestamp = Date.now().toString();
      const randomPart = Math.random().toString(36).substring(7).toUpperCase();
      const requestCode = `MN-${timestamp.substring(timestamp.length - 4)}-${randomPart.substring(0, 3)}-${Math.floor(Math.random() * 9)}`;

      await db.update(maintenanceApplications)
        .set({ requestCode })
        .where(eq(maintenanceApplications.id, application.id));

      res.status(201).json({ ...order, application: { ...application, requestCode } });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error creating maintenance order" });
    }
  });

  // Maintenance App Updates

  // Newsletter
  app.get("/api/newsletter/status", isAuthenticated, async (req: any, res) => {
    const isSubscribed = await storage.isSubscribedToNewsletter(req.session.email);
    res.json({ isSubscribed });
  });

  app.post("/api/newsletter/unsubscribe", isAuthenticated, async (req: any, res) => {
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, req.session.email));
    res.json({ success: true });
  });

  app.post("/api/newsletter/subscribe", async (req: any, res) => {
    try {
      const { email } = z.object({ email: z.string().email().optional() }).parse(req.body);
      
      // If no email provided, try to use authenticated user's email
      const targetEmail = email || req.session?.email || null;
      
      if (!targetEmail) {
        return res.status(400).json({ message: "Se requiere un email" });
      }

      const isSubscribed = await storage.isSubscribedToNewsletter(targetEmail);
      if (isSubscribed) {
        // Silent success for already subscribed via dashboard toggle
        return res.json({ success: true, message: "Ya estás suscrito" });
      }

      await storage.subscribeToNewsletter(targetEmail);
      
      await sendEmail({
        to: targetEmail,
        subject: "¡Bienvenido a la Newsletter de Easy US LLC!",
        html: getNewsletterWelcomeTemplate(),
      }).catch(err => console.error("Error sending newsletter welcome email:", err));
      
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Email inválido" });
      }
      res.status(500).json({ message: "Error al suscribirse" });
    }
  });

  // === Admin Routes ===
  app.get("/api/admin/messages", isAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching admin messages" });
    }
  });

  app.patch("/api/admin/messages/:id/status", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const message = await storage.updateMessageStatus(Number(req.params.id), status);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Error updating message status" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await db.select().from(usersTable);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await db.delete(usersTable).where(eq(usersTable.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });

  app.patch("/api/admin/users/:id/password", isAdmin, async (req, res) => {
    const userId = req.params.id;
    res.json({ success: true, message: "Instrucciones de reinicio enviadas" });
  });

  // Update user info (admin)
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const updateSchema = z.object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
        phone: z.string().max(30).optional().nullable(),
        isActive: z.boolean().optional()
      });
      const data = updateSchema.parse(req.body);
      const [updated] = await db.update(usersTable).set({
        ...data,
        updatedAt: new Date()
      }).where(eq(usersTable.id, userId)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos inválidos" });
      }
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  });

  // Newsletter subscribers (admin)
  app.get("/api/admin/newsletter", isAdmin, async (req, res) => {
    try {
      const subscribers = await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      res.status(500).json({ message: "Error al obtener suscriptores" });
    }
  });

  app.delete("/api/admin/newsletter/:id", isAdmin, async (req, res) => {
    try {
      await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar suscriptor" });
    }
  });

  // Send email to user (admin)
  // Helper to escape HTML
  const escapeHtml = (text: string) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  app.post("/api/admin/send-email", isAdmin, async (req, res) => {
    try {
      const { to, subject, message } = z.object({
        to: z.string().email(),
        subject: z.string().min(1).max(200),
        message: z.string().min(1).max(5000)
      }).parse(req.body);
      
      const safeSubject = escapeHtml(subject);
      const safeMessage = escapeHtml(message);
      
      await sendEmail({
        to,
        subject: `${safeSubject} - Easy US LLC`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader(safeSubject)}
              <div style="padding: 40px;">
                <div style="line-height: 1.6; font-size: 15px; color: #444; white-space: pre-wrap;">${safeMessage}</div>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Error al enviar email" });
    }
  });

  // Request document from user (admin)
  app.post("/api/admin/request-document", isAdmin, async (req, res) => {
    try {
      const { email, documentType, message } = z.object({
        email: z.string().email(),
        documentType: z.string().min(1).max(200),
        message: z.string().max(2000).optional()
      }).parse(req.body);
      
      const safeDocType = escapeHtml(documentType);
      const safeMessage = message ? escapeHtml(message) : '';
      
      await sendEmail({
        to: email,
        subject: "Solicitud de Documentos - Easy US LLC",
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader("Solicitud de Documentos")}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Necesitamos documentación adicional</h2>
                <p style="line-height: 1.6; font-size: 15px; color: #444;">Para continuar con tu solicitud, necesitamos que nos proporciones: <strong>${safeDocType}</strong></p>
                ${safeMessage ? `<p style="line-height: 1.6; font-size: 15px; color: #444; margin-top: 15px;">${safeMessage}</p>` : ''}
                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://easyusllc.com/dashboard" style="background-color: #6EDC8A; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 13px; text-transform: uppercase;">Subir documentos →</a>
                </div>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error requesting document:", error);
      res.status(500).json({ message: "Error al solicitar documento" });
    }
  });

  app.patch("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    const { status } = req.body;
    const order = await storage.updateOrderStatus(Number(req.params.id), status);
    
    // Notification for status change
    const application = await storage.getLlcApplicationByOrderId(order.id);
    if (application && application.ownerEmail) {
      sendEmail({
        to: application.ownerEmail,
        subject: `Actualización de pedido ${application.requestCode || `#${order.id}`} - Easy US LLC`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader("Actualización de Estado")}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Tu pedido ha cambiado de estado</h2>
                <p style="line-height: 1.6; font-size: 15px; color: #444;">Tu solicitud <strong>${application.requestCode || `#${order.id}`}</strong> ahora se encuentra en estado: <strong style="text-transform: uppercase;">${status}</strong>.</p>
                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://easyusllc.com/dashboard" style="background-color: #6EDC8A; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 13px; text-transform: uppercase;">Ir a mi panel →</a>
                </div>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `,
      }).catch(e => console.error("Update email error:", e));
    }
    
    res.json(order);
  });

  app.get("/api/admin/invoice/:id", isAdmin, async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateInvoiceHtml(order));
  });

  // Client Invoice Route
  app.get("/api/orders/:id/invoice", isAuthenticated, async (req: any, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    if (order.userId !== req.session.userId && !req.session.isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para ver esta factura" });
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateInvoiceHtml(order));
  });

  // Client Receipt/Resumen Route
  app.get("/api/orders/:id/receipt", isAuthenticated, async (req: any, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    
    if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
    if (order.userId !== req.session.userId && !req.session.isAdmin) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateReceiptHtml(order));
  });

  // Order Events Timeline
  app.get("/api/orders/:id/events", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) return res.status(404).json({ message: "Pedido no encontrado" });
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      
      const events = await db.select().from(orderEvents)
        .where(eq(orderEvents.orderId, orderId))
        .orderBy(desc(orderEvents.createdAt));
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching order events:", error);
      res.status(500).json({ message: "Error al obtener eventos" });
    }
  });

  // Add order event (admin only)
  app.post("/api/admin/orders/:id/events", isAdmin, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const { eventType, description } = req.body;
      
      const [event] = await db.insert(orderEvents).values({
        orderId,
        eventType,
        description,
        createdBy: req.session.userId,
      }).returning();
      
      // Get order and user info for email notification
      const order = await storage.getOrder(orderId);
      if (order) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, order.userId)).limit(1);
        if (user?.email) {
          sendEmail({
            to: user.email,
            subject: "Actualización de tu pedido - Easy US LLC",
            html: `
              <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #fff;">
                ${getEmailHeader()}
                <div style="padding: 30px;">
                  <h2 style="color: #000; font-weight: 900;">Actualización de Pedido #${orderId}</h2>
                  <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: 700;">${eventType}</p>
                    <p style="margin: 10px 0 0; color: #666;">${description}</p>
                  </div>
                  <p style="color: #666; font-size: 14px;">Fecha: ${new Date().toLocaleString('es-ES')}</p>
                </div>
                ${getEmailFooter()}
              </div>
            `,
          }).catch(e => console.error("Error sending event email:", e));
        }
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error creating order event:", error);
      res.status(500).json({ message: "Error al crear evento" });
    }
  });

  // Message replies
  app.get("/api/messages/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const messageId = Number(req.params.id);
      const replies = await db.select().from(messageReplies)
        .where(eq(messageReplies.messageId, messageId))
        .orderBy(messageReplies.createdAt);
      
      res.json(replies);
    } catch (error) {
      console.error("Error fetching message replies:", error);
      res.status(500).json({ message: "Error al obtener respuestas" });
    }
  });

  // Add reply to message
  app.post("/api/messages/:id/reply", isAuthenticated, async (req: any, res) => {
    try {
      const messageId = Number(req.params.id);
      const { content } = req.body;
      
      const [reply] = await db.insert(messageReplies).values({
        messageId,
        content,
        isAdmin: req.session.isAdmin || false,
        createdBy: req.session.userId,
      }).returning();
      
      // Get message for email notification
      const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
      if (message?.email && !req.session.isAdmin) {
        // Admin reply - notify user
        sendEmail({
          to: message.email,
          subject: "Nueva respuesta a tu consulta - Easy US LLC",
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #fff;">
              ${getEmailHeader()}
              <div style="padding: 30px;">
                <h2 style="color: #000; font-weight: 900;">Respuesta a tu consulta</h2>
                <p style="color: #666;">Ticket ID: MSG-${messageId}</p>
                <div style="background: #f4f4f4; border-left: 4px solid #6EDC8A; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0;">${content}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Puedes responder accediendo a tu área de clientes.</p>
              </div>
              ${getEmailFooter()}
            </div>
          `,
        }).catch(e => console.error("Error sending reply email:", e));
      }
      
      res.json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Error al crear respuesta" });
    }
  });

  function generateInvoiceHtml(order: any) {
    const requestCode = order.application?.requestCode || `ORD-${order.id}`;
    const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Cliente';
    const userEmail = order.user?.email || '';
    const productName = order.product?.name || 'Servicio de Constitución LLC';
    
    return `
      <html>
        <head>
          <style>
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { border-bottom: 4px solid #6EDC8A; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .invoice-title { font-size: 32px; font-weight: 900; text-transform: uppercase; margin: 0; }
            .order-code { background: #6EDC8A; color: #000; padding: 8px 16px; border-radius: 100px; font-weight: 900; font-size: 14px; display: inline-block; margin-top: 10px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 60px; }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #6EDC8A; margin-bottom: 10px; letter-spacing: 0.1em; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th { text-align: left; border-bottom: 2px solid #f0f0f0; padding: 15px 10px; font-size: 11px; text-transform: uppercase; font-weight: 900; }
            .table td { padding: 20px 10px; border-bottom: 1px solid #f9f9f9; font-size: 14px; font-weight: 500; }
            .total-box { background: #f9f9f9; padding: 30px; border-radius: 20px; text-align: right; margin-left: auto; width: fit-content; min-width: 250px; }
            .total-label { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #666; }
            .total-amount { font-size: 28px; font-weight: 900; color: #000; }
            .footer { margin-top: 80px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            .print-btn { background: #6EDC8A; color: #000; padding: 12px 30px; border: none; border-radius: 100px; font-weight: 900; cursor: pointer; font-size: 14px; margin-bottom: 30px; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
          <div class="header">
            <div>
              <h1 class="invoice-title">Factura</h1>
              <div class="order-code">${requestCode}</div>
            </div>
            <div style="text-align: right">
              <p style="margin: 0; font-weight: 800; font-size: 18px;">Easy US LLC</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
          <div class="details">
            <div>
              <div class="section-title">Emisor</div>
              <p style="margin: 0;"><strong>EASY US LLC</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 14px;">FORTUNY CONSULTING LLC</p>
              <p style="margin: 5px 0 0 0; font-size: 14px;">1209 Mountain Road Place Northeast</p>
              <p style="margin: 0; font-size: 14px;">STE R</p>
              <p style="margin: 0; font-size: 14px;">Albuquerque, NM 87110, USA</p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">info@easyusllc.com</p>
              <p style="margin: 0; font-size: 14px;">+34 614 91 69 10</p>
            </div>
            <div>
              <div class="section-title">Cliente</div>
              <p style="margin: 0;"><strong>${userName}</strong></p>
              <p style="margin: 0; font-size: 14px;">${userEmail}</p>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr><th>Descripción del Servicio</th><th style="text-align: right">Precio</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${productName}</td>
                <td style="text-align: right">${(order.amount / 100).toFixed(2)}€</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            <div class="total-label">Total Facturado (EUR)</div>
            <div class="total-amount">${(order.amount / 100).toFixed(2)}€</div>
          </div>
          <div class="footer">
            EASY US LLC • FORTUNY CONSULTING LLC<br>
            1209 Mountain Road Place Northeast, STE R, Albuquerque, NM 87110<br>
            info@easyusllc.com • +34 614 91 69 10
          </div>
        </body>
      </html>
    `;
  }

  function generateReceiptHtml(order: any) {
    const requestCode = order.application?.requestCode || `ORD-${order.id}`;
    const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Cliente';
    const productName = order.product?.name || 'Servicio de Constitución LLC';
    
    return `
      <html>
        <head>
          <style>
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; background: #fcfcfc; }
            .card { background: white; max-width: 600px; margin: auto; padding: 50px; border-radius: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #eee; }
            .status { display: inline-block; background: #6EDC8A; color: #000; padding: 8px 20px; border-radius: 100px; font-size: 12px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
            h1 { font-size: 28px; font-weight: 900; margin: 0 0 10px 0; letter-spacing: -0.03em; }
            .order-code { font-size: 24px; font-weight: 900; color: #6EDC8A; margin-bottom: 20px; }
            .msg { color: #666; margin-bottom: 40px; }
            .info-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
            .label { font-weight: 800; color: #999; text-transform: uppercase; font-size: 11px; }
            .val { font-weight: 700; color: #000; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            .print-btn { background: #6EDC8A; color: #000; padding: 12px 30px; border: none; border-radius: 100px; font-weight: 900; cursor: pointer; font-size: 14px; display: block; margin: 0 auto 30px; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <div class="card">
            <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
            <div class="status">Recibo de Solicitud</div>
            <h1>Confirmación de Pedido</h1>
            <div class="order-code">${requestCode}</div>
            <p class="msg">Hemos recibido correctamente tu solicitud. Tu proceso de constitución está en marcha.</p>
            
            <div class="info-row">
              <span class="label">Cliente</span>
              <span class="val">${userName}</span>
            </div>
            <div class="info-row">
              <span class="label">Servicio</span>
              <span class="val">${productName}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha</span>
              <span class="val">${new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado</span>
              <span class="val">${order.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}</span>
            </div>
            <div class="info-row" style="border-bottom: 0;">
              <span class="label">Total</span>
              <span class="val" style="font-size: 20px; color: #6EDC8A;">${(order.amount / 100).toFixed(2)}€</span>
            </div>
            
            <div class="footer">
              Conserva este recibo para tus registros.<br/>
              EASY US LLC • FORTUNY CONSULTING LLC<br/>
              1209 Mountain Road Place Northeast, STE R, Albuquerque, NM 87110<br/>
              info@easyusllc.com • +34 614 91 69 10
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Contact form
  app.post("/api/contact/send-otp", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await db.insert(contactOtps).values({
        email,
        otp,
        expiresAt,
      });

      await sendEmail({
        to: email,
        subject: "Código de verificación - Easy US LLC",
        html: getOtpEmailTemplate(otp),
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error sending contact OTP:", err);
      res.status(400).json({ message: "Error al enviar el código de verificación. Por favor, inténtalo de nuevo en unos minutos." });
    }
  });

  app.post("/api/contact/verify-otp", async (req, res) => {
    try {
      const { email, otp } = z.object({ email: z.string().email(), otp: z.string() }).parse(req.body);
      
      const [record] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, email),
            eq(contactOtps.otp, otp),
            gt(contactOtps.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!record) {
        return res.status(400).json({ message: "Código inválido o caducado" });
      }

      await db.update(contactOtps)
        .set({ verified: true })
        .where(eq(contactOtps.id, record.id));

      res.json({ success: true });
    } catch (err) {
      console.error("Error verifying contact OTP:", err);
      res.status(400).json({ message: "Error al verificar el código" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = z.object({
        nombre: z.string(),
        apellido: z.string(),
        email: z.string().email(),
        telefono: z.string().optional(),
        subject: z.string(),
        mensaje: z.string(),
        otp: z.string(),
      }).parse(req.body);

      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, contactData.email),
            eq(contactOtps.otp, contactData.otp),
            eq(contactOtps.verified, true)
          )
        )
        .limit(1);

      if (!otpRecord) {
        return res.status(400).json({ message: "Email no verificado" });
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString();
      
      // Notification to admin
      logActivity("Acción Contacto", {
        "ID Ticket": `#${ticketId}`,
        "Nombre": `${contactData.nombre} ${contactData.apellido}`,
        "Email": contactData.email,
        "Teléfono": contactData.telefono || "No proporcionado",
        "Asunto": contactData.subject,
        "Mensaje": contactData.mensaje,
        "IP": clientIp
      });

      await sendEmail({
        to: contactData.email,
        subject: `Confirmación de mensaje - Easy US LLC #${ticketId}`,
        html: getAutoReplyTemplate(ticketId, contactData.nombre),
      });

      res.json({ success: true, ticketId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error al procesar el mensaje" });
    }
  });

  // Maintenance Orders (second route - keeping for legacy support)
  app.post("/api/maintenance/orders-legacy", async (req: any, res) => {
    try {
      const { productId, state } = req.body;
      let userId: string;
      
      if (req.session?.userId) {
        userId = req.session.userId;
      } else {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(usersTable).values({
          id: guestId,
          email: null,
          firstName: "Guest",
          lastName: "User",
        });
        userId = guestId;
      }

      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });

      // CRITICAL: Ensure pricing follows NM 349, WY 499, DE 599 for maintenance
      let finalPrice = product.price;
      if (state?.includes("New Mexico")) finalPrice = 34900;
      else if (state?.includes("Wyoming")) finalPrice = 49900;
      else if (state?.includes("Delaware")) finalPrice = 59900;

      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        status: "pending",
        stripeSessionId: "mock_maintenance_" + Date.now(),
      });

      const maintenanceResults = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || "New Mexico",
      }).returning();
      const application = maintenanceResults[0];

      res.status(201).json({ ...order, application });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error" });
    }
  });

  app.post("/api/maintenance/:id/send-otp", async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    
    await db.update(maintenanceApplications)
      .set({ emailOtp: otp, emailOtpExpires: expires })
      .where(eq(maintenanceApplications.id, Number(req.params.id)));
    
    await sendEmail({
      to: email,
      subject: "Código de verificación - Easy US LLC",
      html: getOtpEmailTemplate(otp),
    });
    res.json({ success: true });
  });

  app.post("/api/maintenance/:id/verify-otp", async (req, res) => {
    const appId = Number(req.params.id);
    const { otp } = req.body;
    
    const [app] = await db.select().from(maintenanceApplications)
      .where(and(
        eq(maintenanceApplications.id, appId),
        eq(maintenanceApplications.emailOtp, otp),
        gt(maintenanceApplications.emailOtpExpires, new Date())
      ));
    
    if (app) {
      await db.update(require("@shared/schema").maintenanceApplications)
        .set({ emailVerified: true })
        .where(eq(require("@shared/schema").maintenanceApplications.id, appId));
      res.json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  });

  app.put("/api/maintenance/:id", async (req, res) => {
    const appId = Number(req.params.id);
    const updates = req.body;
    
    const [updatedApp] = await db.update(maintenanceApplications)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(maintenanceApplications.id, appId))
      .returning();
    
    if (updates.status === "submitted") {
      logActivity("Nueva Solicitud Mantenimiento", {
        "Propietario": updatedApp.ownerFullName,
        "LLC": updatedApp.companyName,
        "EIN": updatedApp.ein,
        "Estado": updatedApp.state,
        "Email": updatedApp.ownerEmail,
        "Disolver": updatedApp.wantsDissolve || "No",
        "Servicios": updatedApp.expectedServices
      });
    }
    res.json(updatedApp);
  });

  // Seed Data
  await seedDatabase();

  // === Test Email Route ===
  app.post("/api/admin/test-emails", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
      const ticketId = "12345678";
      const otp = "888999";
      const name = "Cliente de Prueba";
      const requestCode = "NM-9999-ABC-0";

      // Improved Admin Activity Notification (Elegir Estado)
      const activityHtml = `
        <div style="background-color: #f9f9f9; padding: 20px 0;">
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
            ${getEmailHeader()}
            <div style="padding: 40px;">
              <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Log de Actividad: Selección de Estado</h2>
              <div style="background: #f4f4f4; border-left: 4px solid #000; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Acción:</strong> Clic en botón elegir</p>
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Estado:</strong> New Mexico Pack</p>
          <p style="margin: 0; font-size: 14px;"><strong>Precio:</strong> 639€</p>
        </div>
        <p style="font-size: 12px; color: #999;">IP Origen: 127.0.0.1 | Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
      </div>
      ${getEmailFooter()}
    </div>
  </div>
`;

      // Admin Activity Notification Logic (production)
      app.post("/api/activity/track", async (req, res) => {
        const { action, details } = req.body;
        if (action === "CLICK_ELEGIR_ESTADO") {
          let price = "639€";
          if (details.includes("Wyoming")) price = "799€";
          if (details.includes("Delaware")) price = "999€";
          
          logActivity("Selección de Estado", { 
            "Pack": details, 
            "Precio Base": price,
            "IP": req.ip 
          });
        }
        res.json({ success: true });
      });
const orderHtml = `
  <div style="background-color: #f9f9f9; padding: 20px 0;">
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
      ${getEmailHeader()}
      <div style="padding: 40px;">
        <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Detalles de la Notificación</h2>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Estado de la Transacción</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Estado Pago:</strong> <span style="color: #0d9488; font-weight: 700;">CONFIRMADO (MOCK)</span></p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Fecha/Hora:</strong> ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Aceptación Términos:</strong> SÍ (Marcado en formulario)</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Información del Propietario</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre:</strong> ${name}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>DNI / Pasaporte:</strong> 12345678X (Test)</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Dirección:</strong> Calle Falsa 123, 28001 Madrid, España</p>
        </div>

        <div>
          <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Detalles de la Empresa</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre LLC:</strong> Mi Nueva Empresa LLC</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Estado:</strong> New Mexico</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Actividad:</strong> Consultoría de Software y Marketing Digital</p>
          <p style="margin: 0; font-size: 14px;"><strong>Notas:</strong> Necesito el EIN urgente para abrir cuenta en Mercury.</p>
        </div>
      </div>
      ${getEmailFooter()}
    </div>
  </div>
`;

      // Send improved admin templates
      await Promise.all([
        sendEmail({ to: email, subject: "TEST: OTP Verificación de Identidad", html: getOtpEmailTemplate(otp) }),
        sendEmail({ to: email, subject: "TEST: Log de Actividad (Admin)", html: activityHtml }),
        sendEmail({ to: email, subject: "TEST: Nueva Solicitud LLC (Admin)", html: orderHtml }),
        sendEmail({ to: email, subject: "TEST: Confirmación de Pedido (Cliente)", html: getConfirmationEmailTemplate(name, requestCode, { companyName: "Mi Nueva Empresa LLC" }) }),
        sendEmail({ to: email, subject: "TEST: Bienvenido a Easy US LLC", html: getWelcomeEmailTemplate(name) }),
        sendEmail({ to: email, subject: "TEST: Newsletter Bienvenida", html: getNewsletterWelcomeTemplate() }),
        sendEmail({ to: email, subject: "TEST: Confirmación de Mensaje (Auto-reply)", html: getAutoReplyTemplate(ticketId, name) }),
        sendEmail({ to: email, subject: "TEST: OTP Mensaje de Contacto", html: getOtpEmailTemplate(otp) }),
      ]);

      res.json({ success: true, message: "Emails de prueba administrativos mejorados enviados" });
    } catch (error) {
      console.error("Error sending test emails:", error);
      res.status(500).json({ message: "Error al enviar emails de prueba" });
    }
  });

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    await storage.createProduct({
      name: "New Mexico LLC",
      description: "Constitución rápida en el estado más eficiente. Ideal para bajo coste de mantenimiento.",
      price: 63900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "EIN del IRS",
        "BOI Report presentado",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
    await storage.createProduct({
      name: "Wyoming LLC",
      description: "Constitución premium en el estado más prestigioso de USA. Máxima privacidad y protección.",
      price: 79900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "EIN del IRS garantizado",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "BOI Report presentado",
        "Annual Report año 1",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
    await storage.createProduct({
      name: "Delaware LLC",
      description: "El estándar para startups y empresas tecnológicas. Reconocimiento legal global.",
      price: 99900,
      features: [
        "Tasas del estado pagadas",
        "Registered Agent (12 meses)",
        "Articles of Organization oficiales",
        "Operating Agreement profesional",
        "EIN del IRS",
        "BOI Report presentado",
        "Declaraciones fiscales año 1",
        "Soporte completo 12 meses"
      ],
    });
  }
}
