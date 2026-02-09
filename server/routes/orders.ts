import type { Express } from "express";
import { z } from "zod";
import { eq, desc, sql, and, gt } from "drizzle-orm";
import { db, storage, isAuthenticated, logAudit, getClientIp, logActivity, isIpBlockedFromOrders, trackOrderByIp } from "./shared";
import { api } from "@shared/routes";
import { contactOtps, users as usersTable, orderEvents, userNotifications, orders as ordersTable, llcApplications as llcApplicationsTable, maintenanceApplications, discountCodes } from "@shared/schema";
import { sendEmail, getWelcomeEmailTemplate } from "../lib/email";
import { EmailLanguage, getWelcomeEmailSubject } from "../lib/email-translations";
import { generateOrderInvoice } from "../lib/pdf-generator";

export function registerOrderRoutes(app: Express) {
  // Orders (Requires authentication)
  app.get(api.orders.list.path, async (req: any, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await storage.getOrders(req.session.userId);
    res.json(orders);
  });

  // Invoices
  app.get("/api/orders/:id/invoice", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order || (order.userId !== req.session.userId && !req.session.isAdmin && !req.session.isSupport)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const [llcApp] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.orderId, orderId)).limit(1);
      const [maintApp] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.orderId, orderId)).limit(1);
      const activeAccounts = await storage.getActivePaymentAccounts();

      const pdfBuffer = await generateOrderInvoice({
        order: {
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          amount: order.amount,
          originalAmount: order.originalAmount,
          discountCode: order.discountCode,
          discountAmount: order.discountAmount,
          currency: order.currency || 'EUR',
          status: order.status,
          createdAt: order.createdAt
        },
        product: {
          name: order.product?.name || 'Servicio LLC',
          description: order.product?.description || '',
          features: order.product?.features as string[] || []
        },
        user: {
          firstName: order.user?.firstName,
          lastName: order.user?.lastName,
          email: order.user?.email || ''
        },
        application: llcApp || null,
        maintenanceApplication: maintApp || null,
        paymentLink: order.paymentLink || undefined,
        bankAccounts: activeAccounts.map(a => ({ label: a.label, holder: a.holder, bankName: a.bankName, accountType: a.accountType, accountNumber: a.accountNumber, routingNumber: a.routingNumber, iban: a.iban, swift: a.swift, address: a.address }))
      });
      
      const invoiceNumber = llcApp?.requestCode || maintApp?.requestCode || order.invoiceNumber || `INV-${orderId}`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Factura-${invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Invoice Error:", error);
      res.status(500).send("Error generating invoice");
    }
  });
  app.post(api.orders.create.path, async (req: any, res) => {
    try {
      const { productId, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      
      // Check IP-based order creation limit first
      const clientIp = getClientIp(req);
      const ipCheck = isIpBlockedFromOrders(clientIp);
      if (ipCheck.blocked) {
        logAudit({ action: 'ip_order_blocked', details: { ip: clientIp, ordersCount: ipCheck.ordersCount } });
        return res.status(429).json({ 
          message: "Request limit reached from this connection. Please try again later or contact support.",
          code: "IP_ORDER_LIMIT"
        });
      }
      
      // Parse productId
      const parsedInput = api.orders.create.input.parse({ productId });
      
      let userId: string;
      let isNewUser = false;
      
      if (req.session?.userId) {
        // User already authenticated
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === 'pending' || currentUser.accountStatus === 'deactivated')) {
          return res.status(403).json({ message: "Your account is under review or deactivated. You cannot place new orders at this time." });
        }
        userId = req.session.userId;
      } else {
        // Require email, password and OTP verification for new users
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required to place an order." });
        }
        
        if (password.length < 8) {
          return res.status(400).json({ message: "Password must be at least 8 characters." });
        }
        
        // Check if email already exists
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
        if (existingUser) {
          return res.status(400).json({ message: "This email is already registered. Please log in." });
        }
        
        // Verify that email has been verified via OTP
        const [otpRecord] = await db.select()
          .from(contactOtps)
          .where(
            and(
              eq(contactOtps.email, email),
              eq(contactOtps.otpType, "account_verification"),
              eq(contactOtps.verified, true),
              gt(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1000)) // Allow 30 min window after verification
            )
          )
          .orderBy(sql`${contactOtps.expiresAt} DESC`)
          .limit(1);
        
        if (!otpRecord) {
          return res.status(400).json({ message: "Please verify your email before continuing." });
        }
        
        // Create new user with verified email and password
        const { hashPassword } = await import("../lib/auth-service");
        const { generateUniqueClientId } = await import("../lib/id-generator");
        const passwordHash = await hashPassword(password);
        const clientId = await generateUniqueClientId();
        const nameParts = ownerFullName?.split(' ') || ['Cliente'];
        
        const [newUser] = await db.insert(usersTable).values({
          email,
          passwordHash,
          clientId,
          firstName: nameParts[0] || 'Cliente',
          lastName: nameParts.slice(1).join(' ') || '',
          emailVerified: true,
          accountStatus: 'active',
        }).returning();
        
        userId = newUser.id;
        isNewUser = true;
        
        // Set session for the new user
        req.session.userId = userId;
        
        const oLang = (req.body.preferredLanguage || 'es') as EmailLanguage;
        sendEmail({
          to: email,
          subject: getWelcomeEmailSubject(oLang),
          html: getWelcomeEmailTemplate(nameParts[0] || undefined, oLang)
        }).catch(console.error);
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }

      // CRITICAL: Ensure pricing follows NM 739€, WY 899€, DE 1399€
      let finalPrice = product.price;
      if (product.name.includes("New Mexico")) finalPrice = 73900;
      else if (product.name.includes("Wyoming")) finalPrice = 89900;
      else if (product.name.includes("Delaware")) finalPrice = 139900;

      // Calculate final amount with discount
      let originalAmount = finalPrice;
      let appliedDiscountAmount = 0;
      let appliedDiscountCode: string | null = null;
      
      if (discountCode && discountAmount) {
        appliedDiscountCode = discountCode;
        appliedDiscountAmount = discountAmount;
        finalPrice = Math.max(0, finalPrice - discountAmount);
        
        // Increment used count for the discount code
        await db.update(discountCodes)
          .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
          .where(eq(discountCodes.code, discountCode.toUpperCase()));
      }

      // Create the order
      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        originalAmount: appliedDiscountCode ? originalAmount : null,
        discountCode: appliedDiscountCode,
        discountAmount: appliedDiscountAmount || null,
        status: "pending",
        stripeSessionId: "mock_session_" + Date.now(),
      });

      await db.insert(orderEvents).values({
        orderId: order.id,
        eventType: "i18n:dashboard.tracking.orderReceived",
        description: `i18n:ntf.orderCreated.message::{"productName":"${product.name}"}`,
        createdBy: userId
      });

      // Create an empty application linked to the order
      const application = await storage.createLlcApplication({
        orderId: order.id,
        status: "draft",
        state: product.name.split(" ")[0], // Extract state name correctly
      });

      // NOTIFICATION: New order created (translated on frontend via i18n keys)
      if (userId && !userId.startsWith('guest_')) {
        await db.insert(userNotifications).values({
          userId,
          orderId: order.id,
          orderCode: application.requestCode || order.invoiceNumber,
          title: 'i18n:ntf.orderCreated.title',
          message: `i18n:ntf.orderCreated.message::{"productName":"${product.name}"}`,
          type: 'info',
          isRead: false
        });
      }

      // Generate unified request code: STATE-8digits (e.g., NM-12345678)
      const { generateUniqueOrderCode } = await import("../lib/id-generator");
      const appState = product.name.split(" ")[0] || 'New Mexico';
      const requestCode = await generateUniqueOrderCode(appState);

      const updatedApplication = await storage.updateLlcApplication(application.id, { requestCode });

      // Track IP for order creation limiting
      trackOrderByIp(clientIp);
      
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
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Error creating order:", err);
      return res.status(500).json({ message: "Error creating order" });
    }
  });

  // Order Events Timeline
  app.get("/api/orders/:id/events", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const events = await db.select().from(orderEvents)
        .where(eq(orderEvents.orderId, orderId))
        .orderBy(desc(orderEvents.createdAt));
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching order events:", error);
      res.status(500).json({ message: "Error fetching events" });
    }
  });
}
