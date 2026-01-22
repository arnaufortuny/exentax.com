import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertLlcApplicationSchema, users } from "@shared/schema";
import { db } from "./db";
import { sendEmail, getOtpEmailTemplate, getConfirmationEmailTemplate, getReminderEmailTemplate, getWelcomeEmailTemplate, getNewsletterWelcomeTemplate } from "./lib/email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

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
        await db.insert(users).values({
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
      });

      // Notification to admin about NEW ORDER
      await sendEmail({
        to: "afortuny07@gmail.com",
        subject: `NUEVO PEDIDO: ${product.name} - ${order.id}`,
        html: `
          <h1>Nuevo pedido recibido</h1>
          <p><strong>Pedido ID:</strong> ${order.id}</p>
          <p><strong>Producto:</strong> ${product.name}</p>
          <p><strong>Importe:</strong> ${(order.amount / 100).toFixed(2)}€</p>
          <p><strong>Usuario ID:</strong> ${userId}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        `,
      }).catch(err => console.error("Error sending admin order notification:", err));

      // Return order with application
      res.status(201).json({ ...order, application });

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
        sendEmail({
          to: updatedApp.ownerEmail,
          subject: `Confirmación de Solicitud - ${updatedApp.requestCode}`,
          html: getConfirmationEmailTemplate(
            updatedApp.ownerFullName || "Cliente",
            updatedApp.requestCode || "N/A",
            updatedApp
          ),
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

      // In a real app, we'd use storage, but for speed we'll do direct DB here if storage isn't updated
      await db.insert(require("@shared/schema").contactOtps).values({
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
      res.status(400).json({ message: "Error al enviar el código" });
    }
  });

  app.post("/api/contact/verify-otp", async (req, res) => {
    try {
      const { email, otp } = z.object({ email: z.string().email(), otp: z.string() }).parse(req.body);
      
      const { contactOtps } = require("@shared/schema");
      const { and, eq, gt } = require("drizzle-orm");

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

      const { contactOtps } = require("@shared/schema");
      const { and, eq } = require("drizzle-orm");

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

      // Notification to admin
      await sendEmail({
        to: "afortuny07@gmail.com",
        subject: `Nuevo mensaje de contacto: ${contactData.subject}`,
        html: `
          <h1>Nuevo mensaje de contacto</h1>
          <p><strong>De:</strong> ${contactData.nombre} ${contactData.apellido} (${contactData.email})</p>
          <p><strong>Asunto:</strong> ${contactData.subject}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${contactData.mensaje}</p>
          <hr />
          <p>ID de mensaje: #${messageId}</p>
        `,
      });

      // Confirmation to user
      await sendEmail({
        to: contactData.email,
        subject: `Confirmación de mensaje - Easy US LLC #${messageId}`,
        html: `
          <h1>Hemos recibido tu mensaje</h1>
          <p>Hola ${contactData.nombre},</p>
          <p>Gracias por contactar con Easy US LLC. Hemos recibido tu mensaje correctamente y te responderemos en menos de 24 horas.</p>
          <p><strong>Tu número de mensaje es: #${messageId}</strong></p>
          <br />
          <p>Saludos,</p>
          <p>El equipo de Easy US LLC</p>
        `,
      });

      res.json({ success: true, messageId });
    } catch (err) {
      console.error("Error processing contact form:", err);
      res.status(400).json({ message: "Error al procesar el mensaje" });
    }
  });

  // Seed Data
  await seedDatabase();

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
