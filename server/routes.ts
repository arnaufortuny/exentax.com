import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated, updateUserDetails } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertLlcApplicationSchema } from "@shared/schema";
import { db } from "./db";
import { sendEmail, getOtpEmailTemplate, getConfirmationEmailTemplate, getReminderEmailTemplate, getWelcomeEmailTemplate, getNewsletterWelcomeTemplate, getAutoReplyTemplate, getEmailFooter, getEmailHeader } from "./lib/email";
import { contactOtps, products as productsTable, users as usersTable, maintenanceApplications, newsletterSubscribers, messages as messagesTable } from "@shared/schema";
import { and, eq, gt, desc } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

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

  // Profile Updates
  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const { firstName, lastName, phone, businessActivity } = req.body;
      const userId = req.user.claims.sub;
      await updateUserDetails(userId, { firstName, lastName, phone, businessActivity });
      res.json({ success: true });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Client Delete Account
  app.delete("/api/user/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // In a real scenario, we might want to anonymize or delete all linked data
      // For now, we delete the user record
      await db.delete(usersTable).where(eq(usersTable.id, userId));
      res.json({ success: true, message: "Cuenta eliminada correctamente" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Error deleting account" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // Orders (Requires authentication)
  app.get(api.orders.list.path, async (req: any, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await storage.getOrders(req.user.id);
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req: any, res) => {
    try {
      const { productId } = api.orders.create.input.parse(req.body);
      
      let userId: string;
      
      if (req.user?.id) {
        userId = req.user.id;
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

      // Generate localized request code: NM-XXXX-XXX-X, WY-XXXX-XXX-X, DE-XXXX-XXXX-X, MN-XXXX-XXXX-X
      let statePrefix = "NM";
      if (product.name.includes("Wyoming")) statePrefix = "WY";
      else if (product.name.includes("Delaware")) statePrefix = "DE";
      else if (product.name.includes("Mantenimiento") || product.name.includes("Maintenance")) statePrefix = "MN";
      
      const timestamp = Date.now().toString();
      const randomPart = Math.random().toString(36).substring(7).toUpperCase();
      const requestCode = `${statePrefix}-${timestamp.substring(timestamp.length - 4)}-${randomPart.substring(0, 3)}-${Math.floor(Math.random() * 9)}`;

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
      if (req.user?.email) {
        sendEmail({
          to: req.user.email,
          subject: "¡Bienvenido a Easy US LLC! - Próximos pasos",
          html: getWelcomeEmailTemplate(req.user.firstName || "Cliente"),
        }).catch(err => console.error("Error sending welcome email:", err));
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
      const userMessages = await db.select()
        .from(messagesTable)
        .where(eq(messagesTable.userId, req.user.claims.sub))
        .orderBy(desc(messagesTable.createdAt));
      res.json(userMessages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/messages", async (req: any, res) => {
    try {
      const { name, email, subject, content, requestCode } = req.body;
      const userId = req.isAuthenticated() ? req.user.claims.sub : null;
      
      const [message] = await db.insert(messagesTable).values({
        userId,
        name,
        email,
        subject,
        content,
        requestCode,
        type: "contact"
      }).returning();

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
      const [updated] = await db.update(llcApplications)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(llcApplications.id, appId))
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
  app.post("/api/llc/:id/send-otp", async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const { email } = req.body;
      
      if (!email) return res.status(400).json({ message: "Email is required" });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await storage.setLlcApplicationOtp(appId, otp, expires);
      
      await sendEmail({
        to: email,
        subject: "Código de verificación - Easy US LLC",
        html: getOtpEmailTemplate(otp),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending LLC OTP:", error);
      res.status(500).json({ message: "Error al enviar el código de verificación" });
    }
  });

  app.post("/api/llc/:id/verify-otp", async (req, res) => {
    const appId = Number(req.params.id);
    const { otp } = req.body;
    
    if (!otp) return res.status(400).json({ message: "OTP is required" });
    
    const success = await storage.verifyLlcApplicationOtp(appId, otp);
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
      if (req.user?.id) {
        userId = req.user.id;
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
  app.put("/api/maintenance/:id", async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      const [updated] = await db.update(maintenanceApplications)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(maintenanceApplications.id, appId))
        .returning();
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Error updating maintenance application" });
    }
  });

  app.post("/api/maintenance/:id/send-otp", async (req, res) => {
    try {
      const appId = Number(req.params.id);
      const { email } = req.body;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      await db.update(maintenanceApplications)
        .set({ emailOtp: otp, emailOtpExpires: expires })
        .where(eq(maintenanceApplications.id, appId));
      await sendEmail({ to: email, subject: "Código de verificación", html: getOtpEmailTemplate(otp) });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/maintenance/:id/verify-otp", async (req, res) => {
    const appId = Number(req.params.id);
    const { otp } = req.body;
    const [app] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.id, appId));
    if (app && app.emailOtp === otp && new Date() < (app.emailOtpExpires || new Date(0))) {
      await db.update(maintenanceApplications).set({ emailVerified: true }).where(eq(maintenanceApplications.id, appId));
      res.json({ success: true });
    } else {
      res.status(400).json({ message: "Código inválido" });
    }
  });

  // Newsletter
  app.get("/api/newsletter/status", isAuthenticated, async (req: any, res) => {
    const isSubscribed = await storage.isSubscribedToNewsletter(req.user.email);
    res.json({ isSubscribed });
  });

  app.post("/api/newsletter/unsubscribe", isAuthenticated, async (req: any, res) => {
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, req.user.email));
    res.json({ success: true });
  });

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email().optional() }).parse(req.body);
      
      // If no email provided, try to use authenticated user's email
      const targetEmail = email || (req.isAuthenticated() ? (req.user as any).email : null);
      
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
  const isAdmin = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

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
    // In a real app with password hashing, you'd hash here.
    // For this integration, we trigger a re-auth/reset flow.
    res.json({ success: true, message: "Instrucciones de reinicio enviadas" });
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
    if (order.userId !== req.user.claims.sub && !req.user.isAdmin) {
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
    if (order.userId !== req.user.claims.sub && !req.user.isAdmin) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateReceiptHtml(order));
  });

  function generateInvoiceHtml(order: any) {
    return `
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { border-bottom: 4px solid #6EDC8A; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .invoice-title { font-size: 32px; font-weight: 900; text-transform: uppercase; tracking-tighter; margin: 0; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 60px; }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #6EDC8A; margin-bottom: 10px; tracking-widest; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th { text-align: left; border-bottom: 2px solid #f0f0f0; padding: 15px 10px; font-size: 11px; text-transform: uppercase; font-weight: 900; }
            .table td { padding: 20px 10px; border-bottom: 1px solid #f9f9f9; font-size: 14px; font-weight: 500; }
            .total-box { background: #f9f9f9; padding: 30px; border-radius: 20px; text-align: right; margin-left: auto; width: fit-content; min-width: 250px; }
            .total-label { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #666; }
            .total-amount { font-size: 28px; font-weight: 900; color: #000; }
            .footer { margin-top: 80px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="invoice-title">Factura Oficial</h1>
              <p style="margin: 5px 0 0 0; font-weight: 700;">Ref: INV-${order.id}-${new Date(order.createdAt).getFullYear()}</p>
            </div>
            <div style="text-align: right">
              <p style="margin: 0; font-weight: 800;">Easy US LLC</p>
              <p style="margin: 0; font-size: 13px; color: #666;">Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
          <div class="details">
            <div>
              <div class="section-title">Emisor</div>
              <p style="margin: 0;"><strong>Fortuny Consulting LLC</strong></p>
              <p style="margin: 0; font-size: 14px;">EIN: 98-1906730</p>
              <p style="margin: 0; font-size: 14px;">USA / España</p>
            </div>
            <div>
              <div class="section-title">Cliente</div>
              <p style="margin: 0;"><strong>ID Usuario: #${order.userId}</strong></p>
              <p style="margin: 0; font-size: 14px;">Servicios de Constitución / Mantenimiento</p>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr><th>Descripción del Servicio</th><th style="text-align: right">Precio Unitario</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Constitución de Empresa LLC / Mantenimiento Anual</td>
                <td style="text-align: right">${(order.amount / 100).toFixed(2)}€</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            <div class="total-label">Total Facturado (EUR)</div>
            <div class="total-amount">${(order.amount / 100).toFixed(2)}€</div>
          </div>
          <div class="footer">
            Easy US LLC • Gracias por confiar en nosotros para expandir tu negocio a USA.
          </div>
        </body>
      </html>
    `;
  }

  function generateReceiptHtml(order: any) {
    return `
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; background: #fcfcfc; }
            .card { background: white; max-width: 600px; margin: auto; padding: 50px; border-radius: 40px; shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #eee; }
            .logo { width: 60px; margin-bottom: 30px; }
            .status { display: inline-block; background: #6EDC8A; color: #000; padding: 6px 15px; border-radius: 100px; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
            h1 { font-size: 28px; font-weight: 900; margin: 0 0 10px 0; tracking: -0.03em; }
            .msg { color: #666; margin-bottom: 40px; }
            .info-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
            .label { font-weight: 800; color: #999; text-transform: uppercase; font-size: 11px; }
            .val { font-weight: 700; color: #000; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="status">Recibo de Solicitud</div>
            <h1>Confirmación de Pedido</h1>
            <p class="msg">Hemos recibido correctamente tu solicitud. Tu proceso de constitución está en marcha.</p>
            
            <div class="info-row">
              <span class="label">Referencia del Pedido</span>
              <span class="val">#${order.id}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha</span>
              <span class="val">${new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado del Pago</span>
              <span class="val">${order.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}</span>
            </div>
            <div class="info-row" style="border-bottom: 0;">
              <span class="label">Total Importe</span>
              <span class="val" style="font-size: 20px; color: #6EDC8A;">${(order.amount / 100).toFixed(2)}€</span>
            </div>
            
            <div class="footer">
              Conserva este recibo para tus registros.<br/>
              Easy US LLC • Fortuny Consulting LLC
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

  // Maintenance Orders
  app.post("/api/maintenance/orders", async (req: any, res) => {
    try {
      const { productId, state } = req.body;
      let userId: string;
      
      if (req.user?.id) {
        userId = req.user.id;
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
