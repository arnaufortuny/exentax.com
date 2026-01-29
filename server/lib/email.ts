import nodemailer from "nodemailer";

const domain = "easyusllc.com";
const companyAddress = `Easy US LLC
1209 Mountain Road Place Northeast
STE R
Albuquerque, NM 87110`;

function getSimpleHeader() {
  return `
    <div style="background: linear-gradient(180deg, #ffffff 0%, #F0FDF4 100%); padding: 40px 20px 30px; text-align: center; border-bottom: 4px solid #6EDC8A;">
      <a href="https://${domain}" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="https://${domain}/logo-email.png" alt="Easy US LLC" width="70" height="70" style="display: block; margin: 0 auto; border-radius: 14px; box-shadow: 0 4px 12px rgba(110,220,138,0.3);" />
      </a>
    </div>
  `;
}

function getSimpleFooter() {
  return `
    <div style="background-color: #0E1215; padding: 30px 20px; text-align: center; color: #F7F7F5;">
      <p style="margin: 0 0 5px 0; font-weight: 700; color: #6EDC8A; font-size: 13px;">Easy US LLC</p>
      <p style="margin: 0; font-size: 11px; color: #9CA3AF; line-height: 1.6;">1209 Mountain Road Place Northeast<br>STE R<br>Albuquerque, NM 87110</p>
      <p style="margin-top: 15px; font-size: 10px; color: #6B7280;">© ${new Date().getFullYear()} Easy US LLC. Todos los derechos reservados.</p>
    </div>
  `;
}

function getEmailWrapper(content: string) {
  return `
    <div style="background-color: #F7F7F5; padding: 30px 15px;">
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: auto; border-radius: 16px; overflow: hidden; color: #0E1215; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
        ${getSimpleHeader()}
        <div style="padding: 40px 35px;">
          ${content}
          <p style="line-height: 1.6; font-size: 14px; color: #444; margin-top: 30px;">Si tienes cualquier duda, responde directamente a este correo.</p>
        </div>
        ${getSimpleFooter()}
      </div>
    </div>
  `;
}

// 1. OTP - Código de verificación
export function getOtpEmailTemplate(otp: string, name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 20px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 10px;">Gracias por continuar con tu proceso en Easy US LLC.</p>
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 30px;">Para garantizar la seguridad de tu cuenta, utiliza el siguiente código de verificación:</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #059669; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Tu código OTP:</p>
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0E1215; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>

    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0E1215; text-transform: uppercase;">Importante:</p>
      <ul style="margin: 0; padding-left: 18px; color: #444; font-size: 14px; line-height: 1.8;">
        <li style="margin-bottom: 6px;">Este código es personal y confidencial</li>
        <li style="margin-bottom: 6px;">Tiene una validez limitada a <strong>15 minutos</strong> por motivos de seguridad</li>
        <li>No lo compartas con nadie</li>
      </ul>
    </div>

    <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px;">Si no has solicitado este código, puedes ignorar este mensaje con total tranquilidad.</p>
  `;
  return getEmailWrapper(content);
}

// 2. Bienvenida - Cuenta creada
export function getWelcomeEmailTemplate(name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Gracias por registrarte en Easy US LLC.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Tu cuenta ha sido creada correctamente. Desde tu panel podrás gestionar solicitudes, documentación y el estado de tus servicios en todo momento.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 8px; letter-spacing: 0.5px;">Acceder a Mi Panel</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 3. Cuenta en revisión
export function getAccountUnderReviewTemplate(name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Te informamos de que tu cuenta se encuentra actualmente en revisión.</p>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">Durante este proceso de validación, no será posible realizar nuevos pedidos ni modificar información existente en tu panel. Esta medida es temporal y forma parte de nuestros procedimientos de verificación.</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo está revisando la información proporcionada y te notificaremos por este mismo medio en cuanto el proceso haya finalizado o si fuera necesario aportar documentación adicional.</p>
  `;
  return getEmailWrapper(content);
}

// 4. Confirmación de Solicitud (LLC / Mantenimiento)
export function getConfirmationEmailTemplate(name: string, requestCode: string, details?: { companyName?: string; state?: string; serviceType?: string }) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hemos recibido correctamente tu solicitud.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Referencia:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0E1215;">#${requestCode}</td>
        </tr>
        ${details?.serviceType ? `<tr><td style="padding: 8px 0; color: #6B7280;">Servicio:</td><td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0E1215;">${details.serviceType}</td></tr>` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Estado actual:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #059669;">En revisión</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo está validando la información y te notificaremos cualquier actualización directamente por email.</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Para cualquier duda relacionada con esta solicitud, responde a este correo indicando tu número de referencia.</p>
  `;
  return getEmailWrapper(content);
}

// 5. Auto-respuesta de Contacto
export function getAutoReplyTemplate(ticketId: string, name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tu mensaje ha sido recibido correctamente.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #6EDC8A; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">Número de ticket</p>
      <p style="margin: 0; font-size: 24px; font-weight: 900; color: #0E1215;">#${ticketId}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Tiempo estimado de respuesta: <strong>24-48 horas laborables</strong></p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Nuestro equipo revisará tu consulta y te responderá lo antes posible. Si necesitas añadir información adicional, responde directamente a este correo.</p>
  `;
  return getEmailWrapper(content);
}

