import type { Express, Response } from "express";
import { z } from "zod";
import { and, eq, desc, inArray, or, sql } from "drizzle-orm";
import { db, storage, isAdmin, isAdminOrSupport, asyncHandler, logAudit, getClientIp } from "./shared";
import { createLogger } from "../lib/logger";
import { compressImage } from "../lib/image-compress";
import { sanitizeHtml } from "../lib/security";
import { checkRateLimitInMemory } from "../lib/rate-limiter";

const log = createLogger('admin-documents');
import { orders as ordersTable, users as usersTable, maintenanceApplications, orderEvents, userNotifications, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable, messages as messagesTable, documentRequests as documentRequestsTable, auditLogs } from "@shared/schema";
import { sendEmail, getDocumentUploadedTemplate, getAdminNoteTemplate, getPaymentRequestTemplate, getDocumentRequestTemplate, getOrderEventTemplate, getDocumentApprovedTemplate, getDocumentRejectedTemplate } from "../lib/email";
import { EmailLanguage } from "../lib/email-translations";
import { updateApplicationDeadlines } from "../calendar-service";

const VALID_DOC_REQUEST_TRANSITIONS: Record<string, string[]> = {
  sent: ['pending_upload', 'uploaded', 'cancelled'],
  pending_upload: ['uploaded', 'cancelled'],
  uploaded: ['approved', 'rejected'],
  approved: [],
  rejected: ['sent', 'pending_upload'],
  completed: [],
  cancelled: ['sent'],
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function registerAdminDocumentsRoutes(app: Express) {
  // Document Management - Upload official docs by Admin
  app.post("/api/admin/documents", isAdminOrSupport, asyncHandler(async (req: any, res: Response) => {
    try {
      const docSchema = z.object({
        orderId: z.number(),
        fileName: z.string().min(1),
        fileUrl: z.string().min(1),
        documentType: z.string().optional(),
        applicationId: z.number().optional()
      });
      const { orderId, fileName, fileUrl, documentType, applicationId } = docSchema.parse(req.body);
      const [doc] = await db.insert(applicationDocumentsTable).values({
        orderId,
        applicationId,
        fileName,
        fileType: "application/pdf",
        fileUrl,
        documentType: documentType || "official_filing",
        reviewStatus: "approved",
        uploadedBy: (req as any).session.userId
      }).returning();
      
      res.json(doc);
    } catch (error) {
      log.error("Upload doc error", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  }));

  // Admin upload document file for client (supports orderId OR userId)
  app.post("/api/admin/documents/upload", isAdminOrSupport, asyncHandler(async (req: any, res: Response) => {
    try {
      const busboy = (await import('busboy')).default;
      const bb = busboy({ 
        headers: req.headers,
        limits: { fileSize: MAX_FILE_SIZE_BYTES }
      });
      
      let fileName = '';
      let fileBuffer: Buffer | null = null;
      let fileTruncated = false;
      let documentType = 'other';
      let orderId = '';
      let targetUserId = '';
      
      bb.on('field', (name: string, val: string) => {
        if (name === 'documentType') documentType = val;
        if (name === 'orderId') orderId = val;
        if (name === 'userId') targetUserId = val;
      });
      
      // Allowed file extensions and MIME types for security
      const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
      const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
      let detectedMime = '';
      
      bb.on('file', (name: string, file: any, info: any) => {
        fileName = info.filename || `documento_${Date.now()}`;
        detectedMime = info.mimeType || '';
        const chunks: Buffer[] = [];
        file.on('data', (data: Buffer) => chunks.push(data));
        file.on('limit', () => { fileTruncated = true; });
        file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
      });

      bb.on('finish', async () => {
        if (fileTruncated) {
          return res.status(413).json({ message: `File exceeds the ${MAX_FILE_SIZE_MB}MB size limit` });
        }
        
        // Need either orderId or userId
        if (!fileBuffer || (!orderId && !targetUserId)) {
          return res.status(400).json({ message: "Missing required data (orderId or userId)" });
        }
        
        // Validate file extension
        const extCheck = fileName.toLowerCase().split('.').pop() || '';
        if (!ALLOWED_EXTENSIONS.includes(extCheck)) {
          return res.status(400).json({ message: "File type not allowed. Only accepted: PDF, JPG, JPEG, PNG" });
        }
        
        // Validate MIME type
        if (!ALLOWED_MIMES.includes(detectedMime)) {
          return res.status(400).json({ message: "Invalid file format" });
        }

        const fs = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'uploads', 'admin-docs');
        await fs.mkdir(uploadDir, { recursive: true });
        
        const identifier = orderId || targetUserId;
        const safeFileName = `admin_${identifier}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, safeFileName);
        const compressedBuffer = await compressImage(fileBuffer, fileName);
        await fs.writeFile(filePath, compressedBuffer);
        
        // Determine file type from extension
        const ext = fileName.toLowerCase().split('.').pop() || '';
        const mimeTypes: Record<string, string> = {
          'pdf': 'application/pdf',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png'
        };
        const fileType = mimeTypes[ext] || 'application/octet-stream';
        
        // Document type labels
        const docTypeLabels: Record<string, string> = {
          'articles_of_organization': 'Artículos de Organización',
          'certificate_of_formation': 'Certificado de Formación',
          'boir': 'BOIR',
          'ein_document': 'Documento EIN',
          'operating_agreement': 'Acuerdo Operativo',
          'invoice': 'Factura',
          'other': 'Otro Documento'
        };
        
        let finalUserId = targetUserId;
        let applicationId: number | null = null;
        let orderCode = '';
        
        // If orderId provided, get user from order
        if (orderId) {
          const [llcApp] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.orderId, Number(orderId))).limit(1);
          applicationId = llcApp?.id || null;
          
          const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(orderId))).limit(1);
          if (order?.userId) {
            finalUserId = order.userId;
            orderCode = llcApp?.requestCode || order.invoiceNumber || `#${order.id}`;
          }
        }
        
        const [doc] = await db.insert(applicationDocumentsTable).values({
          orderId: orderId ? Number(orderId) : null,
          applicationId,
          userId: finalUserId || null,
          fileName: docTypeLabels[documentType] || fileName,
          fileType,
          fileUrl: `/uploads/admin-docs/${safeFileName}`,
          documentType: documentType,
          reviewStatus: 'approved',
          uploadedBy: req.session.userId
        }).returning();

        // Notify user (dashboard notification + email)
        if (finalUserId) {
          const docLabel = docTypeLabels[documentType] || 'Documento';
          
          // Dashboard notification (translated on frontend via i18n keys)
          const docTypeKey = documentType && ['articles_of_organization', 'certificate_of_formation', 'boir', 'ein_document', 'operating_agreement', 'invoice', 'other'].includes(documentType) ? `@ntf.docTypes.${documentType}` : docLabel;
          await db.insert(userNotifications).values({
            userId: finalUserId,
            orderId: orderId ? Number(orderId) : null,
            orderCode: orderCode || 'General',
            title: 'i18n:ntf.docUploaded.title',
            message: `i18n:ntf.docUploaded.message::{"docName":"${docTypeKey}"}`,
            type: 'info',
            isRead: false
          });
          
          // Send email notification
          const [user] = await db.select().from(usersTable).where(eq(usersTable.id, finalUserId)).limit(1);
          if (user?.email) {
            const docLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
            const docSubjects: Record<string, string> = { en: 'New document available', ca: 'Nou document disponible', fr: 'Nouveau document disponible', de: 'Neues Dokument verfügbar', it: 'Nuovo documento disponibile', pt: 'Novo documento disponível' };
            sendEmail({
              to: user.email,
              subject: `${docSubjects[docLang] || 'Nuevo documento disponible'}${orderCode ? ` - ${orderCode}` : ''}`,
              html: getDocumentUploadedTemplate(user.firstName || '', docLabel, orderCode || '', docLang)
            }).catch((err) => log.warn("Failed to send email", { error: err?.message }));
          }
        }
        
        res.json(doc);
      });

      req.pipe(bb);
    } catch (error) {
      log.error("Admin upload doc error", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  }));

  app.get("/api/admin/documents", isAdminOrSupport, asyncHandler(async (req: any, res: Response) => {
    try {
      const docs = await db.select().from(applicationDocumentsTable)
        .leftJoin(ordersTable, eq(applicationDocumentsTable.orderId, ordersTable.id))
        .leftJoin(llcApplicationsTable, eq(applicationDocumentsTable.applicationId, llcApplicationsTable.id))
        .orderBy(desc(applicationDocumentsTable.uploadedAt));
      
      const allUserIds = new Set<string>();
      for (const d of docs) {
        if (d.orders?.userId) allUserIds.add(d.orders.userId);
        if (d.application_documents.userId) allUserIds.add(d.application_documents.userId);
        if (d.application_documents.uploadedBy) allUserIds.add(d.application_documents.uploadedBy);
      }
      
      const usersMap = new Map<string, any>();
      if (allUserIds.size > 0) {
        const users = await db.select().from(usersTable).where(inArray(usersTable.id, Array.from(allUserIds)));
        for (const u of users) {
          usersMap.set(u.id, {
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            emailVerified: u.emailVerified,
            identityVerificationStatus: (u as any).identityVerificationStatus,
            accountStatus: u.accountStatus
          });
        }
      }
      
      res.json(docs.map(d => {
        const doc = d.application_documents;
        const resolvedUser = usersMap.get(d.orders?.userId || '') || usersMap.get(doc.userId || '') || usersMap.get(doc.uploadedBy || '') || null;
        return {
          ...doc,
          order: d.orders,
          user: resolvedUser,
          application: d.llc_applications ? { companyName: d.llc_applications.companyName, state: d.llc_applications.state } : null
        };
      }));
    } catch (error) {
      log.error("Admin documents error", error);
      res.status(500).json({ message: "Error fetching documents" });
    }
  }));

  app.patch("/api/admin/documents/:id/review", isAdminOrSupport, asyncHandler(async (req: any, res: Response) => {
    try {
      const docId = Number(req.params.id);
      const { reviewStatus, rejectionReason } = z.object({ 
        reviewStatus: z.enum(["pending", "approved", "rejected", "action_required"]),
        rejectionReason: z.string().optional()
      }).parse(req.body);
      
      const [updated] = await db.update(applicationDocumentsTable)
        .set({ reviewStatus })
        .where(eq(applicationDocumentsTable.id, docId))
        .returning();
      
      const [docWithOrder] = await db.select({
        doc: applicationDocumentsTable,
        order: ordersTable,
      })
        .from(applicationDocumentsTable)
        .leftJoin(ordersTable, eq(applicationDocumentsTable.orderId, ordersTable.id))
        .where(eq(applicationDocumentsTable.id, docId))
        .limit(1);
      
      let targetUser: any = null;
      if (docWithOrder) {
        if (docWithOrder.order?.userId) {
          const [u] = await db.select().from(usersTable).where(eq(usersTable.id, docWithOrder.order.userId)).limit(1);
          targetUser = u;
        }
        if (!targetUser && docWithOrder.doc.userId) {
          const [u] = await db.select().from(usersTable).where(eq(usersTable.id, docWithOrder.doc.userId)).limit(1);
          targetUser = u;
        }
        if (!targetUser && docWithOrder.doc.uploadedBy) {
          const [u] = await db.select().from(usersTable).where(eq(usersTable.id, docWithOrder.doc.uploadedBy)).limit(1);
          targetUser = u;
        }
      }
      
      if (targetUser && docWithOrder) {
        const docTypeLabels: Record<string, string> = {
          'id_document': 'Documento de identidad',
          'proof_of_address': 'Comprobante de domicilio',
          'passport': 'Pasaporte',
          'ein_letter': 'Carta EIN',
          'articles_of_organization': 'Artículos de Organización',
          'operating_agreement': 'Acuerdo Operativo',
          'invoice': 'Factura',
          'other': 'Otro documento'
        };
        const docLabel = docTypeLabels[docWithOrder.doc.documentType] || docWithOrder.doc.fileName;
        const validDocTypes = ['id_document', 'proof_of_address', 'passport', 'ein_letter', 'articles_of_organization', 'operating_agreement', 'invoice', 'other'];
        
        if (reviewStatus === 'approved') {
          await db.delete(userNotifications).where(
            and(
              eq(userNotifications.userId, targetUser.id),
              inArray(userNotifications.type, ['action_required', 'info']),
              sql`${userNotifications.title} IN ('i18n:ntf.docInReview.title', 'i18n:ntf.docRejected.title', 'i18n:ntf.docRequested.title')`
            )
          );
          
          await db.update(messagesTable).set({ status: 'closed' }).where(
            and(
              eq(messagesTable.userId, targetUser.id),
              eq(messagesTable.type, 'support'),
              eq(messagesTable.status, 'unread'),
              sql`${messagesTable.subject} LIKE '%Document Received%' OR ${messagesTable.subject} LIKE '%Documento Recibido%' OR ${messagesTable.subject} LIKE '%Document Rebut%' OR ${messagesTable.subject} LIKE '%Document Reçu%' OR ${messagesTable.subject} LIKE '%Dokument Erhalten%' OR ${messagesTable.subject} LIKE '%Documento Ricevuto%' OR ${messagesTable.subject} LIKE '%Documento Recebido%'`
            )
          );
          
          const approvedDocKey = docWithOrder.doc.documentType && validDocTypes.includes(docWithOrder.doc.documentType) ? `@ntf.docTypes.${docWithOrder.doc.documentType}` : docLabel;
          await db.insert(userNotifications).values({
            userId: targetUser.id,
            orderId: docWithOrder.order?.id || null,
            orderCode: docWithOrder.order?.invoiceNumber || 'General',
            title: 'i18n:ntf.docApproved.title',
            message: `i18n:ntf.docApproved.message::{"docType":"${approvedDocKey}"}`,
            type: 'success',
            isRead: false
          });
          
          const userLang = (targetUser.preferredLanguage || 'es') as EmailLanguage;
          const approvedSubjects: Record<string, string> = { en: 'Document approved', ca: 'Document aprovat', fr: 'Document approuvé', de: 'Dokument genehmigt', it: 'Documento approvato', pt: 'Documento aprovado' };
          sendEmail({
            to: targetUser.email!,
            subject: `${approvedSubjects[userLang] || 'Documento aprobado'} - ${docLabel}`,
            html: getDocumentApprovedTemplate(
              targetUser.firstName || '',
              docLabel,
              userLang
            )
          }).catch((err: any) => log.error("Failed to send document approved email", err));
        } else if (reviewStatus === 'rejected') {
          await db.delete(userNotifications).where(
            and(
              eq(userNotifications.userId, targetUser.id),
              eq(userNotifications.type, 'info'),
              sql`${userNotifications.title} = 'i18n:ntf.docInReview.title'`
            )
          );
          
          const reason = rejectionReason || 'No cumple los requisitos necesarios';
          const rejectedDocKey = docWithOrder.doc.documentType && validDocTypes.includes(docWithOrder.doc.documentType) ? `@ntf.docTypes.${docWithOrder.doc.documentType}` : docLabel;
          const safeReason = reason.replace(/"/g, '\\"').replace(/\n/g, ' ');
          await db.insert(userNotifications).values({
            userId: targetUser.id,
            orderId: docWithOrder.order?.id || null,
            orderCode: docWithOrder.order?.invoiceNumber || 'General',
            title: 'i18n:ntf.docRejected.title',
            message: `i18n:ntf.docRejected.message::{"docType":"${rejectedDocKey}","reason":"${safeReason}"}`,
            type: 'action_required',
            isRead: false
          });
          
          const rejLang = (targetUser.preferredLanguage || 'es') as EmailLanguage;
          const rejSubjects: Record<string, string> = { en: 'Action required - Document rejected', ca: 'Acció requerida - Document rebutjat', fr: 'Action requise - Document rejeté', de: 'Handlung erforderlich - Dokument abgelehnt', it: 'Azione richiesta - Documento rifiutato', pt: 'Ação necessária - Documento rejeitado' };
          sendEmail({
            to: targetUser.email!,
            subject: rejSubjects[rejLang] || 'Acción requerida - Documento rechazado',
            html: getDocumentRejectedTemplate(
              targetUser.firstName || '',
              docLabel,
              reason,
              rejLang
            )
          }).catch((err: any) => log.error("Failed to send document rejected email", err));
        }
      }
      
      logAudit({
        action: 'account_review',
        userId: req.session?.userId,
        targetId: String(docId),
        details: { reviewStatus, rejectionReason, documentType: docWithOrder?.doc?.documentType, fileName: docWithOrder?.doc?.fileName },
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] || undefined,
      });

      if (reviewStatus === 'approved' || reviewStatus === 'rejected') {
        const linkedRequests = await db.select().from(documentRequestsTable)
          .where(eq(documentRequestsTable.linkedDocumentId, docId));
        for (const req_ of linkedRequests) {
          await db.update(documentRequestsTable)
            .set({ status: reviewStatus, updatedAt: new Date() })
            .where(eq(documentRequestsTable.id, req_.id));
        }
      }
      
      res.json(updated);
    } catch (error) {
      log.error("Document review error", error);
      res.status(500).json({ message: "Error updating document review status" });
    }
  }));

  app.delete("/api/admin/documents/:id", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const docId = Number(req.params.id);
      await db.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.id, docId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting document" });
    }
  }));

  app.post("/api/admin/applications/:id/set-formation-date", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { formationDate, state } = z.object({
        formationDate: z.string(),
        state: z.string().optional()
      }).parse(req.body);

      const [app] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.id, applicationId)).limit(1);
      if (!app) {
        return res.status(404).json({ message: "Application not found" });
      }

      const deadlines = await updateApplicationDeadlines(
        applicationId, 
        new Date(formationDate), 
        state || app.state || "new_mexico",
        app.hasTaxExtension || false
      );

      res.json({ 
        success: true, 
        message: "Fechas de cumplimiento calculadas exitosamente",
        deadlines 
      });
    } catch (error) {
      log.error("Error setting formation date", error);
      res.status(500).json({ message: "Error setting formation date" });
    }
  }));

  // User notifications - Unified Note + Email System
  app.post("/api/admin/send-note", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const parsed = z.object({
        userId: z.string(),
        title: z.string().min(1, "Title required"),
        message: z.string().min(1, "Mensaje requerido"),
        type: z.enum(['update', 'info', 'action_required'])
      }).parse(req.body);
      const userId = parsed.userId;
      const title = sanitizeHtml(parsed.title);
      const message = sanitizeHtml(parsed.message);
      const type = parsed.type;

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Generate unique ticket ID (8-digit numeric format)
      const { generateUniqueTicketId } = await import("../lib/id-generator");
      const ticketId = await generateUniqueTicketId();

      // Create Notification in system with ticketId
      await db.insert(userNotifications).values({
        userId,
        title,
        message,
        type,
        ticketId,
        isRead: false
      });

      // Always send email notification with ticket reference
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `${title} - Ticket #${ticketId}`,
          html: getAdminNoteTemplate(user.firstName || 'Cliente', `${title}: ${message}`, ticketId, (user.preferredLanguage as any) || 'es')
        });
      }

      res.json({ success: true, emailSent: !!user.email, ticketId });
    } catch (error) {
      log.error("Error sending note", error);
      res.status(500).json({ message: "Error sending note" });
    }
  }));

  // Admin Payment Link system
  app.post("/api/admin/send-payment-link", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const parsedPay = z.object({
        userId: z.string(),
        paymentLink: z.string().url(),
        message: z.string(),
        amount: z.string().optional()
      }).parse(req.body);
      const { userId, paymentLink } = parsedPay;
      const message = sanitizeHtml(parsedPay.message);
      const amount = parsedPay.amount;

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || !user.email) return res.status(404).json({ message: "User or email not found" });

      const payLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      await sendEmail({
        to: user.email,
        subject: payLang === 'en' ? "Payment pending - Exentax" : payLang === 'ca' ? "Pagament pendent - Exentax" : payLang === 'fr' ? "Paiement en attente - Exentax" : payLang === 'de' ? "Zahlung ausstehend - Exentax" : payLang === 'it' ? "Pagamento in sospeso - Exentax" : payLang === 'pt' ? "Pagamento pendente - Exentax" : "Pago pendiente - Exentax",
        html: getPaymentRequestTemplate(user.firstName || '', amount || '', paymentLink, message, payLang)
      });

      // Create internal notification (translated on frontend via i18n keys)
      await db.insert(userNotifications).values({
        userId,
        title: 'i18n:ntf.paymentRequested.title',
        message: `i18n:ntf.paymentRequested.message::{"amount":"${amount || ''}"}`,
        type: 'action_required',
        isRead: false
      });

      res.json({ success: true });
    } catch (error) {
      log.error("Send payment link error", error);
      res.status(500).json({ message: "Error sending payment link" });
    }
  }));

  // Request document from client
  app.post("/api/admin/request-document", isAdminOrSupport, asyncHandler(async (req: any, res: Response) => {
    try {
      const parsedDoc = z.object({
        email: z.string().email(),
        documentType: z.string(),
        message: z.string(),
        userId: z.string().optional()
      }).parse(req.body);
      const email = parsedDoc.email;
      const documentType = parsedDoc.documentType;
      const message = sanitizeHtml(parsedDoc.message);
      const userId = parsedDoc.userId;

      const { generateDocRequestId } = await import("../lib/id-generator");
      const msgId = generateDocRequestId();
      
      const docTypeLabelsByLang: Record<string, Record<string, string>> = {
        es: { passport: 'Pasaporte / Documento de Identidad', address_proof: 'Comprobante de Domicilio', tax_id: 'Identificación Fiscal', other: 'Otro Documento' },
        en: { passport: 'Passport / ID Document', address_proof: 'Proof of Address', tax_id: 'Tax ID', other: 'Other Document' },
        ca: { passport: 'Passaport / Document d\'Identitat', address_proof: 'Comprovant de Domicili', tax_id: 'Identificació Fiscal', other: 'Altre Document' },
        fr: { passport: 'Passeport / Document d\'Identité', address_proof: 'Justificatif de Domicile', tax_id: 'Identification Fiscale', other: 'Autre Document' },
        de: { passport: 'Reisepass / Ausweisdokument', address_proof: 'Adressnachweis', tax_id: 'Steuer-ID', other: 'Anderes Dokument' },
        it: { passport: 'Passaporto / Documento di Identità', address_proof: 'Prova di Indirizzo', tax_id: 'Identificazione Fiscale', other: 'Altro Documento' },
        pt: { passport: 'Passaporte / Documento de Identidade', address_proof: 'Comprovativo de Morada', tax_id: 'Identificação Fiscal', other: 'Outro Documento' },
      };
      
      const [reqUser] = userId ? await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1) : [null];
      const reqLang = ((reqUser as any)?.preferredLanguage || 'es') as EmailLanguage;
      const langLabels = docTypeLabelsByLang[reqLang] || docTypeLabelsByLang['es'];
      const docTypeLabel = langLabels[documentType] || docTypeLabelsByLang['es'][documentType] || documentType;
      
      const reqSubjects: Record<string, string> = { en: 'Action Required: Documentation Request', ca: 'Acció Requerida: Sol·licitud de Documentació', fr: 'Action Requise : Demande de Documentation', de: 'Handlung Erforderlich: Dokumentationsanfrage', it: 'Azione Richiesta: Richiesta di Documentazione', pt: 'Ação Necessária: Solicitação de Documentação' };
      await sendEmail({
        to: email,
        subject: reqSubjects[reqLang] || 'Acción Requerida: Solicitud de Documentación',
        html: getDocumentRequestTemplate(reqUser?.firstName || '', docTypeLabel, message, msgId, reqLang)
      });

      if (userId) {
        const reqDocKey = documentType && ['passport', 'address_proof', 'tax_id', 'other'].includes(documentType) ? `@ntf.docTypes.${documentType === 'passport' ? 'passport_id' : documentType}` : `@ntf.docTypes.other`;
        const msgSubjectsByLang: Record<string, string> = { es: 'Solicitud de Documento', en: 'Document Request', ca: 'Sol·licitud de Document', fr: 'Demande de Document', de: 'Dokumentenanforderung', it: 'Richiesta di Documento', pt: 'Solicitação de Documento' };
        await db.insert(userNotifications).values({
          userId,
          title: 'i18n:ntf.docRequested.title',
          message: `i18n:ntf.docRequested.message::{"docType":"${reqDocKey}"}`,
          type: 'action_required',
          isRead: false
        });

        const { encrypt } = await import("../utils/encryption");
        await db.insert(messagesTable).values({
          userId,
          name: "Exentax (Soporte)",
          email: "hola@exentax.com",
          subject: `i18n:ntf.docRequest.subject::{"docType":"${reqDocKey}"}`,
          content: message,
          encryptedContent: encrypt(message),
          type: "support",
          status: "unread",
          messageId: msgId
        });
      }

      await db.insert(documentRequestsTable).values({
        requestId: msgId,
        userId: userId || '',
        documentType,
        notes: message,
        status: 'sent',
        requestedBy: req.session.userId,
      });

      await db.insert(auditLogs).values({
        action: 'document_request_created',
        userId: req.session.userId,
        targetId: userId || '',
        details: { requestId: msgId, documentType, email },
      });

      res.json({ success: true, messageId: msgId });
    } catch (error) {
      log.error("Request doc error", error);
      res.status(500).json({ message: "Error requesting document" });
    }
  }));

  // List all document requests
  app.get("/api/admin/document-requests", isAdminOrSupport, asyncHandler(async (req: any, res: Response) => {
    try {
      const requests = await db.select()
        .from(documentRequestsTable)
        .leftJoin(usersTable, eq(documentRequestsTable.userId, usersTable.id))
        .leftJoin(applicationDocumentsTable, eq(documentRequestsTable.linkedDocumentId, applicationDocumentsTable.id))
        .orderBy(desc(documentRequestsTable.createdAt));
      
      res.json(requests.map(r => ({
        ...r.document_requests,
        user: r.users ? {
          id: r.users.id,
          firstName: r.users.firstName,
          lastName: r.users.lastName,
          email: r.users.email,
        } : null,
        linkedDocument: r.application_documents || null,
      })));
    } catch (error) {
      log.error("Error fetching document requests", error);
      res.status(500).json({ message: "Error fetching document requests" });
    }
  }));

  // Update document request
  app.patch("/api/admin/document-requests/:id", isAdminOrSupport, asyncHandler(async (req: any, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { notes, status } = z.object({
        notes: z.string().optional(),
        status: z.enum(["sent", "pending_upload", "uploaded", "approved", "rejected", "completed", "cancelled"]).optional(),
      }).parse(req.body);
      
      const [existing] = await db.select().from(documentRequestsTable)
        .where(eq(documentRequestsTable.id, id)).limit(1);
      if (!existing) return res.status(404).json({ message: "Request not found" });
      
      if (status !== undefined) {
        const currentStatus = existing.status || 'sent';
        const allowedTransitions = VALID_DOC_REQUEST_TRANSITIONS[currentStatus] || [];
        if (!allowedTransitions.includes(status)) {
          return res.status(400).json({
            message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`
          });
        }
        if (status === 'approved' && !existing.linkedDocumentId) {
          return res.status(400).json({ message: "Cannot approve a request without a linked document" });
        }
      }
      
      const updateData: any = { updatedAt: new Date() };
      if (notes !== undefined) updateData.notes = sanitizeHtml(notes);
      if (status !== undefined) updateData.status = status;
      
      const [updated] = await db.update(documentRequestsTable)
        .set(updateData)
        .where(eq(documentRequestsTable.id, id))
        .returning();
      
      await db.insert(auditLogs).values({
        action: 'document_request_updated',
        userId: req.session.userId,
        targetId: String(id),
        details: { requestId: updated.requestId, status, notes: notes ? 'updated' : undefined },
      });
      
      res.json(updated);
    } catch (error) {
      log.error("Error updating document request", error);
      res.status(500).json({ message: "Error updating document request" });
    }
  }));

  // Delete document request
  app.delete("/api/admin/document-requests/:id", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const id = Number(req.params.id);
      const [deleted] = await db.delete(documentRequestsTable)
        .where(eq(documentRequestsTable.id, id))
        .returning();
      
      if (!deleted) return res.status(404).json({ message: "Request not found" });
      
      await db.insert(auditLogs).values({
        action: 'document_request_deleted',
        userId: req.session.userId,
        targetId: String(id),
        details: { requestId: deleted.requestId },
      });
      
      res.json({ success: true });
    } catch (error) {
      log.error("Error deleting document request", error);
      res.status(500).json({ message: "Error deleting document request" });
    }
  }));

  // Admin invoice preview
  app.get("/api/admin/invoice/:id", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      res.setHeader('Content-Type', 'text/html');
      res.send(generateInvoiceHtml(order));
    } catch (err) {
      log.error("Error fetching admin invoice:", err);
      res.status(500).json({ message: "Error fetching invoice" });
    }
  }));

  // Add order event (admin only)
  app.post("/api/admin/orders/:id/events", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      const { eventType: rawEventType, description: rawDescription } = req.body;
      
      if (!rawEventType || !rawDescription) {
        return res.status(400).json({ message: "eventType and description are required" });
      }
      
      const eventType = sanitizeHtml(rawEventType);
      const description = sanitizeHtml(rawDescription);
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const [event] = await db.insert(orderEvents).values({
        orderId,
        eventType,
        description,
        createdBy: req.session.userId,
      }).returning();
      
      // Send email notification to user
      if (order) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, order.userId)).limit(1);
        if (user?.email) {
          const evtLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
          const [llcAppEvt] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.orderId, orderId)).limit(1);
          const [maintAppEvt] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.orderId, orderId)).limit(1);
          const orderCode = llcAppEvt?.requestCode || maintAppEvt?.requestCode || order.invoiceNumber || `#${order.id}`;
          const subjectMap: Record<string, string> = {
            es: `Actualización de tu pedido ${orderCode}`,
            en: `Update on your order ${orderCode}`,
            ca: `Actualització de la teva comanda ${orderCode}`,
            fr: `Mise à jour de votre commande ${orderCode}`,
            de: `Aktualisierung Ihrer Bestellung ${orderCode}`,
            it: `Aggiornamento del tuo ordine ${orderCode}`,
            pt: `Atualização do seu pedido ${orderCode}`
          };
          sendEmail({
            to: user.email,
            subject: subjectMap[evtLang] || subjectMap.es,
            html: getOrderEventTemplate(user.firstName || '', orderCode, eventType, description, evtLang)
          }).catch((err) => log.warn("Failed to send email", { error: err?.message }));
        }
      }
      
      res.json(event);
    } catch (error) {
      log.error("Error creating order event", error);
      res.status(500).json({ message: "Error creating event" });
    }
  }));

  // Generate invoice for order
  app.post("/api/admin/orders/:id/generate-invoice", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      
      // Get existing order data
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Optional: update amount/currency if provided
      const updateData: any = { isInvoiceGenerated: true };
      if (req.body.amount) updateData.amount = req.body.amount;
      if (req.body.currency) updateData.currency = req.body.currency;
      
      const [updatedOrder] = await db.update(ordersTable)
        .set(updateData)
        .where(eq(ordersTable.id, orderId))
        .returning();

      // Automatically make invoice available in documentation center
      const [llcAppInv] = await db.select().from(llcApplicationsTable).where(eq(llcApplicationsTable.orderId, orderId)).limit(1);
      const [maintAppInv] = await db.select().from(maintenanceApplications).where(eq(maintenanceApplications.orderId, orderId)).limit(1);
      const displayInvoiceNumber = llcAppInv?.requestCode || maintAppInv?.requestCode || order.invoiceNumber;
      
      // Check if invoice already exists to avoid duplicates
      const existingDoc = await db.select().from(applicationDocumentsTable)
        .where(and(eq(applicationDocumentsTable.orderId, orderId), eq(applicationDocumentsTable.documentType, "invoice")))
        .limit(1);
      
      if (existingDoc.length === 0) {
        await db.insert(applicationDocumentsTable).values({
          orderId,
          fileName: `Factura ${displayInvoiceNumber}`,
          fileType: "application/pdf",
          fileUrl: `/api/orders/${orderId}/invoice`,
          documentType: "invoice",
          reviewStatus: "approved",
          uploadedBy: (req as any).session.userId
        });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      log.error("Error generating invoice", error);
      res.status(500).json({ message: "Error generating invoice" });
    }
  }));

  function generateInvoiceHtml(order: any) {
    const requestCode = order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber;
    const userName = order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Cliente';
    const userEmail = order.user?.email || '';
    const userPhone = order.user?.phone || '';
    const userClientId = order.user?.clientId || '';
    const userAddress = order.user ? [
      order.user.streetType,
      order.user.address,
      order.user.city,
      order.user.province,
      order.user.postalCode,
      order.user.country
    ].filter(Boolean).join(', ') : '';
    const userIdNumber = order.user?.idNumber ? `${order.user.idType?.toUpperCase() || 'ID'}: ${order.user.idNumber}` : '';
    const productName = order.product?.name || 'Servicio de Constitución LLC';
    const invoiceNumber = requestCode || order.invoiceNumber;
    
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Factura ${invoiceNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
          <style>
            @media print { 
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
              .no-print { display: none !important; }
              @page { margin: 1cm; }
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0A1F17; line-height: 1.6; background: #fff; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 3px solid #00C48C; }
            .logo-section h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
            .logo-section .subtitle { color: #6B7280; font-size: 13px; margin-top: 4px; }
            .invoice-info { text-align: right; }
            .invoice-badge { background: linear-gradient(135deg, #00C48C 0%, #00855F 100%); color: #0A1F17; padding: 10px 20px; border-radius: 100px; font-weight: 900; font-size: 13px; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .invoice-number { font-size: 20px; font-weight: 800; color: #0A1F17; }
            .invoice-date { font-size: 13px; color: #6B7280; margin-top: 4px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-bottom: 50px; }
            .detail-box { background: #F7F7F5; padding: 25px; border-radius: 16px; }
            .detail-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #00C48C; margin-bottom: 12px; letter-spacing: 0.08em; }
            .detail-content p { font-size: 14px; margin-bottom: 4px; }
            .detail-content strong { font-weight: 700; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .items-table thead th { text-align: left; padding: 16px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; border-bottom: 2px solid #E6E9EC; }
            .items-table thead th:last-child { text-align: right; }
            .items-table tbody td { padding: 20px 12px; font-size: 15px; border-bottom: 1px solid #F7F7F5; }
            .items-table tbody td:last-child { text-align: right; font-weight: 600; }
            .totals-section { display: flex; justify-content: flex-end; margin-bottom: 50px; }
            .totals-box { background: linear-gradient(135deg, #F7F7F5 0%, #E6E9EC 100%); padding: 30px; border-radius: 20px; min-width: 280px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .totals-row.final { border-top: 2px solid #0A1F17; padding-top: 15px; margin-top: 15px; margin-bottom: 0; }
            .totals-row.final .label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; }
            .totals-row.final .amount { font-size: 28px; font-weight: 900; color: #0A1F17; }
            .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E6E9EC; font-size: 12px; color: #6B7280; }
            .footer p { margin-bottom: 4px; }
            .print-controls { text-align: center; margin-bottom: 30px; }
            .print-btn { background: #00C48C; color: #0A1F17; padding: 14px 35px; border: none; border-radius: 100px; font-weight: 800; cursor: pointer; font-size: 14px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(0, 196, 140, 0.3); }
            .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 196, 140, 0.4); }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
          </div>
          
          <div class="header">
            <div class="logo-section">
              <img src="cid:logo-icon" alt="Exentax" style="width: 60px; height: 60px; margin-bottom: 10px; border-radius: 12px;">
              <h1>Exentax</h1>
              <p class="subtitle">Servicios de Constitución Empresarial</p>
            </div>
            <div class="invoice-info">
              <div class="invoice-badge">Factura</div>
              <div class="invoice-number">${invoiceNumber}</div>
              <div class="invoice-date">Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-box">
              <div class="detail-label">Datos del Emisor</div>
              <div class="detail-content">
                <p><strong>EXENTAX</strong></p>
                <p>FORTUNY CONSULTING LLC</p>
                <p>One Franklin Square, 1301 K St NW</p>
                <p>Washington, DC 20005, USA</p>
                <p style="margin-top: 10px;">hola@exentax.com</p>
                <p>+34 614 91 69 10</p>
              </div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Datos del Cliente</div>
              <div class="detail-content">
                <p><strong>${userName}</strong></p>
                ${userClientId ? `<p style="font-size: 12px; color: #6B7280;"><strong>ID Cliente:</strong> ${userClientId}</p>` : ''}
                ${userIdNumber ? `<p>${userIdNumber}</p>` : ''}
                <p>${userEmail}</p>
                ${userPhone ? `<p>${userPhone}</p>` : ''}
                ${userAddress ? `<p style="margin-top: 6px;">${userAddress}</p>` : ''}
                <p style="margin-top: 10px;"><strong>Ref. Pedido:</strong> ${requestCode}</p>
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Descripción del Servicio</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${productName}</strong><br><span style="color: #6B7280; font-size: 13px;">Servicio completo de constitución empresarial en USA</span></td>
                <td>${((order.originalAmount || order.amount) / 100).toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${((order.originalAmount || order.amount) / 100).toFixed(2)} €</span>
              </div>
              ${order.discountCode ? `
              <div class="totals-row" style="color: #00C48C;">
                <span>Descuento (${order.discountCode})</span>
                <span>-${(order.discountAmount / 100).toFixed(2)} €</span>
              </div>
              ` : ''}
              <div class="totals-row">
                <span>IVA (0%)</span>
                <span>0.00 €</span>
              </div>
              <div class="totals-row final">
                <span class="label">Total</span>
                <span class="amount">${(order.amount / 100).toFixed(2)} €</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>EXENTAX</strong> • FORTUNY CONSULTING LLC</p>
            <p>One Franklin Square, 1301 K St NW, Washington, DC 20005, USA</p>
            <p>hola@exentax.com • +34 614 91 69 10 • www.exentax.com</p>
          </div>
        </body>
      </html>
    `;
  }
}
