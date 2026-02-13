import nodemailer from "nodemailer";
import { EmailLanguage, getEmailTranslations, getCommonDoubtsText, getDefaultClientName } from "./email-translations";
import { createLogger } from "./logger";

const log = createLogger('email');

const domain = "exentax.com";
const companyAddress = `Exentax
1209 Mountain Road Place Northeast
STE R
Albuquerque, NM 87110`;

const EMAIL_LOGO = "cid:logo-icon";

function getSimpleHeader() {
  return `
    <div style="background: #F0FAF5; padding: 35px 20px; text-align: center;">
      <a href="https://${domain}" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="${EMAIL_LOGO}" alt="Exentax" width="70" height="70" style="display: block; margin: 0 auto; border-radius: 50%; border: 0;" />
      </a>
    </div>
  `;
}

function getSimpleFooter() {
  return `
    <div style="background-color: #0A1F17; padding: 35px 25px; text-align: center; color: #F7F7F5;">
      <div style="width: 40px; height: 3px; background: #00C48C; margin: 0 auto 20px; border-radius: 2px;"></div>
      <p style="margin: 0 0 15px 0; font-size: 12px; color: #6B7280; line-height: 1.7;">1209 Mountain Road Place Northeast, STE R<br>Albuquerque, NM 87110</p>
      <p style="margin: 0; font-size: 11px; color: #6B7280;">© ${new Date().getFullYear()} Exentax Holdings LLC</p>
    </div>
  `;
}

function getEmailWrapper(content: string, lang: EmailLanguage = 'es') {
  const doubtsText = getCommonDoubtsText(lang);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F5FBF8;">
      <div style="background-color: #F5FBF8; padding: 40px 15px;">
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: auto; border-radius: 24px; overflow: hidden; color: #161F2E; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          ${getSimpleHeader()}
          <div style="padding: 40px 35px;">
            ${content}
            <p style="line-height: 1.6; font-size: 14px; color: #64748B; margin-top: 35px; padding-top: 25px; border-top: 1px solid #E6E9EC;">${doubtsText}</p>
          </div>
          ${getSimpleFooter()}
        </div>
      </div>
    </body>
    </html>
  `;
}

// 1. OTP - Código de verificación
export function getOtpEmailTemplate(otp: string, name?: string, lang: EmailLanguage = 'es', ip?: string) {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const ipSection = ip ? `
    <p style="line-height: 1.7; font-size: 14px; color: #6B7280; margin-bottom: 20px;">${t.otp.ipDetected} <strong style="color: #0A0A0A;">${ip}</strong></p>
  ` : '';
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 20px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 10px;">${t.otp.thanks}</p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 30px;">${t.otp.forSecurity}</p>
    ${ipSection}
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F0EC 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #00C48C;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #00C48C; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${t.otp.yourCode}</p>
      <p style="margin: 0; font-size: 32px; font-weight: 700; color: #00C48C; letter-spacing: 8px; font-family: 'Space Grotesk', 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>

    <p style="line-height: 1.7; font-size: 13px; color: #6B7280; margin: 20px 0 6px 0;">${t.otp.important}</p>
    <p style="line-height: 1.7; font-size: 13px; color: #6B7280; margin: 0 0 4px 0;">— ${t.otp.personalAndConfidential}</p>
    <p style="line-height: 1.7; font-size: 13px; color: #6B7280; margin: 0 0 4px 0;">— ${t.otp.validFor}</p>
    <p style="line-height: 1.7; font-size: 13px; color: #6B7280; margin: 0 0 4px 0;">— ${t.otp.doNotShare}</p>

    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">${t.otp.ignoreMessage}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 2. Bienvenida - Cuenta creada
export function getWelcomeEmailTemplate(name?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.welcome.welcomeMessage}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.welcome.accountCreated}</p>
    
    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
      <li>${t.welcome.realTimeTracking}</li>
      <li>${t.welcome.documentCenter}</li>
      <li>${t.welcome.professionalTools}</li>
      <li>${t.welcome.fiscalCalendar}</li>
      <li>${t.welcome.directSupport}</li>
    </ul>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.welcome.hereToHelp}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.welcome.exploreButton}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 2b. Cuenta creada - Pendiente verificación email
export function getAccountPendingVerificationTemplate(name?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountPendingVerification.accountCreatedBut}</p>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #92400E; text-transform: uppercase;">${t.accountPendingVerification.actionRequired}</p>
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">${t.accountPendingVerification.accessAndVerify}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.accountPendingVerification.verifyButton}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.accountPendingVerification.whileUnverified}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 3. Cuenta en revisión
export function getAccountUnderReviewTemplate(name?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountUnderReview.underReview}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #0A0A0A;">${t.accountUnderReview.whyReview}</p>
      <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.7;">${t.accountUnderReview.whyReviewText}</p>
    </div>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">${t.accountUnderReview.duringProcess}</p>
    </div>
    
    <div style="background: #F5FBF8; padding: 25px; border-radius: 16px; margin: 25px 0; border: 1px solid #00C48C;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #0A0A0A;">${t.accountUnderReview.whatHappens}</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.9;">
        <li style="margin-bottom: 8px;">${t.accountUnderReview.step1}</li>
        <li style="margin-bottom: 8px;">${t.accountUnderReview.step2}</li>
        <li>${t.accountUnderReview.step3}</li>
      </ul>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountUnderReview.teamReviewing}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountUnderReview.patience}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #0A0A0A; font-weight: 600; margin-bottom: 0;">${t.accountUnderReview.closing}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 3b. Cuenta actualizada a VIP
export function getAccountVipTemplate(name?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountVip.updatedToVip}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #00C48C;">
      <p style="margin: 0 0 15px 0; font-size: 15px; color: #0A0A0A; font-weight: 600;">${t.accountVip.benefits}</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.8;">
        <li>${t.accountVip.priorityAttention}</li>
        <li>${t.accountVip.preferentialTracking}</li>
        <li>${t.accountVip.fullAccess}</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.accountVip.viewDashboard}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 3c. Cuenta reactivada
export function getAccountReactivatedTemplate(name?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountReactivated.reactivated}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountReactivated.canAccess}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.accountReactivated.viewDashboard}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 4. Confirmación de Solicitud (LLC / Mantenimiento)
export function getConfirmationEmailTemplate(name: string, requestCode: string, details?: { companyName?: string; state?: string; serviceType?: string }, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.confirmation.greatNews}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #00C48C;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #00C48C; text-transform: uppercase; letter-spacing: 1px;">${t.confirmation.details}</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.reference}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${requestCode}</td>
        </tr>
        ${details?.serviceType ? `
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.service}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${details.serviceType}</td>
        </tr>` : ''}
        ${details?.companyName ? `
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.company}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${details.companyName}</td>
        </tr>` : ''}
        ${details?.state ? `
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.state}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${details.state}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.confirmation.currentStatus}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #00C48C;">${t.confirmation.inReview}</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;"><strong>${t.confirmation.whatNow}</strong></p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.confirmation.validatingInfo}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.confirmation.trackButton}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.confirmation.questionRef}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 5. Auto-respuesta de contacto
export function getAutoReplyTemplate(name: string, ticketId: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.autoReply.receivedMessage}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #00C48C; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280; text-transform: uppercase;">${t.autoReply.ticketNumber}</p>
      <p style="margin: 0; font-size: 24px; font-weight: 900; color: #0A0A0A; letter-spacing: 2px;">#${ticketId}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-bottom: 15px;">${t.autoReply.estimatedResponse}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.autoReply.responding}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.autoReply.seeMessages}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 8a. Actualización de estado de pedido
