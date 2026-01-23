import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertLlcApplicationSchema } from "@shared/schema";
import { db } from "./db";
import { sendEmail, getOtpEmailTemplate, getConfirmationEmailTemplate, getReminderEmailTemplate, getWelcomeEmailTemplate, getNewsletterWelcomeTemplate, getAutoReplyTemplate, getEmailFooter, getEmailHeader } from "./lib/email";
import { contactOtps, products as productsTable, users as usersTable } from "@shared/schema";
import { and, eq, gt } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Activity Tracking ===
  app.post("/api/activity/track", async (req, res) => {
    const { action, details } = req.body;
    
    if (action === "CLICK_ELEGIR_ESTADO") {
      sendEmail({
        to: "afortuny07@gmail.com",
        subject: `ACTIVIDAD: Usuario seleccionó estado - ${details}`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                <h1 style="color: #000000; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">Log de Actividad</h1>
                <p style="color: #999; margin: 5px 0 0 0; font-size: 10px; font-weight: 700; text-transform: uppercase;">Easy US LLC - Monitor de Sistema</p>
              </div>
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Usuario Seleccionó Estado</h2>
                <div style="background: #f4f4f4; border-left: 4px solid #000; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Acción:</strong> Clic en botón elegir</p>
                  <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Detalles:</strong> ${details}</p>
                </div>
                <p style="font-size: 12px; color: #999;">IP Origen: ${req.ip} | Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `,
      }).catch(err => console.error("Error sending activity email:", err));
    }
    
    res.json({ success: true });
  });

  // === API Routes ===

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
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

      // Create the order
      const order = await storage.createOrder({
        userId,
        productId,
        amount: product.price,
        status: "pending",
        stripeSessionId: "mock_session_" + Date.now(),
      });

      // Create an empty application linked to the order
      const application = await storage.createLlcApplication({
        orderId: order.id,
        status: "draft",
        state: "New Mexico", // Default state or extract from context
      });

      // Generate localized request code: NM-XXXX-XXX-X, WY-XXXX-XXX-X, DE-XXXX-XXXX-X
      const statePrefix = "NM"; // Default for NM
      const timestamp = Date.now().toString();
      const randomPart = Math.random().toString(36).substring(7).toUpperCase();
      const requestCode = `${statePrefix}-${timestamp.substring(timestamp.length - 4)}-${randomPart.substring(0, 3)}-${Math.floor(Math.random() * 9)}`;

      const updatedApplication = await storage.updateLlcApplication(application.id, { requestCode });

      // Notification to admin about NEW ORDER
      sendEmail({
        to: "afortuny07@gmail.com",
        subject: `[PEDIDO] ${product.name} - ${requestCode}`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              ${getEmailHeader()}
              <div style="padding: 40px;">
                <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #000;">Nuevo Pedido Recibido</h2>
                <div style="background: #f4f4f4; border-left: 4px solid #000; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Referencia:</strong> ${requestCode}</p>
                  <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Producto:</strong> ${product.name}</p>
                  <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Importe:</strong> ${(order.amount / 100).toFixed(2)}€</p>
                  <p style="margin: 0; font-size: 14px;"><strong>Usuario:</strong> ${userId}</p>
                </div>
                <p style="font-size: 12px; color: #999;">IP Origen: ${req.ip} | Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `,
      }).catch(err => console.error("Error sending admin order notification:", err));

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

  // LLC Applications (Public for this demo)
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
        // Notification to admin
        sendEmail({
          to: "afortuny07@gmail.com",
          subject: `NUEVA SOLICITUD LLC: ${updatedApp.companyName} - ${orderIdentifier}`,
          html: `
            <div style="background-color: #f9f9f9; padding: 20px 0;">
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
                <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                  <h1 style="color: #000000; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">Log de Sistema: Nueva Solicitud</h1>
                  <p style="color: #999; margin: 5px 0 0 0; font-size: 10px; font-weight: 700; text-transform: uppercase;">REF: ${orderIdentifier}</p>
                </div>
                <div style="padding: 40px;">
                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Estado de la Transacción</h3>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Estado Pago:</strong> <span style="color: #0d9488; font-weight: 700;">CONFIRMADO / COMPLETADO</span></p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Fecha/Hora:</strong> ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Aceptación Términos:</strong> SÍ (Confirmado)</p>
                  </div>

                  <div style="margin-bottom: 25px;">
                    <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Información del Propietario</h3>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre completo:</strong> ${updatedApp.ownerFullName}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>DNI / Pasaporte:</strong> ${updatedApp.ownerIdNumber || 'No proporcionado'}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> ${updatedApp.ownerEmail}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Teléfono:</strong> ${updatedApp.ownerPhone}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Dirección:</strong> ${updatedApp.ownerStreetType} ${updatedApp.ownerAddress}, ${updatedApp.ownerPostalCode}, ${updatedApp.ownerCity} (${updatedApp.ownerProvince}), ${updatedApp.ownerCountry}</p>
                  </div>

                  <div>
                    <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Detalles de la Empresa</h3>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre LLC (Opción 1):</strong> ${updatedApp.companyName}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre LLC (Opción 2):</strong> ${updatedApp.companyNameOption2}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Estado de Registro:</strong> ${updatedApp.state}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Categoría:</strong> ${updatedApp.businessCategory === "Otra (especificar)" ? updatedApp.businessCategoryOther : updatedApp.businessCategory}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Actividad Principal:</strong> ${updatedApp.companyDescription}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Notas Adicionales:</strong> ${updatedApp.notes || "Ninguna"}</p>
                  </div>
                </div>
                <div style="background-color: #fafafa; padding: 40px 20px; text-align: center; color: #666; font-family: 'Inter', Arial, sans-serif; border-top: 1px solid #f0f0f0;">
                  <p style="margin: 0 0 15px 0; font-weight: 800; color: #000; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Expertos en formación de LLC</p>
                  <p style="margin: 0; font-size: 12px; color: #888; font-weight: 500;">New Mexico, USA | <a href="mailto:info@easyusllc.com" style="color: #000; text-decoration: none; font-weight: 700;">info@easyusllc.com</a></p>
                  <p style="margin-top: 25px; font-size: 9px; color: #bbb; text-transform: uppercase; letter-spacing: 1px;">© ${new Date().getFullYear()} Easy US LLC. Todos los derechos reservados.</p>
                </div>
              </div>
            </div>
          `,
        }).catch(err => console.error("Error sending admin notification:", err));

      // Confirmation to client with full info
        sendEmail({
          to: updatedApp.ownerEmail,
          subject: `Confirmación de Solicitud ${orderIdentifier} - Easy US LLC`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <div style="max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
                <div style="background: #000; color: #d9ff00; padding: 40px; text-align: center;">
                  <h1 style="margin: 0; text-transform: uppercase;">Solicitud Recibida</h1>
                  <p style="margin: 10px 0 0 0; font-weight: bold;">PEDIDO ${orderIdentifier}</p>
                </div>
                <div style="padding: 40px;">
                  <p>Hola <strong>${updatedApp.ownerFullName}</strong>,</p>
                  <p>Hemos recibido correctamente tu solicitud para formar tu nueva LLC en <strong>${updatedApp.state}</strong>.</p>
                  
                  <div style="background: #f9f9f9; padding: 25px; border-radius: 15px; margin: 30px 0;">
                    <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #999;">Resumen de tu empresa</h3>
                    <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #000;">${updatedApp.companyName}</p>
                    <p style="margin: 0; font-size: 14px; color: #666;">${updatedApp.businessCategory}</p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold;">Número de pedido: ${orderIdentifier}</p>
                  </div>

                  <p>Nuestro equipo de expertos revisará la disponibilidad del nombre y comenzará con el registro oficial de inmediato.</p>
                  <p>Te mantendremos informado sobre cada paso del proceso.</p>
                  
                  <div style="margin-top: 40px; text-align: center;">
                    <a href="https://wa.me/34614916910" style="background: #d9ff00; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; text-transform: uppercase; font-size: 12px;">Soporte WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>
          `,
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

  // Newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const isSubscribed = await storage.isSubscribedToNewsletter(email);
      if (isSubscribed) {
        return res.status(400).json({ message: "Este email ya está suscrito" });
      }

      await storage.subscribeToNewsletter(email);
      
      await sendEmail({
        to: email,
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

      const messageId = Math.floor(100000 + Math.random() * 900000);
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

      // Notification to admin
      sendEmail({
        to: "afortuny07@gmail.com",
        subject: `[${contactData.subject.toUpperCase()}] ID#${messageId}`,
        html: `
          <div style="background-color: #f9f9f9; padding: 20px 0;">
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
              <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                <h1 style="color: #000000; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;">Log de Sistema: Acción Contacto</h1>
                <p style="color: #999; margin: 5px 0 0 0; font-size: 10px; font-weight: 700; text-transform: uppercase;">ID MENSAJE: #${messageId}</p>
              </div>
              <div style="padding: 40px;">
                <div style="margin-bottom: 25px;">
                  <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Datos del Usuario</h3>
                  <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre:</strong> ${contactData.nombre} ${contactData.apellido}</p>
                  <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> ${contactData.email}</p>
                  <p style="margin: 0; font-size: 14px;"><strong>IP:</strong> ${clientIp}</p>
                </div>
                <div>
                  <h3 style="font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; font-weight: 800;">Contenido del Mensaje</h3>
                  <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Asunto:</strong> ${contactData.subject}</p>
                  <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; border-left: 5px solid #000; font-size: 14px; line-height: 1.6;">
                    ${contactData.mensaje.replace(/\n/g, '<br>') || '<em>Sin contenido</em>'}
                  </div>
                </div>
                <p style="font-size: 12px; color: #999; margin-top: 25px;">Fecha: ${timestamp} (Madrid)</p>
              </div>
              ${getEmailFooter()}
            </div>
          </div>
        `,
      }).catch(err => console.error("Error sending admin contact notification:", err));

      // Confirmation to user
      const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString();
      await sendEmail({
        to: contactData.email,
        subject: `Confirmación de mensaje - Easy US LLC #${ticketId}`,
        html: getAutoReplyTemplate(ticketId, contactData.nombre),
      });

      res.json({ success: true, messageId, ticketId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error al procesar el mensaje" });
    }
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

      // Improved Admin Order/Contact Notification
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
