import type { Express } from "express";
import { z } from "zod";
import { and, eq, gt, desc, sql, inArray } from "drizzle-orm";
import { db, storage, isAuthenticated, isAdmin, logAudit, getClientIp, logActivity } from "./shared";
import { contactOtps, users as usersTable, userNotifications, orders as ordersTable, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable } from "@shared/schema";
import { sendEmail, getOtpEmailTemplate, getWelcomeEmailTemplate, getPasswordChangeOtpTemplate, getProfileChangeOtpTemplate, getAdminProfileChangesTemplate } from "../lib/email";
import { getEmailTranslations, EmailLanguage, getOtpSubject } from "../lib/email-translations";
import { checkRateLimit } from "../lib/security";
import { getUpcomingDeadlinesForUser } from "../calendar-service";

export function registerUserProfileRoutes(app: Express) {
  // Get completed LLCs for user (for Operating Agreement generator)
  app.get("/api/user/completed-llcs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Join LLC applications with orders to ensure ownership at DB level
      const llcApps = await db.select({
        id: llcApplicationsTable.id,
        orderId: llcApplicationsTable.orderId,
        companyName: llcApplicationsTable.companyName,
        ein: llcApplicationsTable.ein,
        state: llcApplicationsTable.state,
        ownerFullName: llcApplicationsTable.ownerFullName,
        ownerEmail: llcApplicationsTable.ownerEmail,
        ownerPhone: llcApplicationsTable.ownerPhone,
        ownerIdNumber: llcApplicationsTable.ownerIdNumber,
        ownerIdType: llcApplicationsTable.ownerIdType,
        ownerAddress: llcApplicationsTable.ownerAddress,
        ownerCity: llcApplicationsTable.ownerCity,
        ownerCountry: llcApplicationsTable.ownerCountry,
        ownerProvince: llcApplicationsTable.ownerProvince,
        ownerPostalCode: llcApplicationsTable.ownerPostalCode,
        llcCreatedDate: llcApplicationsTable.llcCreatedDate,
        designator: llcApplicationsTable.designator,
      })
        .from(llcApplicationsTable)
        .innerJoin(ordersTable, eq(llcApplicationsTable.orderId, ordersTable.id))
        .where(and(
          eq(ordersTable.userId, userId),
          eq(ordersTable.status, 'completed')
        ));
      
      res.json(llcApps);
    } catch (error) {
      console.error("Error fetching completed LLCs:", error);
      res.status(500).json({ message: "Error fetching completed LLCs" });
    }
  });

  // Save Operating Agreement to Document Center
  app.post("/api/user/operating-agreements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { llcApplicationId, pdfBase64, fileName } = req.body;
      
      if (!llcApplicationId || !pdfBase64 || !fileName) {
        return res.status(400).json({ message: "Incomplete data" });
      }
      
      // Verify user owns this LLC application
      const [llcApp] = await db.select({ orderId: llcApplicationsTable.orderId, ein: llcApplicationsTable.ein, companyName: llcApplicationsTable.companyName })
        .from(llcApplicationsTable)
        .where(eq(llcApplicationsTable.id, llcApplicationId))
        .limit(1);
      
      if (!llcApp) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check ownership via order
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, llcApp.orderId)).limit(1);
      if (!order || order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Verify EIN is assigned (required for Operating Agreement)
      if (!llcApp.ein) {
        return res.status(400).json({ message: "Cannot generate without assigned EIN" });
      }
      
      // Save to Document Center
      const [doc] = await db.insert(applicationDocumentsTable).values({
        orderId: llcApp.orderId,
        userId: userId,
        fileName: fileName,
        fileType: "application/pdf",
        fileUrl: pdfBase64,
        documentType: "operating_agreement",
        reviewStatus: "approved",
        uploadedBy: userId,
      }).returning();
      
      res.json({ success: true, documentId: doc.id });
    } catch (error) {
      console.error("Error saving Operating Agreement:", error);
      res.status(500).json({ message: "Error saving document" });
    }
  });

  app.get("/api/user/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Get documents associated with user's orders
      const orderDocs = await db.select({
        doc: applicationDocumentsTable,
        order: ordersTable
      }).from(applicationDocumentsTable)
        .leftJoin(ordersTable, eq(applicationDocumentsTable.orderId, ordersTable.id))
        .where(eq(ordersTable.userId, userId))
        .orderBy(desc(applicationDocumentsTable.uploadedAt));
      
      // Get documents directly assigned to user (without order)
      const directDocs = await db.select().from(applicationDocumentsTable)
        .where(eq(applicationDocumentsTable.userId, userId))
        .orderBy(desc(applicationDocumentsTable.uploadedAt));
      
      // Combine and deduplicate
      const allDocs = [...orderDocs.map(d => d.doc), ...directDocs];
      const uniqueDocs = allDocs.filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      );
      
      const uploaderIds = Array.from(new Set(uniqueDocs.map(d => d.uploadedBy).filter(Boolean))) as string[];
      const uploaderMap = new Map<string, { id: string; firstName: string | null; lastName: string | null; isAdmin: boolean | null }>();
      if (uploaderIds.length > 0) {
        const uploaders = await db.select({
          id: usersTable.id,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          isAdmin: usersTable.isAdmin
        }).from(usersTable).where(inArray(usersTable.id, uploaderIds));
        uploaders.forEach(u => uploaderMap.set(u.id, u));
      }
      
      const docsWithUploader = uniqueDocs.map((doc) => {
        const uploader = doc.uploadedBy ? uploaderMap.get(doc.uploadedBy) || null : null;
        const { encryptionIv, fileHash, ...safeFields } = doc;
        return { ...safeFields, fileUrl: doc.fileUrl ? `/api/user/documents/${doc.id}/download` : null, uploader };
      });
      
      res.json(docsWithUploader);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.delete("/api/user/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const docId = parseInt(req.params.id);
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || user.accountStatus === 'pending') {
        return res.status(403).json({ message: "Your account is in a status that does not allow this action. Contact our team." });
      }
      
      // Check if document belongs to user via order OR direct assignment
      const orderDocs = await db.select().from(applicationDocumentsTable)
        .leftJoin(ordersTable, eq(applicationDocumentsTable.orderId, ordersTable.id))
        .where(and(
          eq(applicationDocumentsTable.id, docId),
          eq(ordersTable.userId, userId)
        ));
      
      const directDocs = await db.select().from(applicationDocumentsTable)
        .where(and(
          eq(applicationDocumentsTable.id, docId),
          eq(applicationDocumentsTable.userId, userId)
        ));
      
      if (!orderDocs.length && !directDocs.length) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const docToDelete = orderDocs[0]?.application_documents || directDocs[0];
      if (docToDelete && docToDelete.reviewStatus === 'approved') {
        return res.status(403).json({ message: "Approved documents cannot be deleted." });
      }
      
      await db.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.id, docId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Error deleting document" });
    }
  });


  app.get("/api/user/documents/:id/download", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const docId = parseInt(req.params.id);
      
      const [doc] = await db.select().from(applicationDocumentsTable)
        .where(eq(applicationDocumentsTable.id, docId)).limit(1);
      
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      let hasAccess = req.session.isAdmin || req.session.isSupport;
      
      if (!hasAccess && doc.orderId) {
        const [order] = await db.select().from(ordersTable)
          .where(eq(ordersTable.id, doc.orderId)).limit(1);
        if (order && order.userId === userId) {
          hasAccess = true;
        }
      }
      
      if (!hasAccess && doc.userId === userId) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!doc.fileUrl) {
        return res.status(404).json({ message: "File not available" });
      }
      
      const path = await import('path');
      const fs = await import('fs');
      const filePath = path.join(process.cwd(), doc.fileUrl.replace(/^\//, ''));
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, no-cache');
      
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Error downloading file" });
    }
  });

  // Client document upload
  app.post("/api/documents/upload", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, fileName, fileUrl, documentType, applicationId } = z.object({
        orderId: z.number(),
        applicationId: z.number(),
        fileName: z.string(),
        fileUrl: z.string(),
        documentType: z.string()
      }).parse(req.body);

      const [doc] = await db.insert(applicationDocumentsTable).values({
        orderId,
        applicationId,
        fileName,
        fileType: "application/pdf",
        fileUrl,
        documentType,
        reviewStatus: "pending",
        uploadedBy: req.session.userId
      }).returning();

      logActivity("Documento Subido por Cliente", { 
        "Cliente ID": req.session.userId,
        "Pedido ID": orderId,
        "Tipo": documentType
      });

      const { fileUrl: _url, encryptionIv: _iv, fileHash: _hash, ...safeDoc } = doc;
      res.json(safeDoc);
    } catch (error) {
      res.status(500).json({ message: "Error uploading document" });
    }
  });

  // Client: Upload identity verification document
  app.post("/api/user/identity-verification/upload", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const verStatus = (user as any).identityVerificationStatus;
      if (verStatus !== 'requested' && verStatus !== 'rejected') {
        return res.status(400).json({ message: "No identity verification pending" });
      }
      
      const Busboy = (await import("busboy")).default;
      const fs = await import("fs");
      const path = await import("path");
      
      const uploadDir = path.join(process.cwd(), "uploads", "identity-docs");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const bb = Busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024 } });
      let savedFile = false;
      let filePath = "";
      let originalName = "";
      
      bb.on("file", (_fieldname: string, file: any, info: { filename: string; mimeType: string }) => {
        const { filename, mimeType } = info;
        originalName = filename;
        
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = path.extname(filename).toLowerCase();
        
        if (!allowedMimes.includes(mimeType) || !allowedExts.includes(ext)) {
          file.resume();
          return;
        }
        
        const safeFilename = `idv_${userId}_${Date.now()}${ext}`;
        filePath = path.join(uploadDir, safeFilename);
        
        const writeStream = fs.createWriteStream(filePath);
        file.pipe(writeStream);
        
        writeStream.on("close", () => {
          savedFile = true;
        });
        
        file.on("limit", () => {
          fs.unlinkSync(filePath);
          savedFile = false;
        });
      });
      
      bb.on("finish", async () => {
        if (!savedFile || !filePath) {
          return res.status(400).json({ message: "Invalid file. Allowed: PDF, JPG, PNG (max 5MB)" });
        }
        
        const relativePath = filePath.replace(process.cwd() + "/", "").replace(process.cwd() + "\\", "");
        
        await db.update(usersTable).set({
          identityVerificationStatus: "uploaded",
          identityVerificationDocumentKey: relativePath,
          identityVerificationDocumentName: originalName,
          updatedAt: new Date()
        }).where(eq(usersTable.id, userId));
        
        logActivity("Identity Document Uploaded", {
          "User": userId,
          "File": originalName
        });
        
        res.json({ success: true, message: "Document uploaded successfully" });
      });
      
      bb.on("error", () => {
        res.status(500).json({ message: "Error uploading file" });
      });
      
      req.pipe(bb);
    } catch (error) {
      console.error("Identity document upload error:", error);
      res.status(500).json({ message: "Error uploading identity document" });
    }
  });

  // Protected file serving - admin documents
  app.get("/uploads/admin-docs/:filename", isAuthenticated, async (req: any, res) => {
    try {
      const filename = req.params.filename;
      
      // Security: Prevent path traversal attacks
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: "Invalid filename" });
      }
      
      const fileUrl = `/uploads/admin-docs/${filename}`;
      
      // Check if user account is under review (non-admin only)
      if (!req.session.isAdmin && !req.session.isSupport) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (user && user.accountStatus === 'pending') {
          return res.status(403).json({ message: "Your account is in a status that does not allow this action. Contact our team." });
        }
      }
      
      // Find document by URL
      const [doc] = await db.select().from(applicationDocumentsTable)
        .where(eq(applicationDocumentsTable.fileUrl, fileUrl)).limit(1);
      
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check ownership: via orderId or direct userId assignment
      let hasAccess = req.session.isAdmin || req.session.isSupport;
      
      if (!hasAccess && doc.orderId) {
        const [order] = await db.select().from(ordersTable)
          .where(eq(ordersTable.id, doc.orderId)).limit(1);
        if (order && order.userId === req.session.userId) {
          hasAccess = true;
        }
      }
      
      if (!hasAccess && doc.userId === req.session.userId) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const path = await import('path');
      const fs = await import('fs');
      const filePath = path.join(process.cwd(), 'uploads', 'admin-docs', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Security headers for file downloads
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, no-cache');
      
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving admin doc:", error);
      res.status(500).json({ message: "Error serving file" });
    }
  });

  // Protected file serving - client documents
  app.get("/uploads/client-docs/:filename", isAuthenticated, async (req: any, res) => {
    try {
      const filename = req.params.filename;
      
      // Security: Prevent path traversal attacks
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: "Invalid filename" });
      }
      
      const fileUrl = `/uploads/client-docs/${filename}`;
      
      // Check if user account is under review (non-admin/support only)
      if (!req.session.isAdmin && !req.session.isSupport) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
        if (user && user.accountStatus === 'pending') {
          return res.status(403).json({ message: "Your account is in a status that does not allow this action. Contact our team." });
        }
      }
      
      // Find document by URL
      const [doc] = await db.select().from(applicationDocumentsTable)
        .where(eq(applicationDocumentsTable.fileUrl, fileUrl)).limit(1);
      
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check ownership: via orderId or direct userId assignment
      let hasAccess = req.session.isAdmin || req.session.isSupport;
      
      if (!hasAccess && doc.orderId) {
        const [order] = await db.select().from(ordersTable)
          .where(eq(ordersTable.id, doc.orderId)).limit(1);
        if (order && order.userId === req.session.userId) {
          hasAccess = true;
        }
      }
      
      if (!hasAccess && doc.userId === req.session.userId) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const path = await import('path');
      const fs = await import('fs');
      const filePath = path.join(process.cwd(), 'uploads', 'client-docs', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Security headers for file downloads
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, no-cache');
      
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving client doc:", error);
      res.status(500).json({ message: "Error serving file" });
    }
  });

  // Catch-all for /uploads - deny access to any uncovered paths
  app.get("/uploads/*", (_req, res) => {
    res.status(403).json({ message: "Access denied" });
  });

  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Protected admin seeding - requires existing admin authentication
  app.post("/api/seed-admin", isAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      const adminEmail = email || process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail)).limit(1);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }
      
      await db.update(usersTable).set({ isAdmin: true, accountStatus: 'active' }).where(eq(usersTable.email, adminEmail));
      res.json({ success: true, message: "Admin role assigned successfully" });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ message: "Error assigning admin role" });
    }
  });

  // Client Delete Account
  app.delete("/api/user/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { mode } = req.body; // 'hard' for 100% delete, 'soft' to keep data but disable email

      if (mode === 'hard') {
        await db.delete(usersTable).where(eq(usersTable.id, userId));
      } else {
        // Soft delete: Keep record but mark as deactivated and change email to prevent reuse
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        await db.update(usersTable).set({ 
          accountStatus: 'deactivated',
          isActive: false,
          email: `deleted_${userId}_${user.email}`,
          updatedAt: new Date()
        }).where(eq(usersTable.id, userId));
      }

      req.session.destroy(() => {});
      res.json({ success: true, message: "Account processed successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Error processing account deletion" });
    }
  });

  // Save language preference (separate from profile - no OTP needed)
  app.patch("/api/user/language", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { preferredLanguage } = req.body;
      if (!preferredLanguage || typeof preferredLanguage !== 'string') {
        return res.status(400).json({ message: "Invalid language" });
      }
      await db.update(usersTable).set({ preferredLanguage }).where(eq(usersTable.id, userId));
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json(updatedUser);
    } catch (error) {
      console.error("Update language error:", error);
      res.status(500).json({ message: "Error updating language" });
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
    idNumber: z.string().optional(),
    idType: z.string().optional(),
    birthDate: z.string().optional(),
  });
  
  // Sensitive fields that require OTP: name, ID/passport, phone only
  const sensitiveFields = ['firstName', 'lastName', 'idNumber', 'idType', 'phone'];
  
  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode, ...profileData } = req.body;
      const validatedData = updateProfileSchema.parse(profileData);
      
      const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!currentUser || !currentUser.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const currentUserEmail = currentUser.email;
      
      // Check which sensitive fields are being changed
      // OTP is only required when MODIFYING an existing value, not when setting it for the first time
      const changedSensitiveFields: { field: string; oldValue: any; newValue: any }[] = [];
      for (const field of sensitiveFields) {
        const currentValue = currentUser[field as keyof typeof currentUser];
        const newValue = validatedData[field as keyof typeof validatedData];
        const currentIsEmpty = !currentValue || (typeof currentValue === 'string' && currentValue.trim() === '');
        const newIsEmpty = !newValue || (typeof newValue === 'string' && newValue.trim() === '');
        
        if (field in validatedData && newValue !== currentValue) {
          // Skip OTP if the current value is empty (first time setting) or new value is empty (clearing)
          if (currentIsEmpty || newIsEmpty) {
            continue;
          }
          changedSensitiveFields.push({
            field,
            oldValue: currentValue || '(empty)',
            newValue: newValue || '(empty)'
          });
        }
      }
      
      if (changedSensitiveFields.length > 0) {
        if (!otpCode) {
          // Separate non-sensitive changes (apply immediately) from sensitive (hold pending)
          const nonSensitiveData: Record<string, any> = {};
          const pendingData: Record<string, any> = {};
          
          for (const [key, value] of Object.entries(validatedData)) {
            if (sensitiveFields.includes(key) && changedSensitiveFields.some(f => f.field === key)) {
              pendingData[key] = value;
            } else {
              nonSensitiveData[key] = value;
            }
          }
          
          // Apply non-sensitive changes immediately
          if (Object.keys(nonSensitiveData).length > 0) {
            await db.update(usersTable).set(nonSensitiveData).where(eq(usersTable.id, userId));
          }
          
          // Store pending sensitive changes with 24h expiry
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await db.update(usersTable).set({
            pendingProfileChanges: { fields: pendingData, changedFields: changedSensitiveFields, requestedAt: new Date().toISOString() },
            pendingChangesExpiresAt: expiresAt,
          }).where(eq(usersTable.id, userId));
          
          // Generate OTP (24h validity)
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          
          await db.insert(contactOtps).values({
            email: currentUserEmail,
            otp,
            otpType: "profile_change",
            expiresAt: otpExpiresAt,
            verified: false
          });
          
          const userLang = (currentUser.preferredLanguage as any) || 'es';
          const userName = currentUser.firstName || 'Cliente';
          sendEmail({
            to: currentUserEmail,
            subject: `${getEmailTranslations(userLang).profileChangeOtp.title} - Easy US LLC`,
            html: getProfileChangeOtpTemplate(userName, otp, userLang)
          }).catch(console.error);
          
          return res.status(400).json({ 
            message: "OTP verification required for sensitive changes",
            code: "OTP_REQUIRED",
            changedFields: changedSensitiveFields.map(f => f.field),
            pendingChanges: pendingData
          });
        }
        
        // OTP provided - verify it
        const [otpRecord] = await db.select()
          .from(contactOtps)
          .where(
            and(
              eq(contactOtps.email, currentUserEmail),
              eq(contactOtps.otpType, "profile_change"),
              eq(contactOtps.otp, otpCode),
              eq(contactOtps.verified, false),
              gt(contactOtps.expiresAt, new Date())
            )
          )
          .orderBy(sql`${contactOtps.expiresAt} DESC`)
          .limit(1);
        
        if (!otpRecord) {
          return res.status(400).json({ message: "Invalid or expired OTP code", code: "OTP_INVALID" });
        }
        
        // Mark OTP as used
        await db.update(contactOtps).set({ verified: true }).where(eq(contactOtps.id, otpRecord.id));
        
        // Apply ALL changes (including previously pending sensitive ones)
        await db.update(usersTable).set({
          ...validatedData,
          pendingProfileChanges: null,
          pendingChangesExpiresAt: null,
        }).where(eq(usersTable.id, userId));
        
        // Log audit for admin visibility
        logAudit({
          action: 'password_change',
          userId,
          details: {
            type: 'profile_update_verified',
            changedFields: changedSensitiveFields,
            email: currentUser.email,
            clientId: currentUser.clientId
          }
        });
        
        const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
        sendEmail({
          to: adminEmail,
          subject: `[ALERTA] Cambios de perfil verificados - Cliente ${currentUser.clientId}`,
          html: getAdminProfileChangesTemplate(
            `${currentUser.firstName} ${currentUser.lastName}`,
            currentUser.email || '',
            currentUser.clientId || '',
            changedSensitiveFields
          )
        }).catch(console.error);
        
        const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        return res.json(updatedUser);
      }
      
      // No sensitive fields changed - apply immediately
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
  
  // Confirm pending profile changes with OTP
  app.post("/api/user/profile/confirm-otp", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode } = req.body;
      
      if (!otpCode || typeof otpCode !== 'string' || otpCode.length !== 6) {
        return res.status(400).json({ message: "Invalid OTP code" });
      }
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const pendingChanges = user.pendingProfileChanges as any;
      if (!pendingChanges || !pendingChanges.fields) {
        return res.status(400).json({ message: "No pending changes to confirm" });
      }
      
      // Check if pending changes have expired
      if (user.pendingChangesExpiresAt && new Date(user.pendingChangesExpiresAt) < new Date()) {
        await db.update(usersTable).set({ pendingProfileChanges: null, pendingChangesExpiresAt: null }).where(eq(usersTable.id, userId));
        return res.status(400).json({ message: "Pending changes have expired. Please make the changes again." });
      }
      
      const userEmail = user.email;
      
      // Verify OTP
      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, userEmail),
            eq(contactOtps.otpType, "profile_change"),
            eq(contactOtps.otp, otpCode),
            eq(contactOtps.verified, false),
            gt(contactOtps.expiresAt, new Date())
          )
        )
        .orderBy(sql`${contactOtps.expiresAt} DESC`)
        .limit(1);
      
      if (!otpRecord) {
        const attempts = (pendingChanges.otpAttempts || 0) + 1;
        const maxAttempts = 5;
        
        if (attempts >= maxAttempts) {
          await db.update(usersTable).set({ 
            pendingProfileChanges: null, 
            pendingChangesExpiresAt: null,
            accountStatus: 'pending'
          }).where(eq(usersTable.id, userId));
          
          logAudit({
            action: 'account_review',
            userId,
            details: { reason: 'Too many failed OTP attempts for profile change', attempts, email: user.email }
          });
          
          return res.status(403).json({ 
            message: "Too many failed attempts. Your account has been placed under review for security.", 
            code: "ACCOUNT_UNDER_REVIEW",
            attemptsRemaining: 0
          });
        }
        
        await db.update(usersTable).set({ 
          pendingProfileChanges: { ...pendingChanges, otpAttempts: attempts }
        }).where(eq(usersTable.id, userId));
        
        return res.status(400).json({ 
          message: "Invalid or expired OTP code", 
          code: "OTP_INVALID",
          attemptsRemaining: maxAttempts - attempts
        });
      }
      
      // Mark OTP as used
      await db.update(contactOtps).set({ verified: true }).where(eq(contactOtps.id, otpRecord.id));
      
      // Apply pending changes
      await db.update(usersTable).set({
        ...pendingChanges.fields,
        pendingProfileChanges: null,
        pendingChangesExpiresAt: null,
      }).where(eq(usersTable.id, userId));
      
      // Log audit
      logAudit({
        action: 'password_change',
        userId,
        details: {
          type: 'profile_update_verified',
          changedFields: pendingChanges.changedFields,
          email: user.email,
          clientId: user.clientId
        }
      });
      
      const adminEmail = process.env.ADMIN_EMAIL || "afortuny07@gmail.com";
      sendEmail({
        to: adminEmail,
        subject: `[ALERTA] Cambios de perfil verificados - Cliente ${user.clientId}`,
        html: getAdminProfileChangesTemplate(
          `${user.firstName} ${user.lastName}`,
          user.email || '',
          user.clientId || '',
          pendingChanges.changedFields || []
        )
      }).catch(console.error);
      
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Confirm profile OTP error:", error);
      res.status(500).json({ message: "Error confirming changes" });
    }
  });
  
  // Cancel pending profile changes
  app.post("/api/user/profile/cancel-pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      await db.update(usersTable).set({ pendingProfileChanges: null, pendingChangesExpiresAt: null }).where(eq(usersTable.id, userId));
      const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Cancel pending changes error:", error);
      res.status(500).json({ message: "Error cancelling changes" });
    }
  });
  
  // Resend OTP for pending profile changes
  app.post("/api/user/profile/resend-otp", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const pendingChanges = user.pendingProfileChanges as any;
      if (!pendingChanges) {
        return res.status(400).json({ message: "No pending changes" });
      }
      
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('otp', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const userEmail = user.email;
      
      await db.insert(contactOtps).values({
        email: userEmail,
        otp,
        otpType: "profile_change",
        expiresAt: otpExpiresAt,
        verified: false
      });
      
      const resendLang = (user.preferredLanguage as any) || 'es';
      const resendName = user.firstName || 'Cliente';
      sendEmail({
        to: userEmail,
        subject: `${getEmailTranslations(resendLang).profileChangeOtp.title} - Easy US LLC`,
        html: getProfileChangeOtpTemplate(resendName, otp, resendLang)
      }).catch(console.error);
      
      res.json({ success: true, message: "New OTP code sent" });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  });
  
  // Verify email for pending accounts (activate account)
  app.post("/api/user/verify-email", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { otpCode } = req.body;
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.emailVerified) {
        return res.json({ success: true, message: "Email already verified" });
      }
      
      const userEmail = user.email;
      
      // Verify OTP
      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(
          and(
            eq(contactOtps.email, userEmail),
            eq(contactOtps.otpType, "account_verification"),
            eq(contactOtps.otp, otpCode),
            eq(contactOtps.verified, false),
            gt(contactOtps.expiresAt, new Date())
          )
        )
        .limit(1);
      
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP code" });
      }
      
      // Mark OTP as used and activate account
      await db.update(contactOtps).set({ verified: true }).where(eq(contactOtps.id, otpRecord.id));
      await db.update(usersTable).set({ 
        emailVerified: true, 
        accountStatus: 'active' 
      }).where(eq(usersTable.id, userId));
      
      // Update session
      req.session.isAdmin = user.isAdmin;
      req.session.isSupport = user.isSupport;
      
      // Send welcome email
      const activeLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      sendEmail({
        to: userEmail,
        subject: activeLang === 'en' ? "Account activated - Easy US LLC" : activeLang === 'ca' ? "Compte activat - Easy US LLC" : activeLang === 'fr' ? "Compte activé - Easy US LLC" : activeLang === 'de' ? "Konto aktiviert - Easy US LLC" : activeLang === 'it' ? "Account attivato - Easy US LLC" : activeLang === 'pt' ? "Conta ativada - Easy US LLC" : "Cuenta activada - Easy US LLC",
        html: getWelcomeEmailTemplate(user.firstName || undefined, activeLang)
      }).catch(console.error);
      
      res.json({ success: true, message: "Email verified successfully. Your account is active." });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({ message: "Error verifying email" });
    }
  });
  
  // Send verification OTP for pending accounts
  app.post("/api/user/send-verification-otp", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      
      if (!user || !user.email) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.emailVerified) {
        return res.json({ success: true, message: "Email already verified" });
      }
      
      const ip = getClientIp(req);
      const rateCheck = checkRateLimit('otp', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const userEmail = user.email;
      
      await db.insert(contactOtps).values({
        email: userEmail,
        otp,
        otpType: "account_verification",
        expiresAt,
        verified: false
      });
      
      const vpLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      sendEmail({
        to: userEmail,
        subject: getOtpSubject(vpLang),
        html: getOtpEmailTemplate(otp, user.firstName || undefined, vpLang)
      }).catch(console.error);
      
      res.json({ success: true, message: "OTP code sent to your email" });
    } catch (error) {
      console.error("Send verification OTP error:", error);
      res.status(500).json({ message: "Error sending OTP" });
    }
  });

  // User Compliance Deadlines - Calendar API
  app.get("/api/user/deadlines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Get all user orders with applications
      const userOrders = await db.select({
        order: ordersTable,
        application: llcApplicationsTable,
      })
      .from(ordersTable)
      .leftJoin(llcApplicationsTable, eq(ordersTable.id, llcApplicationsTable.orderId))
      .where(eq(ordersTable.userId, userId));

      const applications = userOrders
        .filter(o => o.application)
        .map(o => o.application);

      const deadlines = getUpcomingDeadlinesForUser(applications);
      res.json(deadlines);
    } catch (error) {
      console.error("Error fetching deadlines:", error);
      res.status(500).json({ message: "Error fetching compliance dates" });
    }
  });

  // Client update order (allowed fields before processing)
  app.patch("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order || order.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ message: "The order is already in progress and cannot be modified." });
      }

      const updateSchema = z.object({
        companyNameOption2: z.string().optional(),
        designator: z.string().optional(),
        companyDescription: z.string().optional(),
        ownerNamesAlternates: z.string().optional(),
        notes: z.string().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      
      await db.update(llcApplicationsTable)
        .set({ ...validatedData, lastUpdated: new Date() })
        .where(eq(llcApplicationsTable.orderId, orderId));

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error updating order" });
    }
  });

  // Get user notifications
  app.get("/api/user/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const notifs = await db.select()
        .from(userNotifications)
        .where(eq(userNotifications.userId, userId))
        .orderBy(desc(userNotifications.createdAt))
        .limit(50);
      res.json(notifs);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.patch("/api/user/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      await db.update(userNotifications)
        .set({ isRead: true })
        .where(and(eq(userNotifications.id, req.params.id), eq(userNotifications.userId, req.session.userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
  });

  // Delete user notification
  app.delete("/api/user/notifications/:id", isAuthenticated, async (req: any, res) => {
    try {
      await db.delete(userNotifications)
        .where(and(eq(userNotifications.id, req.params.id), eq(userNotifications.userId, req.session.userId)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting notification" });
    }
  });

  // Request OTP for password change
  app.post("/api/user/request-password-otp", isAuthenticated, async (req: any, res) => {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
      if (!user?.email) {
        return res.status(400).json({ message: "User not found" });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      
      // Store OTP in database
      await db.insert(contactOtps).values({
        email: user.email,
        otp,
        otpType: "password_change",
        expiresAt: expires,
        verified: false
      });
      
      const pwLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      await sendEmail({
        to: user.email,
        subject: getOtpSubject(pwLang),
        html: getPasswordChangeOtpTemplate(user.firstName || '', otp, pwLang)
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Request password OTP error:", error);
      res.status(500).json({ message: "Error sending code" });
    }
  });

  // Change password with OTP verification
  app.post("/api/user/change-password", isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword, otp } = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
        otp: z.string().length(6)
      }).parse(req.body);
      
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
      if (!user?.email || !user?.passwordHash) {
        return res.status(400).json({ message: "Cannot change password" });
      }
      
      // Verify OTP from database
      const [otpRecord] = await db.select()
        .from(contactOtps)
        .where(and(
          eq(contactOtps.email, user.email),
          eq(contactOtps.otp, otp),
          eq(contactOtps.otpType, "password_change"),
          gt(contactOtps.expiresAt, new Date())
        ));
      
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      
      // Delete used OTP
      await db.delete(contactOtps).where(eq(contactOtps.id, otpRecord.id));
      
      const { verifyPassword, hashPassword } = await import("../lib/auth-service");
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "Incorrect current password" });
      }
      
      const newHash = await hashPassword(newPassword);
      await db.update(usersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(usersTable.id, req.session.userId));
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data" });
      }
      console.error("Change password error:", error);
      res.status(500).json({ message: "Error changing password" });
    }
  });
}