export function getOrderUpdateTemplate(name: string, orderId: string, status: string, description?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const statusLabels: Record<string, string> = {
    pending: t.orderUpdate.statusPending,
    processing: t.orderUpdate.statusProcessing,
    paid: t.orderUpdate.statusPaid,
    filed: t.orderUpdate.statusFiled,
    documents_ready: t.orderUpdate.statusDocumentsReady,
    completed: t.orderUpdate.statusCompleted,
    cancelled: t.orderUpdate.statusCancelled,
  };
  const translatedStatus = statusLabels[status] || status;

  const statusColors: Record<string, string> = {
    pending: "#F59E0B",
    processing: "#3B82F6",
    paid: "#00C48C",
    filed: "#8B5CF6",
    documents_ready: "#00C48C",
    completed: "#00C48C",
    cancelled: "#EF4444",
  };
  const statusColor = statusColors[status] || "#00C48C";

  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderUpdate.statusChanged}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${statusColor};">
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #6B7280; text-transform: uppercase;">${t.orderUpdate.orderLabel} <strong>#${orderId}</strong></p>
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${statusColor};">${t.orderUpdate.newStatus} ${translatedStatus}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-bottom: 25px;">${t.orderUpdate.clarification}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.orderUpdate.trackButton}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 8b. Pedido completado (documentos listos)
export function getOrderCompletedTemplate(name: string, orderCode: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px; border-radius: 16px; margin: 0 0 25px 0; text-align: center; border: 2px solid #00C48C;">
      <p style="margin: 0; font-size: 20px; font-weight: 800; color: #00C48C;">${t.orderCompleted.llcReady}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderCompleted.congratulations}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;"><strong>${t.orderCompleted.docsReady}</strong></p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderCompleted.accessDocuments}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #0A0A0A; text-transform: uppercase;">${t.orderCompleted.whatYouFind}</p>
      <ul style="margin: 0; padding-left: 18px; color: #444; font-size: 14px; line-height: 1.8;">
        <li>${t.orderCompleted.articlesOrg}</li>
        <li>${t.orderCompleted.einLetter}</li>
        <li>${t.orderCompleted.registeredAgent}</li>
        <li>${t.orderCompleted.additionalGuides}</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.orderCompleted.viewDocuments}</a>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderCompleted.hereForYou}</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.orderCompleted.feedbackRequest}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 8c1. Nota de equipo recibida
export function getNoteReceivedTemplate(name: string, note: string, orderId: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.noteReceived.teamNote} ${t.noteReceived.relatedToOrder} <strong>#${orderId}</strong>:</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7;">${note}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-bottom: 25px;">${t.noteReceived.respondNote}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.noteReceived.viewClientArea}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 8c2. Nota administrativa
export function getAdminNoteTemplate(name: string, message: string, ticketId: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.adminNote.messageAbout}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">${t.adminNote.viewTicket} #${ticketId}</p>
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.adminNote.viewClientArea}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 8c3. Solicitud de pago
export function getPaymentRequestTemplate(name: string, amount: string, paymentLink: string, message: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.paymentRequest.paymentRequired} ${t.paymentRequest.amount} <strong>$${amount}</strong>.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">${t.paymentRequest.messageLabel}</p>
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${paymentLink}" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.paymentRequest.payNow}</a>
    </div>
    
    <p style="line-height: 1.5; font-size: 12px; color: #9CA3AF; word-break: break-all;">${t.paymentRequest.buttonFallback} ${paymentLink}</p>
    
    <p style="line-height: 1.6; font-size: 13px; color: #6B7280; margin-top: 20px;">${t.paymentRequest.securePayment}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 8d. Solicitud de Documentación
export function getDocumentRequestTemplate(name: string, documentType: string, message: string, ticketId: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.documentRequest.needDocument}</p>
    
    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #F59E0B; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #92400E;">${documentType}</p>
    </div>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">${t.documentRequest.messageLabel}</p>
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7;">${message}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 13px; color: #6B7280; margin-bottom: 25px;">${t.documentRequest.referenceTicket} <strong>#${ticketId}</strong></p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.documentRequest.uploadButton}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 8e. Documento Subido por Admin
export function getDocumentUploadedTemplate(name: string, documentType: string, orderCode: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.documentUploaded.documentReceived}</p>
    
    <div style="background: linear-gradient(135deg, #E8F5EF 0%, #E8F5EF 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #00C48C; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1E4D78;">${documentType}</p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #00C48C;">${t.documentUploaded.forOrder} ${orderCode}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.documentUploaded.accessDownload}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.documentUploaded.viewDocuments}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 8f. Respuesta a consulta (admin a cliente)
