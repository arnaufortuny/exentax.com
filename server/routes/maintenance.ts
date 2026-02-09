import type { Express } from "express";
import { eq, and, gt, sql } from "drizzle-orm";
import { db, storage, isAuthenticated, logAudit, getClientIp, logActivity, isIpBlockedFromOrders, trackOrderByIp, detectSuspiciousOrderActivity, flagAccountForReview } from "./shared";
import { contactOtps, users as usersTable, orders as ordersTable, maintenanceApplications, discountCodes, userNotifications } from "@shared/schema";
import { sendEmail, getWelcomeEmailTemplate, getConfirmationEmailTemplate, getAdminMaintenanceOrderTemplate, getAccountPendingVerificationTemplate } from "../lib/email";
import { EmailLanguage, getVerifyEmailSubject, getWelcomeEmailSubject } from "../lib/email-translations";

export function registerMaintenanceRoutes(app: Express) {
  // Claim maintenance order endpoint
  app.post("/api/maintenance/claim-order", async (req: any, res) => {
    try {
      const { applicationId, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      
      if (!applicationId || !email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
      }
      
      // Check if email already exists
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (existingUser) {
        // Check if account is deactivated
        if (existingUser.isActive === false || existingUser.accountStatus === 'deactivated') {
          return res.status(403).json({ 
            message: "Your account has been deactivated. Contact our support team for more information.",
            code: "ACCOUNT_DEACTIVATED"
          });
        }
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
            gt(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1000))
          )
        )
        .orderBy(sql`${contactOtps.expiresAt} DESC`)
        .limit(1);
      
      if (!otpRecord) {
        return res.status(400).json({ message: "Please verify your email before continuing." });
      }
      
      // Get the maintenance application to find the order
      const [application] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.id, applicationId)).limit(1);
      if (!application) {
        return res.status(404).json({ message: "Request not found." });
      }
      
      // Create new user with verified email
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
      
      // Update the order to associate with the new user and apply discount
      const orderUpdate: any = { userId: newUser.id };
      if (discountCode && discountAmount) {
        orderUpdate.discountCode = discountCode;
        orderUpdate.discountAmount = discountAmount;
        // Increment discount code usage
        await db.update(discountCodes)
          .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
          .where(eq(discountCodes.code, discountCode));
      }
      await db.update(ordersTable)
        .set(orderUpdate)
        .where(eq(ordersTable.id, application.orderId));
      
      // Update maintenance application with paymentMethod if provided
      if (paymentMethod) {
        await db.update(maintenanceApplications)
          .set({ paymentMethod })
          .where(eq(maintenanceApplications.id, applicationId));
      }
      
      // Set session for the new user
      req.session.userId = newUser.id;
      
      const claimLang = (req.body.preferredLanguage || 'es') as EmailLanguage;
      sendEmail({
        to: email,
        subject: getWelcomeEmailSubject(claimLang),
        html: getWelcomeEmailTemplate(nameParts[0] || undefined, claimLang)
      }).catch(console.error);
      
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error("Error claiming maintenance order:", error);
      res.status(500).json({ message: "Error creating account." });
    }
  });

  app.post("/api/maintenance/orders", async (req: any, res) => {
    try {
      const { productId, state, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      
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
      
      let userId: string;
      let isNewUser = false;
      
      if (req.session?.userId) {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (currentUser && (currentUser.accountStatus === 'pending' || currentUser.accountStatus === 'deactivated')) {
          return res.status(403).json({ message: "Your account is under review or deactivated. You cannot place new orders at this time." });
        }
        
        // Check for suspicious order creation activity
        const suspiciousCheck = await detectSuspiciousOrderActivity(req.session.userId);
        if (suspiciousCheck.suspicious) {
          await flagAccountForReview(req.session.userId, suspiciousCheck.reason || 'Suspicious order activity');
          return res.status(403).json({ 
            message: "Your account has been placed under review due to unusual activity. Our team will review it soon.",
            code: "ACCOUNT_UNDER_REVIEW"
          });
        }
        
        userId = req.session.userId;
      } else {
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required to place an order." });
        }
        
        if (password.length < 8) {
          return res.status(400).json({ message: "Password must be at least 8 characters." });
        }
        
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
        if (existingUser) {
          return res.status(400).json({ message: "This email is already registered. Please log in." });
        }
        
        // Check if email was verified via OTP
        const [otpRecord] = await db.select()
          .from(contactOtps)
          .where(
            and(
              eq(contactOtps.email, email),
              eq(contactOtps.otpType, "account_verification"),
              eq(contactOtps.verified, true),
              gt(contactOtps.expiresAt, new Date(Date.now() - 30 * 60 * 1000))
            )
          )
          .orderBy(sql`${contactOtps.expiresAt} DESC`)
          .limit(1);
        
        // If OTP not verified, create account in "pending" status (needs email verification)
        const isEmailVerified = !!otpRecord;
        const accountStatus = isEmailVerified ? 'active' : 'pending';
        
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
          emailVerified: isEmailVerified,
          accountStatus: accountStatus,
        }).returning();
        
        userId = newUser.id;
        isNewUser = true;
        req.session.userId = userId;
        
        const mLang = (req.body.preferredLanguage || 'es') as EmailLanguage;
        if (isEmailVerified) {
          sendEmail({
            to: email,
            subject: getWelcomeEmailSubject(mLang),
            html: getWelcomeEmailTemplate(nameParts[0] || undefined, mLang)
          }).catch(console.error);
        } else {
          sendEmail({
            to: email,
            subject: getVerifyEmailSubject(mLang),
            html: getAccountPendingVerificationTemplate(nameParts[0] || undefined, mLang)
          }).catch(console.error);
        }
      }

      const product = await storage.getProduct(productId);
      if (!product) return res.status(400).json({ message: "Invalid product" });

      // State-specific pricing for maintenance: NM 539€, WY 699€, DE 999€
      let finalPrice = product.price;
      if (state?.includes("New Mexico")) finalPrice = 53900;
      else if (state?.includes("Wyoming")) finalPrice = 69900;
      else if (state?.includes("Delaware")) finalPrice = 99900;

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

      const order = await storage.createOrder({
        userId,
        productId,
        amount: finalPrice,
        originalAmount: appliedDiscountCode ? originalAmount : null,
        discountCode: appliedDiscountCode,
        discountAmount: appliedDiscountAmount || null,
        status: "pending",
        stripeSessionId: "mock_session_maint_" + Date.now(),
      });

      const [application] = await db.insert(maintenanceApplications).values({
        orderId: order.id,
        status: "draft",
        state: state || product.name.split(" ")[0],
      }).returning();

      // Generate unified request code: STATE-8digits (e.g., NM-12345678)
      const { generateUniqueOrderCode } = await import("../lib/id-generator");
      const appState = state || product.name.split(" ")[0] || 'New Mexico';
      const requestCode = await generateUniqueOrderCode(appState);

      await db.update(maintenanceApplications)
        .set({ requestCode })
        .where(eq(maintenanceApplications.id, application.id));

      // NOTIFICATION: New maintenance order (translated on frontend via i18n keys)
      if (userId && !userId.startsWith('guest_')) {
        await db.insert(userNotifications).values({
          userId,
          orderId: order.id,
          orderCode: requestCode,
          title: 'i18n:ntf.maintenanceSubmitted.title',
          message: `i18n:ntf.maintenanceSubmitted.message::{"requestCode":"${requestCode}"}`,
          type: 'info',
          isRead: false
        });
      }

      // Track IP for order creation limiting
      trackOrderByIp(clientIp);

      res.status(201).json({ ...order, application: { ...application, requestCode } });
    } catch (err) {
      console.error("Error creating maintenance order:", err);
      res.status(500).json({ message: "Error creating maintenance order" });
    }
  });

  // Maintenance App Updates - Protected with ownership verification
  app.put("/api/maintenance/:id", isAuthenticated, async (req: any, res) => {
    try {
      const appId = Number(req.params.id);
      const updates = req.body;
      
      // First, get the application to verify ownership
      const [existingApp] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.id, appId)).limit(1);
      
      if (!existingApp) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // Verify ownership through the order
      if (existingApp.orderId) {
        const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, existingApp.orderId)).limit(1);
        if (order && order.userId && order.userId !== req.session.userId && !req.session.isAdmin) {
          return res.status(403).json({ message: "Not authorized" });
        }
      }
      
      const [updatedApp] = await db.update(maintenanceApplications)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(maintenanceApplications.id, appId))
        .returning();
      
      if (!updatedApp) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      if (updates.status === "submitted") {
        const orderIdentifier = updatedApp.requestCode || `MN-${updatedApp.id}`;
        
        // Get order info for price
        const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, updatedApp.orderId)).limit(1);
        const orderAmount = order ? (order.amount / 100).toFixed(2) : 'N/A';
        
        // Email notification to admin about completed maintenance order
        const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
        const maintPaymentMethodLabel = updatedApp.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : updatedApp.paymentMethod === 'link' ? 'Link de Pago' : 'No especificado';
        
        sendEmail({
          to: adminEmail,
          subject: `[PEDIDO REALIZADO] ${orderIdentifier} - Mantenimiento ${updatedApp.companyName}`,
          html: getAdminMaintenanceOrderTemplate({
            orderIdentifier,
            amount: orderAmount,
            paymentMethod: maintPaymentMethodLabel,
            ownerFullName: updatedApp.ownerFullName || undefined,
            ownerEmail: updatedApp.ownerEmail || undefined,
            ownerPhone: updatedApp.ownerPhone || undefined,
            companyName: updatedApp.companyName || undefined,
            ein: updatedApp.ein || undefined,
            state: updatedApp.state || undefined,
            creationSource: updatedApp.creationSource || undefined,
            creationYear: updatedApp.creationYear || undefined,
            bankAccount: updatedApp.bankAccount || undefined,
            paymentGateway: updatedApp.paymentGateway || undefined,
            businessActivity: updatedApp.businessActivity || undefined,
            expectedServices: updatedApp.expectedServices || undefined,
            wantsDissolve: updatedApp.wantsDissolve || undefined,
            notes: updatedApp.notes || undefined
          })
        }).catch(() => {});
        
        // Confirmation to client
        if (updatedApp.ownerEmail) {
          sendEmail({
            to: updatedApp.ownerEmail,
            subject: `Solicitud recibida - Referencia ${orderIdentifier}`,
            html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName || undefined, serviceType: "Mantenimiento Anual" }),
          }).catch(() => {});
        }
      }
      
      res.json(updatedApp);
    } catch (error) {
      res.status(500).json({ message: "Error updating request" });
    }
  });
}
