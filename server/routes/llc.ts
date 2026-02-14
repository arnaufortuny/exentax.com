import type { Express, Response } from "express";
import { z } from "zod";
import { eq, and, gt, sql } from "drizzle-orm";
import { db, storage, isAuthenticated, isNotUnderReview, isAdmin, logAudit, getClientIp, asyncHandler, parseIdParam } from "./shared";
import { api } from "@shared/routes";
import { insertLlcApplicationSchema, insertApplicationDocumentSchema, contactOtps, users as usersTable, orders as ordersTable, llcApplications as llcApplicationsTable, applicationDocuments as applicationDocumentsTable, discountCodes, userNotifications, messages as messagesTable, documentRequests as documentRequestsTable } from "@shared/schema";
import { sendEmail, getWelcomeEmailTemplate, getConfirmationEmailTemplate, getAdminLLCOrderTemplate } from "../lib/email";
import { EmailLanguage, getWelcomeEmailSubject } from "../lib/email-translations";
import { validateEmail, normalizeEmail, checkRateLimit, sanitizeObject, sanitizeHtml } from "../lib/security";
import { createLogger } from "../lib/logger";
import { captureServerError } from "../lib/sentry";

const log = createLogger('llc');

export function registerLlcRoutes(app: Express) {
  // Claim order endpoint - creates account and associates with existing order
  app.post("/api/llc/claim-order", asyncHandler(async (req: any, res: Response) => {
    try {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit('register', ip);
      if (!rateCheck.allowed) {
        return res.status(429).json({ message: `Too many attempts. Wait ${rateCheck.retryAfter} seconds.` });
      }

      let { applicationId, email, password, ownerFullName, paymentMethod, discountCode, discountAmount } = req.body;
      
      if (!applicationId || !email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      email = normalizeEmail(email);

      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format." });
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
      
      const application = await storage.getLlcApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Request not found." });
      }
      
      if (application.orderId) {
        const [existingOrder] = await db.select().from(ordersTable).where(eq(ordersTable.id, application.orderId)).limit(1);
        if (existingOrder && existingOrder.userId) {
          return res.status(400).json({ message: "This order is already associated with an account. Please log in." });
        }
      }
      
      // Create new user with verified email and copy address fields from application
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
        phone: application.ownerPhone || null,
        streetType: application.ownerStreetType || null,
        address: application.ownerAddress || null,
        city: application.ownerCity || null,
        province: application.ownerProvince || null,
        postalCode: application.ownerPostalCode || null,
        country: application.ownerCountry || null,
        birthDate: application.ownerBirthDate || null,
        businessActivity: application.businessActivity || null,
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
      
      // Update LLC application with paymentMethod if provided
      if (paymentMethod) {
        await storage.updateLlcApplication(applicationId, { paymentMethod });
      }
      
      // Set session for the new user
      req.session.userId = newUser.id;
      
      const llcLang = (req.body.preferredLanguage || 'es') as EmailLanguage;
      sendEmail({
        to: email,
        subject: getWelcomeEmailSubject(llcLang),
        html: getWelcomeEmailTemplate(nameParts[0] || undefined, llcLang)
      }).catch((err: any) => log.error('Failed to send welcome email', err));
      
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      log.error("Error claiming order", error);
      captureServerError(error instanceof Error ? error : new Error(String(error)), { route: 'POST /api/llc/claim-order' });
      res.status(500).json({ message: "Error creating account." });
    }
  }));

  // Client Update LLC Application Data
  app.patch("/api/llc/:id/data", isAuthenticated, isNotUnderReview, asyncHandler(async (req: any, res: Response) => {
    try {
      const appId = parseIdParam(req);
      const updates = req.body;
      
      // Security: Check if EIN has been assigned - if so, data is locked
      const [existingApp] = await db.select({ ein: llcApplicationsTable.ein, orderId: llcApplicationsTable.orderId })
        .from(llcApplicationsTable)
        .where(eq(llcApplicationsTable.id, appId))
        .limit(1);
      
      if (!existingApp) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // If EIN is assigned, only admin can modify
      if (existingApp.ein && !req.session.isAdmin) {
        return res.status(403).json({ message: "Data cannot be modified after EIN assignment. Contact support." });
      }
      
      // Verify ownership for non-admin users
      if (existingApp.orderId && !req.session.isAdmin) {
        const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, existingApp.orderId)).limit(1);
        if (order && order.userId !== req.session.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const sanitizedUpdates = sanitizeObject(updates, ['companyName', 'companyNameOption2', 'businessActivity', 'businessCategory', 'businessCategoryOther', 'companyDescription', 'notes', 'ownerFullName', 'ownerAddress', 'ownerCity', 'ownerProvince']);
      const [updated] = await db.update(llcApplicationsTable)
        .set({ ...sanitizedUpdates, lastUpdated: new Date() })
        .where(eq(llcApplicationsTable.id, appId))
        .returning();
      res.json(updated);
    } catch (error) {
      log.error("Error updating LLC application", error);
      res.status(500).json({ message: "Error updating application" });
    }
  }));
  app.get(api.llc.get.path, isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const appId = parseIdParam(req);
    
    const application = await storage.getLlcApplication(appId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Security: Verify user owns this application or is admin
    if (!req.session.userId && !req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get order to check ownership
    if (application.orderId) {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, application.orderId)).limit(1);
      if (order && order.userId !== req.session.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(application);
  }));

  app.put(api.llc.update.path, isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    try {
      const appId = parseIdParam(req);
      const updates = api.llc.update.input.parse(req.body);

      const application = await storage.getLlcApplication(appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Security: Check if EIN has been assigned - if so, data is locked
      if (application.ein && !req.session.isAdmin) {
        return res.status(403).json({ message: "Data cannot be modified after EIN assignment. Contact support." });
      }

      // Security: Verify ownership for non-admin users
      if (application.orderId && !req.session.isAdmin) {
        const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, application.orderId)).limit(1);
        if (order && order.userId && order.userId !== req.session.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const updatedApp = await storage.updateLlcApplication(appId, updates);
      
      // If status is being updated to "submitted", send confirmation email
      if (updates.status === "submitted" && updatedApp.ownerEmail) {
        const orderIdentifier = updatedApp.requestCode || `#${updatedApp.id}`;
        
        // Get order info for price
        const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, updatedApp.orderId)).limit(1);
        const orderAmount = order ? (order.amount / 100).toFixed(2) : 'N/A';
        
        // Email notification to admin about completed order
        const { ADMIN_EMAIL: adminEmail } = await import("../lib/config");
        const paymentMethodLabel = updatedApp.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : updatedApp.paymentMethod === 'link' ? 'Link de Pago' : 'No especificado';
        
        sendEmail({
          to: adminEmail,
          subject: `[PEDIDO REALIZADO] ${orderIdentifier} - ${updatedApp.companyName}`,
          html: getAdminLLCOrderTemplate({
            orderIdentifier,
            amount: orderAmount,
            paymentMethod: paymentMethodLabel,
            ownerFullName: updatedApp.ownerFullName || undefined,
            ownerEmail: updatedApp.ownerEmail || undefined,
            ownerPhone: updatedApp.ownerPhone || undefined,
            ownerBirthDate: updatedApp.ownerBirthDate || undefined,
            ownerIdType: updatedApp.ownerIdType || undefined,
            ownerIdNumber: updatedApp.ownerIdNumber || undefined,
            ownerAddress: `${updatedApp.ownerStreetType || ''} ${updatedApp.ownerAddress || ''}`.trim() || undefined,
            ownerCity: updatedApp.ownerCity || undefined,
            ownerProvince: updatedApp.ownerProvince || undefined,
            ownerPostalCode: updatedApp.ownerPostalCode || undefined,
            ownerCountry: updatedApp.ownerCountry || undefined,
            companyName: updatedApp.companyName || undefined,
            companyNameOption2: updatedApp.companyNameOption2 || undefined,
            designator: updatedApp.designator || undefined,
            state: updatedApp.state || undefined,
            businessCategory: updatedApp.businessCategory === "Otra (especificar)" ? (updatedApp.businessCategoryOther || undefined) : (updatedApp.businessCategory || undefined),
            businessActivity: updatedApp.businessActivity || undefined,
            companyDescription: updatedApp.companyDescription || undefined,
            isSellingOnline: updatedApp.isSellingOnline || undefined,
            needsBankAccount: updatedApp.needsBankAccount || undefined,
            willUseStripe: updatedApp.willUseStripe || undefined,
            wantsBoiReport: updatedApp.wantsBoiReport || undefined,
            wantsMaintenancePack: updatedApp.wantsMaintenancePack || undefined,
            notes: updatedApp.notes || undefined
          })
        }).catch((err) => log.warn("Failed to send email", { error: err?.message }));

        // Confirmation to client with full info
        sendEmail({
          to: updatedApp.ownerEmail,
          subject: `Solicitud recibida - Referencia ${orderIdentifier}`,
          html: getConfirmationEmailTemplate(updatedApp.ownerFullName || "Cliente", orderIdentifier, { companyName: updatedApp.companyName || undefined }),
        }).catch((err) => log.warn("Failed to send email", { error: err?.message }));
    }

    res.json(updatedApp);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    log.error("Error updating LLC application", err);
    res.status(500).json({ message: "Error updating request" });
  }
}));

  // Lookup by request code - requires authentication
  app.get(api.llc.getByCode.path, isAuthenticated, asyncHandler(async (req: any, res: Response) => {
    const code = req.params.code;
    
    const application = await storage.getLlcApplicationByRequestCode(code);
    if (!application) {
      return res.status(404).json({ message: "Request not found. Verify the code entered." });
    }

    // Security: Only allow owner or admin to view
    if (application.orderId) {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, application.orderId)).limit(1);
      if (order && order.userId && req.session.userId !== order.userId && !req.session.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(application);
  }));

  // Documents - requires authentication
  app.post(api.documents.create.path, isAuthenticated, isNotUnderReview, asyncHandler(async (req: any, res: Response) => {
    try {
      const docData = api.documents.create.input.parse(req.body);
      
      if (docData.applicationId) {
        const application = await storage.getLlcApplication(docData.applicationId);
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        
        // Security: Verify ownership
        if (application.orderId && !req.session.isAdmin) {
          const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, application.orderId)).limit(1);
          if (order && order.userId && order.userId !== req.session.userId) {
            return res.status(403).json({ message: "Access denied" });
          }
        }
      }

      const document = await storage.createDocument(docData);
      res.status(201).json(document);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  }));

  // Client document upload endpoint
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  
  app.post("/api/user/documents/upload", isAuthenticated, isNotUnderReview, asyncHandler(async (req: any, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Get user's orders to attach document (if any)
      const userOrders = await storage.getOrders(userId);
      
      // Also check if user has pending document requests (action_required notifications)
      const pendingRequests = await db.select().from(userNotifications)
        .where(and(
          eq(userNotifications.userId, userId),
          eq(userNotifications.type, 'action_required'),
          eq(userNotifications.isRead, false)
        ));
      
      // Allow upload if user has orders OR pending document requests
      const hasOrdersOrRequests = userOrders.length > 0 || pendingRequests.length > 0;

      // Use busboy for file handling with size limit
      const busboy = (await import('busboy')).default;
      const bb = busboy({ 
        headers: req.headers,
        limits: { fileSize: MAX_FILE_SIZE_BYTES }
      });
      
      let fileName = '';
      let fileBuffer: Buffer | null = null;
      let fileTruncated = false;
      let documentType = 'passport';
      let notes = '';
      
      bb.on('field', (name: string, val: string) => {
        if (name === 'documentType') documentType = val;
        if (name === 'notes') notes = sanitizeHtml(val);
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
        
        if (!fileBuffer) {
          return res.status(400).json({ message: "No file received" });
        }
        
        // Validate file extension
        const ext = fileName.toLowerCase().split('.').pop() || '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return res.status(400).json({ message: "File type not allowed. Only accepted: PDF, JPG, JPEG, PNG" });
        }
        
        // Validate MIME type
        if (!ALLOWED_MIMES.includes(detectedMime)) {
          return res.status(400).json({ message: "Invalid file format" });
        }

        // Save file (in production, use cloud storage)
        const fs = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'uploads', 'client-docs');
        await fs.mkdir(uploadDir, { recursive: true });
        
        const safeFileName = `${userId}_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, safeFileName);
        await fs.writeFile(filePath, fileBuffer);
        
        // Generate ticket ID for this document upload (8-digit format)
        const { generateUniqueMessageId } = await import("../lib/id-generator");
        const ticketId = await generateUniqueMessageId();
        
        const docTypeLabelsUpload: Record<string, Record<string, string>> = {
          'passport': { es: 'Pasaporte / Documento de Identidad', en: 'Passport / ID Document', ca: 'Passaport / Document d\'Identitat', fr: 'Passeport / Pièce d\'identité', de: 'Reisepass / Ausweis', it: 'Passaporto / Documento d\'identità', pt: 'Passaporte / Documento de Identidade' },
          'address_proof': { es: 'Comprobante de Domicilio', en: 'Proof of Address', ca: 'Comprovant de Domicili', fr: 'Justificatif de domicile', de: 'Adressnachweis', it: 'Prova di indirizzo', pt: 'Comprovante de Endereço' },
          'tax_id': { es: 'Identificación Fiscal', en: 'Tax ID', ca: 'Identificació Fiscal', fr: 'Identification fiscale', de: 'Steuer-ID', it: 'Codice fiscale', pt: 'Identificação Fiscal' },
          'other': { es: 'Otro Documento', en: 'Other Document', ca: 'Altre Document', fr: 'Autre document', de: 'Anderes Dokument', it: 'Altro documento', pt: 'Outro Documento' }
        };
        const userForLang = await db.select({ preferredLanguage: usersTable.preferredLanguage }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        const userLang = (userForLang[0]?.preferredLanguage as string) || 'es';
        const docTypeLabel = docTypeLabelsUpload[documentType]?.[userLang] || docTypeLabelsUpload[documentType]?.es || documentType;
        
        // Determine orderId - from orders or from pending request
        let targetOrderId: number | null = null;
        if (userOrders.length > 0) {
          targetOrderId = userOrders[0].id;
        } else if (pendingRequests.length > 0 && pendingRequests[0].orderId) {
          targetOrderId = pendingRequests[0].orderId;
        }
        
        // Determine file type from extension (ext already validated above)
        const mimeTypesMap: Record<string, string> = {
          'pdf': 'application/pdf',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png'
        };
        const fileExt = fileName.toLowerCase().split('.').pop() || '';
        const detectedFileType = mimeTypesMap[fileExt] || 'application/octet-stream';
        
        const doc = await db.transaction(async (tx) => {
          const [insertedDoc] = await tx.insert(applicationDocumentsTable).values({
            orderId: targetOrderId,
            userId: userId,
            fileName: fileName,
            fileType: detectedFileType,
            fileUrl: `/uploads/client-docs/${safeFileName}`,
            documentType: documentType,
            reviewStatus: 'pending',
            uploadedBy: userId
          }).returning();

          if (insertedDoc) {
            const matchingRequests = await tx.select().from(documentRequestsTable)
              .where(and(
                eq(documentRequestsTable.userId, userId),
                eq(documentRequestsTable.documentType, documentType),
                sql`${documentRequestsTable.status} IN ('sent', 'pending_upload')`
              ))
              .limit(1);
            
            if (matchingRequests.length > 0) {
              await tx.update(documentRequestsTable)
                .set({ 
                  status: 'uploaded', 
                  linkedDocumentId: insertedDoc.id,
                  updatedAt: new Date() 
                })
                .where(eq(documentRequestsTable.id, matchingRequests[0].id));
            }
          }
          
          return [insertedDoc];
        });

        // Get user data for admin notification
        const userData = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        const user = userData[0];
        
        if (user) {
          const { encrypt } = await import("../utils/encryption");
          
          const docSubjects: Record<string, string> = {
            es: `Documento Recibido: ${docTypeLabel}`,
            en: `Document Received: ${docTypeLabel}`,
            ca: `Document Rebut: ${docTypeLabel}`,
            fr: `Document Reçu: ${docTypeLabel}`,
            de: `Dokument Erhalten: ${docTypeLabel}`,
            it: `Documento Ricevuto: ${docTypeLabel}`,
            pt: `Documento Recebido: ${docTypeLabel}`
          };
          const docMessages: Record<string, (type: string, notes: string) => string> = {
            es: (type, n) => `Tu documento ha sido recibido correctamente.\n\nTipo: ${type}${n}\n\nNuestro equipo lo revisará pronto. Recibirás una notificación cuando sea procesado.`,
            en: (type, n) => `Your document has been received successfully.\n\nType: ${type}${n}\n\nOur team will review it shortly. You will receive a notification when it is processed.`,
            ca: (type, n) => `El teu document ha estat rebut correctament.\n\nTipus: ${type}${n}\n\nEl nostre equip el revisarà aviat. Rebràs una notificació quan sigui processat.`,
            fr: (type, n) => `Votre document a été reçu avec succès.\n\nType: ${type}${n}\n\nNotre équipe l'examinera bientôt. Vous recevrez une notification lorsqu'il sera traité.`,
            de: (type, n) => `Ihr Dokument wurde erfolgreich empfangen.\n\nTyp: ${type}${n}\n\nUnser Team wird es in Kürze prüfen. Sie erhalten eine Benachrichtigung, wenn es bearbeitet wird.`,
            it: (type, n) => `Il tuo documento è stato ricevuto correttamente.\n\nTipo: ${type}${n}\n\nIl nostro team lo esaminerà a breve. Riceverai una notifica quando sarà elaborato.`,
            pt: (type, n) => `O seu documento foi recebido com sucesso.\n\nTipo: ${type}${n}\n\nA nossa equipa irá revê-lo em breve. Receberá uma notificação quando for processado.`
          };
          const notesLabels: Record<string, string> = { es: 'Notas', en: 'Notes', ca: 'Notes', fr: 'Notes', de: 'Notizen', it: 'Note', pt: 'Notas' };
          const notesText = documentType === 'other' && notes ? `\n${notesLabels[userLang] || 'Notas'}: ${notes}` : '';
          const userVisibleContent = (docMessages[userLang] || docMessages.es)(docTypeLabel, notesText);
          const adminInternalContent = `[ADMIN] Archivo: ${fileName} | Ruta: ${doc[0].fileUrl}`;
          const clientLabels: Record<string, string> = { es: 'Cliente', en: 'Client', ca: 'Client', fr: 'Client', de: 'Kunde', it: 'Cliente', pt: 'Cliente' };
          
          await db.insert(messagesTable).values({
            userId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || clientLabels[userLang] || 'Cliente',
            email: user.email || 'sin-email@cliente.com',
            subject: docSubjects[userLang] || docSubjects.es,
            content: userVisibleContent,
            encryptedContent: encrypt(adminInternalContent),
            type: 'support',
            status: 'unread',
            messageId: ticketId
          });
        }
        
        if (pendingRequests.length > 0) {
          await db.update(userNotifications)
            .set({ 
              type: 'info',
              title: 'i18n:ntf.docInReview.title',
              message: 'i18n:ntf.docInReview.message',
              isRead: false
            })
            .where(and(
              eq(userNotifications.userId, userId),
              eq(userNotifications.type, 'action_required')
            ));
        }

        logAudit({
          action: 'document_upload',
          userId: userId.toString(),
          targetId: doc[0].id.toString(),
          details: { documentType, fileName, ticketId }
        });

        const safeDoc = { id: doc[0].id, documentType: doc[0].documentType, reviewStatus: doc[0].reviewStatus, uploadedAt: doc[0].uploadedAt };
        res.json({ success: true, document: safeDoc, ticketId });
      });

      req.pipe(bb);
    } catch (error: any) {
      log.error("Client upload error", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  }));

  // Payment simulation endpoint for LLC
  // PROTECTED: Only admin can manually mark orders as paid
  app.post("/api/llc/:id/pay", isAdmin, asyncHandler(async (req: any, res: Response) => {
    try {
      const appId = parseIdParam(req);
      const application = await storage.getLlcApplication(appId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Update order status to paid
      if (application.orderId) {
        await storage.updateOrderStatus(application.orderId, "paid");
        logAudit({
          action: 'payment_received',
          userId: req.session.userId,
          targetId: application.orderId.toString(),
          details: { applicationId: appId, markedBy: 'admin' }
        });
      }
      
      // Update application status to submitted
      await storage.updateLlcApplication(appId, { status: "submitted", paymentStatus: "paid" });
      
      res.json({ success: true, message: "Payment successful" });
    } catch (error) {
      log.error("Payment error", error);
      captureServerError(error instanceof Error ? error : new Error(String(error)), { route: 'POST /api/llc/payment' });
      res.status(500).json({ message: "Payment processing failed" });
    }
  }));
}