export function getMessageReplyTemplate(name: string, content: string, ticketId: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const emailContent = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.messageReply.repliedToQuery} (${t.messageReply.ticket} <strong>#${ticketId}</strong>):</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0; font-size: 15px; color: #0A0A0A; line-height: 1.7; white-space: pre-wrap;">${content}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.messageReply.viewClientArea}</a>
    </div>
  `;
  return getEmailWrapper(emailContent, lang);
}

// 8f. Código para cambio de contraseña
export function getPasswordChangeOtpTemplate(name: string, otp: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.passwordChangeOtp.passwordChangeRequest}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #00C48C;">
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0A0A0A; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.passwordChangeOtp.validFor}</p>
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.passwordChangeOtp.notRequested}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 8f-b. Código para cambio de datos sensibles del perfil
export function getProfileChangeOtpTemplate(name: string, otp: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 20px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 30px;">${t.profileChangeOtp.sensitiveChangeRequest}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #00C48C;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #00C48C; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${t.profileChangeOtp.yourCode}</p>
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0A0A0A; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>

    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0A0A0A; text-transform: uppercase;">${t.profileChangeOtp.important}</p>
      <ul style="margin: 0; padding-left: 18px; color: #444; font-size: 14px; line-height: 1.8;">
        <li style="margin-bottom: 6px;">${t.profileChangeOtp.personalAndConfidential}</li>
        <li style="margin-bottom: 6px;">${t.profileChangeOtp.validFor}</li>
        <li>${t.profileChangeOtp.doNotShare}</li>
      </ul>
    </div>

    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">${t.profileChangeOtp.ignoreMessage}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 8g. Evento de timeline de pedido
export function getOrderEventTemplate(name: string, orderId: string, eventType: string, description: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const locale = lang === 'en' ? 'en-US' : lang === 'ca' ? 'ca-ES' : 'es-ES';
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.orderEvent.update} <strong>#${orderId}</strong></p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #0A0A0A;">${eventType}</p>
      <p style="margin: 0; font-size: 14px; color: #6B7280; line-height: 1.6;">${description}</p>
    </div>
    
    <p style="line-height: 1.5; font-size: 13px; color: #9CA3AF;">${t.orderEvent.date} ${new Date().toLocaleString(locale)}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.orderEvent.viewDetails}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 9. Cuenta Desactivada
export function getAccountDeactivatedTemplate(name?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountDeactivated.deactivated}</p>
    
    <div style="background: #FEE2E2; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #EF4444;">
      <p style="margin: 0; font-size: 14px; color: #B91C1C; line-height: 1.7;">${t.accountDeactivated.cannotAccess}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.accountDeactivated.contactSupport}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 9b. Cuenta Desactivada por el propio usuario
export function getAccountDeactivatedByUserTemplate(name?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.accountDeactivatedByUser.deactivated}</p>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">${t.accountDeactivatedByUser.cannotAccess}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.accountDeactivatedByUser.contactSupport}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 10. Newsletter Bienvenida
export function getNewsletterWelcomeTemplate(lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.newsletter.confirmed}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.newsletter.willReceive}</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.newsletter.unsubscribe}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 11. Recordatorio de Renovación (plantilla única para 60/30/7 días)
export function getRenewalReminderTemplate(
  name: string, 
  companyName: string, 
  daysRemaining: string, 
  renewalDate: string,
  state: string,
  lang: EmailLanguage = 'es'
) {
  const t = getEmailTranslations(lang);
  const isUrgent = daysRemaining === "una semana" || daysRemaining === "one week" || daysRemaining === "una setmana";
  const urgencyColor = isUrgent ? "#EF4444" : "#F59E0B";
  const urgencyBg = isUrgent ? "#FEE2E2" : "#FEF3C7";
  
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.renewalReminder.reminderText} <strong>${companyName}</strong> (${state}) ${t.renewalReminder.expiresSoon}</p>
    
    <div style="background: ${urgencyBg}; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: ${urgencyColor}; text-transform: uppercase;">${t.renewalReminder.expiresIn} ${daysRemaining}</p>
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0A0A0A;">${t.renewalReminder.dueDate} ${renewalDate}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.renewalReminder.withoutMaintenance}</p>
    
    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
      <li>${t.renewalReminder.registeredAgentActive}</li>
      <li>${t.renewalReminder.annualReports}</li>
      <li>${t.renewalReminder.taxCompliance}</li>
      <li>${t.renewalReminder.legalAddress}</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/llc/maintenance" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.renewalReminder.renewNow}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 17. Registro con código de verificación
export function getRegistrationOtpTemplate(name: string, otp: string, clientId: string, expiryMinutes: number = 15, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.registrationOtp.almostDone}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F0EC 100%); padding: 25px; text-align: center; border-radius: 12px; margin: 25px 0; border: 2px solid #00C48C;">
      <span style="color: #00C48C; font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Space Grotesk', monospace;">${otp}</span>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.registrationOtp.validFor} ${expiryMinutes} ${lang === 'en' ? 'minutes' : lang === 'ca' ? 'minuts' : 'minutos'}.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.registrationOtp.clientIdLabel} <strong>${clientId}</strong></p>
  `;
  return getEmailWrapper(content, lang);
}

// 18. Notificación admin de nuevo registro
export function getAdminNewRegistrationTemplate(clientId: string, firstName: string, lastName: string, email: string, phone?: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;"><strong>Nueva cuenta creada en el sistema.</strong></p>
    
    <div style="background-color: #F7F7F5; padding: 20px; border-radius: 16px; border-left: 4px solid #00C48C; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Cliente ID:</strong> ${clientId}</p>
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Nombre:</strong> ${firstName} ${lastName}</p>
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
      ${phone ? `<p style="margin: 0; font-size: 14px;"><strong>Teléfono:</strong> ${phone}</p>` : ''}
    </div>
  `;
  return getEmailWrapper(content);
}

// 19. Cuenta bloqueada por seguridad
export function getAccountLockedTemplate(name: string, ticketId: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const baseUrl = process.env.BASE_URL || `https://${domain}`;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountLocked.locked}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountLocked.verifyIdentity}</p>
    
    <div style="background-color: #FFF3E0; padding: 20px; border-radius: 16px; border-left: 4px solid #FF9800; margin: 25px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #444;">
        <li style="margin-bottom: 8px;">${t.accountLocked.idRequirement}</li>
        <li>${t.accountLocked.birthDateConfirm}</li>
      </ul>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.accountLocked.referenceTicket} <strong>#${ticketId}</strong></p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${baseUrl}/forgot-password" style="background-color: #00C48C; color: #ffffff; font-weight: 700; font-size: 15px; padding: 16px 40px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(0, 196, 140, 0.3);">${t.accountLocked.resetPassword}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 20. Notificación admin de pedido LLC completado