// 6. Actualización de Pedido
export function getOrderUpdateTemplate(name: string, orderNumber: string, newStatus: string, statusDescription: string) {
  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    processing: "En proceso",
    paid: "Pagado",
    filed: "Presentado",
    documents_ready: "Documentos listos",
    completed: "Completado",
    cancelled: "Cancelado"
  };
  const statusLabel = statusLabels[newStatus] || newStatus.replace(/_/g, " ");
  
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">El estado de tu pedido ha sido actualizado.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Pedido:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0E1215;">#${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Nuevo estado:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #059669;">${statusLabel}</td>
        </tr>
      </table>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">${statusDescription}</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Para cualquier aclaración sobre esta actualización, responde directamente a este correo.</p>
  `;
  return getEmailWrapper(content);
}

// 7. Pedido Completado + Trustpilot
export function getOrderCompletedTemplate(name: string, orderNumber: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tu pedido ha sido completado correctamente.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.6;">Ya puedes acceder a toda la documentación desde tu panel de cliente.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${domain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 8px; letter-spacing: 0.5px;">Acceder a documentos</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Tu experiencia es importante para nosotros. Si lo deseas, puedes valorar nuestro servicio cuando recibas la invitación correspondiente.</p>
  `;
  return getEmailWrapper(content);
}

// 8. Nuevo Mensaje (admin a cliente)
export function getNoteReceivedTemplate(name: string, noteContent: string, orderNumber?: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tienes un nuevo mensaje de nuestro equipo${orderNumber ? ` relacionado con tu pedido #${orderNumber}` : ''}.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7; white-space: pre-wrap;">${noteContent}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Puedes responder directamente a este correo para continuar la conversación.</p>
  `;
  return getEmailWrapper(content);
}

// 9. Cuenta Desactivada
export function getAccountDeactivatedTemplate(name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Te informamos de que tu cuenta ha sido desactivada temporalmente.</p>
    
    <div style="background: #FEE2E2; padding: 20px 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #EF4444;">
      <p style="margin: 0; font-size: 14px; color: #B91C1C; line-height: 1.7;">Mientras la cuenta permanezca desactivada no será posible realizar solicitudes ni acceder a formularios.</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Si consideras que se trata de un error o necesitas más información, responde directamente a este correo.</p>
  `;
  return getEmailWrapper(content);
}

// 10. Newsletter Bienvenida
export function getNewsletterWelcomeTemplate() {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tu suscripción ha sido confirmada correctamente.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Recibirás información relevante sobre servicios, actualizaciones y novedades relacionadas con Easy US LLC.</p>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Puedes darte de baja en cualquier momento desde el enlace incluido en nuestros correos.</p>
  `;
  return getEmailWrapper(content);
}

// Legacy exports for compatibility
export interface EmailMetadata {
  clientId?: string;
  date?: Date;
  reference?: string;
  ip?: string;
}

export function getEmailHeader(title: string = "Easy US LLC", metadata?: EmailMetadata) {
  return getSimpleHeader();
}

export function getEmailFooter() {
  return getSimpleFooter();
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

export async function sendEmail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return;
  }

  const testEmail = "afortuny07@gmail.com";
  const originalTo = to;

  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <no-reply@easyusllc.com>`,
      replyTo: replyTo || "hola@easyusllc.com",
      to: testEmail,
      subject: `[TEST - Para: ${originalTo}] ${subject}`,
      html,
    });
    return info;
  } catch (error: any) {
    return null;
  }
}

export async function sendTrustpilotEmail({ to, name, orderNumber }: { to: string; name: string; orderNumber: string }) {
  if (!process.env.SMTP_PASS) {
    return;
  }

  const testEmail = "afortuny07@gmail.com";
  const originalTo = to;
  const trustpilotBcc = process.env.TRUSTPILOT_BCC_EMAIL || "easyusllc.com+62fb280c0a@invite.trustpilot.com";

  const html = getOrderCompletedTemplate(name, orderNumber);

  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <no-reply@easyusllc.com>`,
      replyTo: "hola@easyusllc.com",
      to: testEmail,
      bcc: trustpilotBcc,
      subject: `[TEST - Para: ${originalTo}] Pedido completado - Documentación disponible`,
      html,
    });
    return info;
  } catch (error: any) {
    return null;
  }
}
