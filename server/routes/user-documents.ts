import type { Express } from "express";
import { and, eq, desc, inArray } from "drizzle-orm";
import { db, isAuthenticated, logActivity } from "./shared";
import { users as usersTable, orders as ordersTable, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable } from "@shared/schema";

export function registerUserDocumentRoutes(app: Express) {
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
      if (!user) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Only administrators can delete documents." });
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
      const crypto = await import("crypto");
      
      const uploadDir = path.join(process.cwd(), "uploads", "identity-docs");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const bb = Busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024 } });
      let filePath = "";
      let originalName = "";
      let fileSaved: Promise<boolean> | null = null;
      let hitLimit = false;
      
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
        
        fileSaved = new Promise<boolean>((resolve) => {
          writeStream.on("finish", () => resolve(true));
          writeStream.on("error", () => resolve(false));
        });
        
        file.pipe(writeStream);
        
        file.on("limit", () => {
          hitLimit = true;
          writeStream.end();
        });
      });
      
      bb.on("finish", async () => {
        try {
          if (!fileSaved || !filePath) {
            return res.status(400).json({ message: "Invalid file. Allowed: PDF, JPG, PNG (max 5MB)" });
          }
          
          const saved = await fileSaved;
          
          if (hitLimit) {
            try { fs.unlinkSync(filePath); } catch {}
            return res.status(400).json({ message: "File too large. Max 5MB allowed." });
          }
          
          if (!saved) {
            return res.status(500).json({ message: "Error saving file" });
          }
          
          const fileBuffer = fs.readFileSync(filePath);
          const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
          
          const relativePath = filePath.replace(process.cwd() + "/", "").replace(process.cwd() + "\\", "");
          
          await db.update(usersTable).set({
            identityVerificationStatus: "uploaded",
            identityVerificationDocumentKey: relativePath,
            identityVerificationDocumentName: originalName,
            updatedAt: new Date()
          }).where(eq(usersTable.id, userId));
          
          logActivity("Identity Document Uploaded", {
            "User": userId,
            "File": originalName,
            "Hash": fileHash
          });
          
          res.json({ success: true, message: "Document uploaded successfully" });
        } catch (err) {
          console.error("Error processing uploaded file:", err);
          res.status(500).json({ message: "Error processing uploaded file" });
        }
      });
      
      bb.on("error", (err: any) => {
        console.error("Busboy error:", err);
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
}