export function getAdminLLCOrderTemplate(orderData: {
  orderIdentifier: string;
  amount: string;
  paymentMethod: string;
  ownerFullName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerBirthDate?: string;
  ownerIdType?: string;
  ownerIdNumber?: string;
  ownerAddress?: string;
  ownerCity?: string;
  ownerProvince?: string;
  ownerPostalCode?: string;
  ownerCountry?: string;
  companyName?: string;
  companyNameOption2?: string;
  designator?: string;
  state?: string;
  businessCategory?: string;
  businessActivity?: string;
  companyDescription?: string;
  isSellingOnline?: string;
  needsBankAccount?: string;
  willUseStripe?: string;
  wantsBoiReport?: string;
  wantsMaintenancePack?: string;
  notes?: string;
}) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;"><strong>Nuevo pedido LLC completado.</strong></p>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #00C48C; padding-bottom: 5px;">Información del Propietario</h3>
    <div style="background: #F5FBF8; border-left: 4px solid #00C48C; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Nombre:</strong> ${orderData.ownerFullName || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Email:</strong> ${orderData.ownerEmail || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Teléfono:</strong> ${orderData.ownerPhone || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Fecha nacimiento:</strong> ${orderData.ownerBirthDate || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Documento:</strong> ${orderData.ownerIdType || 'N/A'} - ${orderData.ownerIdNumber || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Dirección:</strong> ${orderData.ownerAddress || 'N/A'}, ${orderData.ownerCity || ''}, ${orderData.ownerProvince || ''} ${orderData.ownerPostalCode || ''}, ${orderData.ownerCountry || ''}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #00C48C; padding-bottom: 5px;">Información de la Empresa</h3>
    <div style="background: #F5FBF8; border-left: 4px solid #00C48C; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Empresa:</strong> ${orderData.companyName || 'N/A'} ${orderData.designator || ''}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Alternativo:</strong> ${orderData.companyNameOption2 || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Estado:</strong> ${orderData.state || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Categoría:</strong> ${orderData.businessCategory || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Actividad:</strong> ${orderData.businessActivity || 'N/A'}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #00C48C; padding-bottom: 5px;">Servicios</h3>
    <div style="background: #F5FBF8; border-left: 4px solid #00C48C; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Venderá online:</strong> ${orderData.isSellingOnline || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Cuenta bancaria:</strong> ${orderData.needsBankAccount || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Pasarela:</strong> ${orderData.willUseStripe || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>BOI Report:</strong> ${orderData.wantsBoiReport || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Mantenimiento:</strong> ${orderData.wantsMaintenancePack || 'N/A'}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Pago</h3>
    <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Referencia:</strong> ${orderData.orderIdentifier}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Importe:</strong> ${orderData.amount}€</p>
      <p style="margin: 0; font-size: 13px;"><strong>Método:</strong> ${orderData.paymentMethod}</p>
    </div>
    
    ${orderData.notes ? `
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #FF9800; padding-bottom: 5px;">Notas del Cliente</h3>
    <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 13px;">${orderData.notes}</p>
    </div>
    ` : ''}
  `;
  return getEmailWrapper(content);
}

// 21. Notificación admin de pedido mantenimiento completado
export function getAdminMaintenanceOrderTemplate(orderData: {
  orderIdentifier: string;
  amount: string;
  paymentMethod: string;
  ownerFullName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  companyName?: string;
  ein?: string;
  state?: string;
  creationSource?: string;
  creationYear?: string;
  bankAccount?: string;
  paymentGateway?: string;
  businessActivity?: string;
  expectedServices?: string;
  wantsDissolve?: string;
  notes?: string;
}) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;"><strong>Nuevo pedido de mantenimiento completado.</strong></p>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #00C48C; padding-bottom: 5px;">Información del Propietario</h3>
    <div style="background: #F5FBF8; border-left: 4px solid #00C48C; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Nombre:</strong> ${orderData.ownerFullName || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Email:</strong> ${orderData.ownerEmail || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Teléfono:</strong> ${orderData.ownerPhone || 'N/A'}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #00C48C; padding-bottom: 5px;">Información de la Empresa</h3>
    <div style="background: #F5FBF8; border-left: 4px solid #00C48C; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Empresa:</strong> ${orderData.companyName || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>EIN:</strong> ${orderData.ein || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Estado:</strong> ${orderData.state || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Creado con:</strong> ${orderData.creationSource || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Año creación:</strong> ${orderData.creationYear || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Cuenta bancaria:</strong> ${orderData.bankAccount || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Pasarela:</strong> ${orderData.paymentGateway || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Actividad:</strong> ${orderData.businessActivity || 'N/A'}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #00C48C; padding-bottom: 5px;">Servicios Solicitados</h3>
    <div style="background: #F5FBF8; border-left: 4px solid #00C48C; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Servicios:</strong> ${orderData.expectedServices || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Disolver empresa:</strong> ${orderData.wantsDissolve || 'No'}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">Pago</h3>
    <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Referencia:</strong> ${orderData.orderIdentifier}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Importe:</strong> ${orderData.amount}€</p>
      <p style="margin: 0; font-size: 13px;"><strong>Método:</strong> ${orderData.paymentMethod}</p>
    </div>
    
    ${orderData.notes ? `
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #FF9800; padding-bottom: 5px;">Notas del Cliente</h3>
    <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 13px;">${orderData.notes}</p>
    </div>
    ` : ''}
  `;
  return getEmailWrapper(content);
}

