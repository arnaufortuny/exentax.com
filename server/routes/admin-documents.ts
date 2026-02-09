import type { Express } from "express";
import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { db, storage, isAdmin, isAdminOrSupport } from "./shared";
import { orders as ordersTable, users as usersTable, maintenanceApplications, orderEvents, userNotifications, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable, messages as messagesTable } from "@shared/schema";
import { sendEmail, getDocumentUploadedTemplate, getAdminNoteTemplate, getPaymentRequestTemplate, getDocumentRequestTemplate, getOrderEventTemplate, getDocumentApprovedTemplate, getDocumentRejectedTemplate } from "../lib/email";
import { EmailLanguage } from "../lib/email-translations";
import { updateApplicationDeadlines } from "../calendar-service";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function registerAdminDocumentsRoutes(app: Express) {
  // Document Management - Upload official docs by Admin
  app.post("/api/admin/documents", isAdminOrSupport, async (req, res) => {
    try {
      const { orderId, fileName, fileUrl, documentType, applicationId } = req.body;
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
      console.error("Upload doc error:", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  });

  // Admin upload document file for client (supports orderId OR userId)
  app.post("/api/admin/documents/upload", isAdminOrSupport, async (req: any, res) => {
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
        await fs.writeFile(filePath, fileBuffer);
        
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
          
          // Dashboard notification
          await db.insert(userNotifications).values({
            userId: finalUserId,
            orderId: orderId ? Number(orderId) : null,
            orderCode: orderCode || 'General',
            title: 'Nuevo documento disponible',
            message: `Se ha añadido el documento "${docLabel}" a tu expediente.`,
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
            }).catch(() => {});
          }
        }
        
        res.json(doc);
      });

      req.pipe(bb);
    } catch (error) {
      console.error("Admin upload doc error:", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  });

  app.get("/api/admin/documents", isAdminOrSupport, async (req, res) => {
    try {
      const docs = await db.select().from(applicationDocumentsTable)
        .leftJoin(ordersTable, eq(applicationDocumentsTable.orderId, ordersTable.id))
        .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
        .leftJoin(llcApplicationsTable, eq(applicationDocumentsTable.applicationId, llcApplicationsTable.id))
        .orderBy(desc(applicationDocumentsTable.uploadedAt));
      res.json(docs.map(d => ({
        ...d.application_documents,
        order: d.orders,
        user: d.users ? { id: d.users.id, firstName: d.users.firstName, lastName: d.users.lastName, email: d.users.email } : null,
        application: d.llc_applications ? { companyName: d.llc_applications.companyName, state: d.llc_applications.state } : null
      })));
    } catch (error) {
      console.error("Admin documents error:", error);
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.patch("/api/admin/documents/:id/review", isAdminOrSupport, async (req, res) => {
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
      
      // Get document details and user info for notification
      const [docWithOrder] = await db.select({
        doc: applicationDocumentsTable,
        order: ordersTable,
        user: usersTable
      })
        .from(applicationDocumentsTable)
        .leftJoin(ordersTable, eq(applicationDocumentsTable.orderId, ordersTable.id))
        .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
        .where(eq(applicationDocumentsTable.id, docId))
        .limit(1);
      
      if (docWithOrder?.user) {
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
        
        if (reviewStatus === 'approved') {
          // Notify client: document approved
          await db.insert(userNotifications).values({
            userId: docWithOrder.user.id,
            orderId: docWithOrder.order?.id || null,
            orderCode: docWithOrder.order?.invoiceNumber || 'General',
            title: 'Documento aprobado',
            message: `Tu documento "${docLabel}" ha sido revisado y aprobado.`,
            type: 'success',
            isRead: false
          });
          
          const userLang = ((docWithOrder.user as any).preferredLanguage || 'es') as EmailLanguage;
          const approvedSubjects: Record<string, string> = { en: 'Document approved', ca: 'Document aprovat', fr: 'Document approuvé', de: 'Dokument genehmigt', it: 'Documento approvato', pt: 'Documento aprovado' };
          sendEmail({
            to: docWithOrder.user.email!,
            subject: `${approvedSubjects[userLang] || 'Documento aprobado'} - ${docLabel}`,
            html: getDocumentApprovedTemplate(
              docWithOrder.user.firstName || '',
              docLabel,
              userLang
            )
          }).catch(console.error);
        } else if (reviewStatus === 'rejected') {
          // Notify client: document rejected - request again
          const reason = rejectionReason || 'No cumple los requisitos necesarios';
          await db.insert(userNotifications).values({
            userId: docWithOrder.user.id,
            orderId: docWithOrder.order?.id || null,
            orderCode: docWithOrder.order?.invoiceNumber || 'General',
            title: 'Documento rechazado - Acción requerida',
            message: `Tu documento "${docLabel}" ha sido rechazado. Motivo: ${reason}. Por favor, sube nuevamente el documento.`,
            type: 'action_required',
            isRead: false
          });
          
          const rejLang = ((docWithOrder.user as any).preferredLanguage || 'es') as EmailLanguage;
          const rejSubjects: Record<string, string> = { en: 'Action required - Document rejected', ca: 'Acció requerida - Document rebutjat', fr: 'Action requise - Document rejeté', de: 'Handlung erforderlich - Dokument abgelehnt', it: 'Azione richiesta - Documento rifiutato', pt: 'Ação necessária - Documento rejeitado' };
          sendEmail({
            to: docWithOrder.user.email!,
            subject: rejSubjects[rejLang] || 'Acción requerida - Documento rechazado',
            html: getDocumentRejectedTemplate(
              docWithOrder.user.firstName || '',
              docLabel,
              reason,
              rejLang
            )
          }).catch(console.error);
        }
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Document review error:", error);
      res.status(500).json({ message: "Error updating document review status" });
    }
  });

  app.delete("/api/admin/documents/:id", isAdmin, async (req, res) => {
    try {
      const docId = Number(req.params.id);
      await db.delete(applicationDocumentsTable).where(eq(applicationDocumentsTable.id, docId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting document" });
    }
  });

  app.post("/api/admin/applications/:id/set-formation-date", isAdmin, async (req, res) => {
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
      console.error("Error setting formation date:", error);
      res.status(500).json({ message: "Error setting formation date" });
    }
  });

  // User notifications - Unified Note + Email System
  app.post("/api/admin/send-note", isAdmin, async (req, res) => {
    try {
      const { userId, title, message, type } = z.object({
        userId: z.string(),
        title: z.string().min(1, "Title required"),
        message: z.string().min(1, "Mensaje requerido"),
        type: z.enum(['update', 'info', 'action_required'])
      }).parse(req.body);

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
      console.error("Error sending note:", error);
      res.status(500).json({ message: "Error sending note" });
    }
  });

  // Admin Payment Link system
  app.post("/api/admin/send-payment-link", isAdmin, async (req, res) => {
    try {
      const { userId, paymentLink, message, amount } = z.object({
        userId: z.string(),
        paymentLink: z.string().url(),
        message: z.string(),
        amount: z.string().optional()
      }).parse(req.body);

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!user || !user.email) return res.status(404).json({ message: "User or email not found" });

      const payLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
      await sendEmail({
        to: user.email,
        subject: payLang === 'en' ? "Payment pending - Easy US LLC" : payLang === 'ca' ? "Pagament pendent - Easy US LLC" : payLang === 'fr' ? "Paiement en attente - Easy US LLC" : payLang === 'de' ? "Zahlung ausstehend - Easy US LLC" : payLang === 'it' ? "Pagamento in sospeso - Easy US LLC" : payLang === 'pt' ? "Pagamento pendente - Easy US LLC" : "Pago pendiente - Easy US LLC",
        html: getPaymentRequestTemplate(user.firstName || '', amount || '', paymentLink, message, payLang)
      });

      // Create internal notification
      await db.insert(userNotifications).values({
        userId,
        title: "Pago Pendiente Solicitado",
        message: `Se ha enviado un enlace de pago por ${amount || 'el trámite'}. Revisa tu email.`,
        type: 'action_required',
        isRead: false
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Send payment link error:", error);
      res.status(500).json({ message: "Error sending payment link" });
    }
  });

  // Request document from client
  app.post("/api/admin/request-document", isAdminOrSupport, async (req, res) => {
    try {
      const { email, documentType, message, userId } = z.object({
        email: z.string().email(),
        documentType: z.string(),
        message: z.string(),
        userId: z.string().optional()
      }).parse(req.body);

      const { generateDocRequestId } = await import("../lib/id-generator");
      const msgId = generateDocRequestId();
      
      const docTypeLabels: Record<string, string> = {
        'passport': 'Pasaporte / Documento de Identidad',
        'address_proof': 'Comprobante de Domicilio',
        'tax_id': 'Identificación Fiscal',
        'other': 'Otro Documento'
      };
      const docTypeLabel = docTypeLabels[documentType] || documentType;
      
      const [reqUser] = userId ? await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1) : [null];
      const reqLang = ((reqUser as any)?.preferredLanguage || 'es') as EmailLanguage;
      const reqSubjects: Record<string, string> = { en: 'Action Required: Documentation Request', ca: 'Acció Requerida: Sol·licitud de Documentació', fr: 'Action Requise : Demande de Documentation', de: 'Handlung Erforderlich: Dokumentationsanfrage', it: 'Azione Richiesta: Richiesta di Documentazione', pt: 'Ação Necessária: Solicitação de Documentação' };
      await sendEmail({
        to: email,
        subject: reqSubjects[reqLang] || 'Acción Requerida: Solicitud de Documentación',
        html: getDocumentRequestTemplate(reqUser?.firstName || '', docTypeLabel, message, msgId, reqLang)
      });

      if (userId) {
        await db.insert(userNotifications).values({
          userId,
          title: "Acción Requerida: Subir Documento",
          message: `Se ha solicitado el documento: ${docTypeLabel}. Revisa tu email para más detalles.`,
          type: 'action_required',
          isRead: false
        });

        const { encrypt } = await import("../utils/encryption");
        await db.insert(messagesTable).values({
          userId,
          name: "Easy US LLC (Soporte)",
          email: "soporte@easyusllc.com",
          subject: `Solicitud de Documento: ${docTypeLabel}`,
          content: message,
          encryptedContent: encrypt(message),
          type: "support",
          status: "unread",
          messageId: msgId
        });
      }

      res.json({ success: true, messageId: msgId });
    } catch (error) {
      console.error("Request doc error:", error);
      res.status(500).json({ message: "Error requesting document" });
    }
  });

  // Admin invoice preview
  app.get("/api/admin/invoice/:id", isAdmin, async (req, res) => {
    const orderId = Number(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    res.setHeader('Content-Type', 'text/html');
    res.send(generateInvoiceHtml(order));
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
          const evtLang = ((user as any).preferredLanguage || 'es') as EmailLanguage;
          sendEmail({
            to: user.email,
            subject: evtLang === 'en' ? "Update on your order" : evtLang === 'ca' ? "Actualització del teu pedido" : evtLang === 'fr' ? "Mise à jour de votre commande" : evtLang === 'de' ? "Aktualisierung Ihrer Bestellung" : evtLang === 'it' ? "Aggiornamento del tuo ordine" : evtLang === 'pt' ? "Atualização do seu pedido" : "Actualización de tu pedido",
            html: getOrderEventTemplate(user.firstName || '', String(orderId), eventType, description, evtLang)
          }).catch(() => {});
        }
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error creating order event:", error);
      res.status(500).json({ message: "Error creating event" });
    }
  });

  // Generate invoice for order
  app.post("/api/admin/orders/:id/generate-invoice", isAdmin, async (req, res) => {
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
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Error generating invoice" });
    }
  });

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
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #0A0A0A; line-height: 1.6; background: #fff; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 3px solid #6EDC8A; }
            .logo-section h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
            .logo-section .subtitle { color: #6B7280; font-size: 13px; margin-top: 4px; }
            .invoice-info { text-align: right; }
            .invoice-badge { background: linear-gradient(135deg, #6EDC8A 0%, #4eca70 100%); color: #0A0A0A; padding: 10px 20px; border-radius: 100px; font-weight: 900; font-size: 13px; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
            .invoice-number { font-size: 20px; font-weight: 800; color: #0A0A0A; }
            .invoice-date { font-size: 13px; color: #6B7280; margin-top: 4px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-bottom: 50px; }
            .detail-box { background: #F7F7F5; padding: 25px; border-radius: 16px; }
            .detail-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6EDC8A; margin-bottom: 12px; letter-spacing: 0.08em; }
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
            .totals-row.final { border-top: 2px solid #0A0A0A; padding-top: 15px; margin-top: 15px; margin-bottom: 0; }
            .totals-row.final .label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; }
            .totals-row.final .amount { font-size: 28px; font-weight: 900; color: #0A0A0A; }
            .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E6E9EC; font-size: 12px; color: #6B7280; }
            .footer p { margin-bottom: 4px; }
            .print-controls { text-align: center; margin-bottom: 30px; }
            .print-btn { background: #6EDC8A; color: #0A0A0A; padding: 14px 35px; border: none; border-radius: 100px; font-weight: 800; cursor: pointer; font-size: 14px; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3); }
            .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(110, 220, 138, 0.4); }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">Imprimir / Descargar PDF</button>
          </div>
          
          <div class="header">
            <div class="logo-section">
              <img src="cid:logo-icon" alt="Easy US LLC" style="width: 60px; height: 60px; margin-bottom: 10px; border-radius: 12px;">
              <h1>Easy US LLC</h1>
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
                <p><strong>EASY US LLC</strong></p>
                <p>FORTUNY CONSULTING LLC</p>
                <p>1209 Mountain Road Place NE, STE R</p>
                <p>Albuquerque, NM 87110, USA</p>
                <p style="margin-top: 10px;">hola@easyusllc.com</p>
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
              <div class="totals-row" style="color: #16a34a;">
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
            <p><strong>EASY US LLC</strong> • FORTUNY CONSULTING LLC</p>
            <p>1209 Mountain Road Place NE, STE R, Albuquerque, NM 87110, USA</p>
            <p>hola@easyusllc.com • +34 614 91 69 10 • www.easyusllc.com</p>
          </div>
        </body>
      </html>
    `;
  }
}