// Password reset by admin notification
export function getAdminPasswordResetTemplate(name?: string, lang: EmailLanguage = 'es') {
  const t = {
    es: { greeting: `Hola ${name || 'Cliente'},`, body: 'Tu contraseña ha sido restablecida por nuestro equipo de soporte.', cta: 'Ahora puedes iniciar sesión con tu nueva contraseña', btn: 'Iniciar Sesión', important: 'Importante:', warning: 'Si no solicitaste este cambio, por favor contacta con nuestro equipo de soporte inmediatamente.' },
    en: { greeting: `Hello ${name || 'Client'},`, body: 'Your password has been reset by our support team.', cta: 'You can now log in with your new password', btn: 'Log In', important: 'Important:', warning: 'If you did not request this change, please contact our support team immediately.' },
    ca: { greeting: `Hola ${name || 'Client'},`, body: 'La teva contrasenya ha estat restablerta pel nostre equip de suport.', cta: 'Ara pots iniciar sessió amb la teva nova contrasenya', btn: 'Iniciar Sessió', important: 'Important:', warning: 'Si no has sol·licitat aquest canvi, contacta amb el nostre equip de suport immediatament.' },
    fr: { greeting: `Bonjour ${name || 'Client'},`, body: 'Votre mot de passe a été réinitialisé par notre équipe de support.', cta: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe', btn: 'Se connecter', important: 'Important :', warning: 'Si vous n\'avez pas demandé ce changement, veuillez contacter notre équipe de support immédiatement.' },
    de: { greeting: `Hallo ${name || 'Kunde'},`, body: 'Ihr Passwort wurde von unserem Support-Team zurückgesetzt.', cta: 'Sie können sich jetzt mit Ihrem neuen Passwort anmelden', btn: 'Anmelden', important: 'Wichtig:', warning: 'Wenn Sie diese Änderung nicht angefordert haben, kontaktieren Sie bitte sofort unser Support-Team.' },
    it: { greeting: `Ciao ${name || 'Cliente'},`, body: 'La tua password è stata reimpostata dal nostro team di supporto.', cta: 'Ora puoi accedere con la tua nuova password', btn: 'Accedi', important: 'Importante:', warning: 'Se non hai richiesto questa modifica, contatta immediatamente il nostro team di supporto.' },
    pt: { greeting: `Olá ${name || 'Cliente'},`, body: 'A sua palavra-passe foi redefinida pela nossa equipa de suporte.', cta: 'Agora pode iniciar sessão com a sua nova palavra-passe', btn: 'Iniciar Sessão', important: 'Importante:', warning: 'Se não solicitou esta alteração, contacte a nossa equipa de suporte imediatamente.' },
  }[lang] || { greeting: `Hola ${name || 'Cliente'},`, body: 'Tu contraseña ha sido restablecida por nuestro equipo de soporte.', cta: 'Ahora puedes iniciar sesión con tu nueva contraseña', btn: 'Iniciar Sesión', important: 'Importante:', warning: 'Si no solicitaste este cambio, por favor contacta con nuestro equipo de soporte inmediatamente.' };
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.greeting}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.body}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #00C48C;">
      <p style="margin: 0; font-size: 14px; color: #00C48C; font-weight: 700;">${t.cta}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/auth/login" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.btn}</a>
    </div>

    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #92400E; text-transform: uppercase;">${t.important}</p>
      <p style="margin: 0; font-size: 14px; color: #78350F; line-height: 1.6;">${t.warning}</p>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 22. Calculadora de Precios - Resultado enviado al cliente
export function getCalculatorResultsTemplate(
  name: string,
  freelancerTax: string,
  llcTax: string,
  savings: string,
  annualIncome: string,
  expenses: string,
  lang: EmailLanguage = 'es'
) {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.calculatorResults.introText}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #00C48C;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #00C48C; text-transform: uppercase; letter-spacing: 1px;">${t.calculatorResults.summary}</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E8F5EF;">${t.calculatorResults.income}</td>
          <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0A0A0A; border-bottom: 1px solid #E8F5EF;">${annualIncome}€</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E8F5EF;">${t.calculatorResults.expenses}</td>
          <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0A0A0A; border-bottom: 1px solid #E8F5EF;">${expenses}€</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E8F5EF;">${t.calculatorResults.autonomoTax}</td>
          <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #EF4444; border-bottom: 1px solid #E8F5EF;">${freelancerTax}€</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E8F5EF;">${t.calculatorResults.llcTax}</td>
          <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #00C48C; border-bottom: 1px solid #E8F5EF;">${llcTax}€</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #00C48C; font-weight: 700; font-size: 15px;">${t.calculatorResults.potentialSavings}</td>
          <td style="padding: 12px 0; font-weight: 900; text-align: right; color: #00C48C; font-size: 18px;">${savings}€/${lang === 'en' ? 'year' : 'año'}</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.calculatorResults.withLLC}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.calculatorResults.learnMore}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/servicios" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.calculatorResults.viewServices}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">${t.calculatorResults.disclaimer}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 23. Operating Agreement listo - Para clientes con EIN asignado
export function getOperatingAgreementReadyTemplate(
  name: string,
  companyName: string,
  ein: string,
  state: string,
  lang: EmailLanguage = 'es'
) {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.operatingAgreementReady.generated} ${t.operatingAgreementReady.ready}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #00C48C;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #00C48C; text-transform: uppercase; letter-spacing: 1px;">${t.operatingAgreementReady.llcData}</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.operatingAgreementReady.companyLabel}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.operatingAgreementReady.stateLabel}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0A0A0A;">${state}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">${t.operatingAgreementReady.einLabel}</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #00C48C;">${ein}</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;"><strong>${t.operatingAgreementReady.whatIs}</strong></p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.operatingAgreementReady.fullExplanation}</p>
    
    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
      <li>${t.operatingAgreementReady.reason1}</li>
      <li>${t.operatingAgreementReady.reason2}</li>
      <li>${t.operatingAgreementReady.reason3}</li>
      <li>${t.operatingAgreementReady.reason4}</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/tools/operating-agreement" style="display: inline-block; background: #8B5CF6; color: #FFFFFF; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(139,92,246,0.35);">${t.operatingAgreementReady.generateButton}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">${t.operatingAgreementReady.autoGenerated}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 22. Document Approved Template
export function getDocumentApprovedTemplate(name: string, documentLabel: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #00C48C;">
      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #00C48C;">${t.documentApproved.title}</p>
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0A0A0A;">"${documentLabel}"</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.documentApproved.reviewedAndApproved}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.documentApproved.viewDocuments}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 23. Document Rejected Template
export function getDocumentRejectedTemplate(name: string, documentLabel: string, reason: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); padding: 25px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #F87171;">
      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #DC2626;">${t.documentRejected.title}</p>
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0A0A0A;">"${documentLabel}"</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 15px;">${t.documentRejected.reviewedAndRejected}</p>
    
    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 16px; margin: 20px 0; border-left: 4px solid #F87171;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #DC2626; text-transform: uppercase;">${t.documentRejected.reason}</p>
      <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${reason}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.documentRejected.pleaseReupload}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #F87171; color: #FFFFFF; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(248,113,113,0.35);">${t.documentRejected.viewDocuments}</a>
    </div>
  `;
  return getEmailWrapper(content, lang);
}

// 23b. Admin Profile Changes Verified Alert
export function getAdminProfileChangesTemplate(clientName: string, clientEmail: string, clientId: string, changedFields: Array<{field: string, oldValue: string, newValue: string}>) {
  const changesHtml = changedFields.map(f => 
    `<tr>
      <td style="padding: 10px 15px; border-bottom: 1px solid #E5E7EB; font-weight: 600; color: #0A0A0A;">${f.field}</td>
      <td style="padding: 10px 15px; border-bottom: 1px solid #E5E7EB; color: #6B7280; text-decoration: line-through;">${f.oldValue}</td>
      <td style="padding: 10px 15px; border-bottom: 1px solid #E5E7EB; color: #00C48C; font-weight: 600;">${f.newValue}</td>
    </tr>`
  ).join('');
  
  const content = `
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px; border-radius: 16px; margin: 0 0 25px 0; text-align: center; border: 2px solid #00C48C;">
      <p style="margin: 0; font-size: 18px; font-weight: 800; color: #00C48C;">Cambios de Perfil Verificados con OTP</p>
    </div>
    
    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 16px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #444;"><strong>Cliente:</strong> ${clientName}</p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #444;"><strong>Email:</strong> ${clientEmail}</p>
      <p style="margin: 0; font-size: 14px; color: #444;"><strong>ID de Cliente:</strong> ${clientId}</p>
    </div>
    
    <p style="margin: 20px 0 10px 0; font-size: 14px; font-weight: 800; color: #0A0A0A; text-transform: uppercase;">Campos modificados:</p>
    <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
      <thead>
        <tr style="background: #F3F4F6;">
          <th style="padding: 10px 15px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase;">Campo</th>
          <th style="padding: 10px 15px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase;">Anterior</th>
          <th style="padding: 10px 15px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase;">Nuevo</th>
        </tr>
      </thead>
      <tbody>
        ${changesHtml}
      </tbody>
    </table>
    
    <p style="line-height: 1.6; font-size: 13px; color: #9CA3AF; margin-top: 20px;">Cambio verificado con OTP - ${new Date().toLocaleString('es-ES')}</p>
  `;
  return getEmailWrapper(content, 'es');
}

// 23c. Admin OTP Request Template
export function getAdminOtpRequestTemplate(name: string, otp: string, reason?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 20px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${reason || t.profileChangeOtp.sensitiveChangeRequest}</p>
    
    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #F59E0B;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400E; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${t.profileChangeOtp.yourCode}</p>
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0A0A0A; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; text-align: center;">${t.profileChangeOtp.validFor}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 23b. Identity Verification Request
export function getIdentityVerificationRequestTemplate(name: string, notes?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.identityVerificationRequest.intro}</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #0A0A0A;">${t.identityVerificationRequest.whyTitle}</p>
      <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.7;">${t.identityVerificationRequest.whyText}</p>
    </div>
    
    <div style="background: #F5FBF8; padding: 25px; border-radius: 16px; margin: 25px 0; border: 1px solid #00C48C;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #0A0A0A;">${t.identityVerificationRequest.whatNeedTitle}</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #444; line-height: 1.7;">${t.identityVerificationRequest.whatNeedText}</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.9;">
        <li style="margin-bottom: 8px;">${t.identityVerificationRequest.doc1}</li>
        <li style="margin-bottom: 8px;">${t.identityVerificationRequest.doc2}</li>
        <li>${t.identityVerificationRequest.doc3}</li>
      </ul>
    </div>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #0A0A0A;">${t.identityVerificationRequest.howToUploadTitle}</p>
      <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.9;">
        <li style="margin-bottom: 8px;">${t.identityVerificationRequest.howStep1}</li>
        <li style="margin-bottom: 8px;">${t.identityVerificationRequest.howStep2}</li>
        <li>${t.identityVerificationRequest.howStep3}</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.identityVerificationRequest.uploadButton}</a>
    </div>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">${t.identityVerificationRequest.duringProcess}</p>
    </div>
    
    ${notes ? `
    <div style="background: #F5FBF8; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #3B82F6;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #1E40AF; text-transform: uppercase;">${t.identityVerificationRequest.adminNotes}</p>
      <p style="margin: 0; font-size: 14px; color: #1E3A5F; line-height: 1.7;">${notes}</p>
    </div>
    ` : ''}
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.identityVerificationRequest.teamMessage}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #0A0A0A; font-weight: 600; margin-bottom: 0;">${t.identityVerificationRequest.closing}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 23c. Identity Verification Approved
export function getIdentityVerificationApprovedTemplate(name: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.identityVerificationApproved.intro}</p>
    
    <div style="background: #F5FBF8; padding: 25px; border-radius: 16px; margin: 25px 0; border: 1px solid #00C48C;">
      <p style="margin: 0; font-size: 14px; color: #00C48C; line-height: 1.7;">${t.identityVerificationApproved.verified}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.identityVerificationApproved.accessRestored}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.identityVerificationApproved.viewDashboard}</a>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #0A0A0A; font-weight: 600; margin-bottom: 0;">${t.identityVerificationApproved.closing}</p>
  `;
  return getEmailWrapper(content, lang);
}

// 23d. Identity Verification Rejected
export function getIdentityVerificationRejectedTemplate(name: string, reason?: string, lang: EmailLanguage = 'es') {
  const t = getEmailTranslations(lang);
  const clientName = name || t.common.client;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${clientName},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.identityVerificationRejected.intro}</p>
    
    <div style="background: #FEE2E2; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #EF4444;">
      <p style="margin: 0; font-size: 14px; color: #B91C1C; line-height: 1.7;">${t.identityVerificationRejected.notApproved}</p>
    </div>
    
    ${reason ? `
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #92400E; text-transform: uppercase;">${t.identityVerificationRejected.reason}</p>
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">${reason}</p>
    </div>
    ` : ''}
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #00C48C;">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #0A0A0A;">${t.identityVerificationRejected.whatToDo}</p>
      <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.7;">${t.identityVerificationRejected.reuploadStep}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.identityVerificationRejected.uploadButton}</a>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${t.identityVerificationRejected.needHelp}</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #0A0A0A; font-weight: 600; margin-bottom: 0;">${t.identityVerificationRejected.closing}</p>
  `;
  return getEmailWrapper(content, lang);
}

// Newsletter broadcast template (uses standard wrapper)
export function getNewsletterBroadcastTemplate(subject: string, message: string, lang: EmailLanguage = 'es') {
  const content = `
    <h2 style="font-size: 22px; font-weight: 800; color: #0A0A0A; margin: 0 0 25px 0; line-height: 1.4;">${subject}</h2>
    <div style="font-size: 15px; line-height: 1.7; color: #444;">${message.replace(/\n/g, '<br>')}</div>
  `;
  return getEmailWrapper(content, lang);
}

// Transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.es",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// ============== EMAIL QUEUE SYSTEM ==============
interface EmailJob {
  id: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  retries: number;
  maxRetries: number;
  createdAt: number;
}

const emailQueue: EmailJob[] = [];
const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 100; // Prevent memory growth
const EMAIL_TTL = 3600000; // 1 hour TTL for emails
const QUEUE_PROCESS_INTERVAL = 2000; // Process every 2 seconds (with backoff)
let isProcessingQueue = false;
let lastProcessTime = 0;

function generateEmailId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Clean up old emails from queue
function cleanupStaleEmails() {
  const now = Date.now();
  let removed = 0;
  while (emailQueue.length > 0 && emailQueue[0] && (now - emailQueue[0].createdAt) > EMAIL_TTL) {
    emailQueue.shift();
    removed++;
  }
  if (removed > 0) {
    log.info(`Cleaned up ${removed} stale emails from queue`);
  }
}

async function processEmailQueue() {
  // Skip if SMTP not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // Clear queue when SMTP not configured
    if (emailQueue.length > 0) {
      emailQueue.length = 0;
    }
    return;
  }
  
  if (isProcessingQueue || emailQueue.length === 0) return;
  
  // Backoff: wait at least 1 second between processing attempts
  const now = Date.now();
  if (now - lastProcessTime < 1000) return;
  
  isProcessingQueue = true;
  lastProcessTime = now;
  
  try {
    // Cleanup stale emails first
    cleanupStaleEmails();
    
    const job = emailQueue[0];
    if (!job) {
      isProcessingQueue = false;
      return;
    }
    
    try {
      await transporter.sendMail({
        from: `"Exentax" <no-reply@exentax.com>`,
        replyTo: job.replyTo || "hola@exentax.com",
        to: job.to,
        subject: job.subject,
        html: job.html,
      });
      
      // Success - remove from queue
      emailQueue.shift();
    } catch (error: any) {
      job.retries++;
      
      if (job.retries >= job.maxRetries) {
        emailQueue.shift();
        log.error(`Email failed after ${job.maxRetries} retries`, error, { id: job.id, to: job.to, errorMessage: error?.message || 'Unknown error' });
      } else {
        // Move to end of queue for retry (with delay via natural queue order)
        emailQueue.shift();
        emailQueue.push(job);
      }
    }
  } finally {
    isProcessingQueue = false;
  }
}

// Start queue processor
setInterval(processEmailQueue, QUEUE_PROCESS_INTERVAL);

// Queue an email for sending (with size limit)
export function queueEmail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }): string | null {
  // Skip if SMTP not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  
  // Prevent unbounded queue growth
  if (emailQueue.length >= MAX_QUEUE_SIZE) {
    log.warn(`Email queue full (${MAX_QUEUE_SIZE}), dropping email to: ${to}`);
    return null;
  }
  
  const job: EmailJob = {
    id: generateEmailId(),
    to,
    subject,
    html,
    replyTo,
    retries: 0,
    maxRetries: MAX_RETRIES,
    createdAt: Date.now()
  };
  
  emailQueue.push(job);
  return job.id;
}

// Get queue status
export function getEmailQueueStatus() {
  return {
    pending: emailQueue.length,
    isProcessing: isProcessingQueue
  };
}

// Direct send for critical emails (bypasses queue)
export async function sendEmail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return;
  }

  try {
    const path = await import("path");
    const logoPath = path.join(process.cwd(), "client/public/logo-icon.png");

    const info = await transporter.sendMail({
      from: `"Exentax" <no-reply@exentax.com>`,
      replyTo: replyTo || "hola@exentax.com",
      to: to,
      subject: subject,
      html,
      attachments: [
        {
          filename: 'logo-icon.png',
          path: logoPath,
          cid: 'logo-icon'
        }
      ]
    });
    return info;
  } catch (error: any) {
    // On failure, queue for retry
    queueEmail({ to, subject, html, replyTo });
    return null;
  }
}

// Template for abandoned application reminder
export function getAbandonedApplicationReminderTemplate(
  name: string,
  applicationType: 'llc' | 'maintenance',
  state: string,
  hoursRemaining: number,
  lang: EmailLanguage = 'es'
) {
  const t = getEmailTranslations(lang);
  const emailDomain = process.env.REPLIT_DEV_DOMAIN || domain;
  const serviceLabel = applicationType === 'llc' ? t.abandonedApplication.llcFormation : t.abandonedApplication.maintenancePack;
  const urgencyColor = hoursRemaining <= 12 ? '#EF4444' : '#F59E0B';
  const urgencyText = hoursRemaining <= 12 ? t.abandonedApplication.lastHours : `${Math.round(hoursRemaining)} ${lang === 'en' ? 'hours' : lang === 'ca' ? 'hores' : 'horas'}`;
  
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.abandonedApplication.noticeText} ${serviceLabel} ${lang === 'en' ? 'in' : 'a'} ${state}.</p>
    
    <div style="background: ${urgencyColor}15; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0; font-size: 14px; color: ${urgencyColor}; line-height: 1.7; font-weight: 600;">
        ${t.abandonedApplication.autoDeleteWarning} (${urgencyText})
      </p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">${t.abandonedApplication.dontLoseProgress}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${emailDomain}/dashboard" style="display: inline-block; background: #00C48C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(0,196,140,0.35);">${t.abandonedApplication.continueButton}</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">${t.abandonedApplication.questionsHelp}</p>
  `;
  return getEmailWrapper(content, lang);
}

export function getConsultationConfirmationTemplate(
  name: string,
  bookingCode: string,
  dateFormatted: string,
  timeFormatted: string,
  duration: number,
  lang: EmailLanguage = 'es'
) {
  const t = getEmailTranslations(lang);
  const ct = t.consultationConfirmation;
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 10px 0;">${ct.greeting}</p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name}, ${ct.confirmed}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px 30px; border-radius: 16px; margin: 25px 0;">
      <p style="font-weight: 700; font-size: 15px; color: #1E40AF; margin: 0 0 15px 0;">${ct.details}</p>
      <table style="width: 100%; font-size: 14px; color: #444;">
        <tr><td style="padding: 6px 0; font-weight: 600; width: 140px;">${ct.dateLabel}:</td><td style="padding: 6px 0;">${dateFormatted}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">${ct.timeLabel}:</td><td style="padding: 6px 0;">${timeFormatted}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">${ct.durationLabel}:</td><td style="padding: 6px 0;">${duration} ${ct.minutes}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">${ct.timezoneLabel}:</td><td style="padding: 6px 0;">Europe/Madrid (CET)</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">${ct.bookingCodeLabel}:</td><td style="padding: 6px 0; font-weight: 700; color: #1E40AF;">${bookingCode}</td></tr>
      </table>
    </div>

    <p style="line-height: 1.7; font-size: 15px; color: #444; font-weight: 600; margin: 25px 0 10px 0;">${ct.whatToExpect}</p>
    <p style="line-height: 1.7; font-size: 14px; color: #555; margin: 0 0 20px 0;">${ct.expectText}</p>

    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 20px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400E; font-weight: 600;">${ct.weWillCallYou}</p>
      <p style="margin: 0; font-size: 13px; color: #92400E;">${ct.reminderNote}</p>
    </div>

    <p style="line-height: 1.7; font-size: 14px; color: #555; margin: 20px 0;">${ct.cancelNote}</p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 20px 0 5px 0;">${ct.lookingForward}</p>
    <p style="line-height: 1.7; font-size: 14px; color: #444; margin: 0;">${ct.closing}</p>
    <p style="font-weight: 700; font-size: 14px; color: #1E40AF; margin: 5px 0 0 0;">Exentax</p>
  `;
  return getEmailWrapper(content, lang);
}

export function getConsultationReminderTemplate(
  name: string,
  bookingCode: string,
  dateFormatted: string,
  timeFormatted: string,
  duration: number,
  reminderType: '3h' | '30m',
  lang: EmailLanguage = 'es'
) {
  const t = getEmailTranslations(lang);
  const ct = t.consultationReminder;
  const reminderText = reminderType === '3h' ? ct.reminder3h : ct.reminder30m;
  const accentColor = reminderType === '3h' ? '#2563EB' : '#DC2626';
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 10px 0;">${ct.greeting}</p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">${t.common.greeting} ${name}, ${reminderText}</p>
    
    <div style="background: linear-gradient(135deg, #F5FBF8 0%, #E8F5EF 100%); padding: 25px 30px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${accentColor};">
      <p style="font-weight: 700; font-size: 15px; color: #1E40AF; margin: 0 0 15px 0;">${ct.details}</p>
      <table style="width: 100%; font-size: 14px; color: #444;">
        <tr><td style="padding: 6px 0; font-weight: 600; width: 140px;">${ct.dateLabel}:</td><td style="padding: 6px 0;">${dateFormatted}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">${ct.timeLabel}:</td><td style="padding: 6px 0; font-weight: 700; color: ${accentColor};">${timeFormatted}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">${ct.durationLabel}:</td><td style="padding: 6px 0;">${duration} ${ct.minutes}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: 600;">${ct.bookingCodeLabel}:</td><td style="padding: 6px 0; font-weight: 700; color: #1E40AF;">${bookingCode}</td></tr>
      </table>
    </div>

    <p style="line-height: 1.7; font-size: 15px; color: #444; font-weight: 600; margin: 25px 0 10px 0;">${ct.prepareTitle}</p>
    <p style="line-height: 1.7; font-size: 14px; color: #555; margin: 0 0 20px 0;">${ct.prepareText}</p>

    <div style="background: #F0FDF4; padding: 18px 25px; border-radius: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.7;">${ct.weWillCallYou}</p>
    </div>

    <p style="line-height: 1.7; font-size: 14px; color: #555; margin: 20px 0;">${ct.cancelNote}</p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; font-weight: 600; margin: 20px 0 5px 0;">${ct.seeYouSoon}</p>
    <p style="font-weight: 700; font-size: 14px; color: #1E40AF; margin: 5px 0 0 0;">${ct.closing}</p>
  `;
  return getEmailWrapper(content, lang);
}

export async function sendTrustpilotEmail({ to, name, orderNumber, lang = 'es' }: { to: string; name: string; orderNumber: string; lang?: EmailLanguage }) {
  if (!process.env.SMTP_PASS) {
    return;
  }

  const trustpilotBcc = process.env.TRUSTPILOT_BCC_EMAIL || "exentax.com+1dc60fd1a2@invite.trustpilot.com";
  const html = getOrderCompletedTemplate(name, orderNumber, lang);

  const subjectI18n: Record<string, string> = {
    es: "Pedido completado - Documentación disponible",
    en: "Order completed - Documentation available",
    ca: "Comanda completada - Documentació disponible",
    fr: "Commande terminée - Documentation disponible",
    de: "Bestellung abgeschlossen - Dokumentation verfügbar",
    it: "Ordine completato - Documentazione disponibile",
    pt: "Pedido concluído - Documentação disponível",
  };

  try {
    const path = await import("path");
    const logoPath = path.join(process.cwd(), "client/public/logo-icon.png");

    const info = await transporter.sendMail({
      from: `"Exentax" <no-reply@exentax.com>`,
      replyTo: "hola@exentax.com",
      to: to,
      bcc: trustpilotBcc,
      subject: subjectI18n[lang] || subjectI18n.es,
      html,
      attachments: [
        {
          filename: 'logo-icon.png',
          path: logoPath,
          cid: 'logo-icon'
        }
      ]
    });
    return info;
  } catch (error: any) {
    return null;
  }
}
