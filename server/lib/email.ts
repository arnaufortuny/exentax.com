import nodemailer from "nodemailer";

const domain = "easyusllc.com";
const appDomain = "app.easyusllc.com";
const companyAddress = `Easy US LLC
1209 Mountain Road Place Northeast
STE R
Albuquerque, NM 87110`;

function getSimpleHeader() {
  return `
    <div style="background: linear-gradient(180deg, #0E1215 0%, #1a1f25 100%); padding: 35px 20px; text-align: center;">
      <a href="https://${domain}" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="https://${domain}/logo-email.png" alt="Easy US LLC" width="60" height="60" style="display: block; margin: 0 auto 12px; border-radius: 50%;" />
        <span style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 18px; font-weight: 800; color: #F7F7F5; letter-spacing: -0.5px;">Easy US LLC</span>
      </a>
    </div>
  `;
}

function getSimpleFooter() {
  return `
    <div style="background-color: #0E1215; padding: 35px 25px; text-align: center; color: #F7F7F5;">
      <div style="width: 40px; height: 3px; background: #6EDC8A; margin: 0 auto 20px; border-radius: 2px;"></div>
      <p style="margin: 0 0 15px 0; font-size: 12px; color: #9CA3AF; line-height: 1.7;">1209 Mountain Road Place Northeast, STE R<br>Albuquerque, NM 87110</p>
      <p style="margin: 0; font-size: 11px; color: #6B7280;">© ${new Date().getFullYear()} Easy US LLC</p>
    </div>
  `;
}

function getEmailWrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F7F7F5;">
      <div style="background-color: #F7F7F5; padding: 40px 15px;">
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: auto; border-radius: 24px; overflow: hidden; color: #0E1215; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          ${getSimpleHeader()}
          <div style="padding: 40px 35px;">
            ${content}
            <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 35px; padding-top: 25px; border-top: 1px solid #E6E9EC;">Si tienes cualquier duda, responde directamente a este correo.</p>
          </div>
          ${getSimpleFooter()}
        </div>
      </div>
    </body>
    </html>
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

    <div style="background: #F9FAFB; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
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
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Gracias por registrarte en Easy US LLC.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Tu cuenta ha sido creada correctamente. Desde tu Área Cliente podrás gestionar solicitudes, documentación y el estado de tus servicios en todo momento.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Mi Área Cliente</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 3. Cuenta en revisión
export function getAccountUnderReviewTemplate(name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Te informamos de que tu cuenta se encuentra actualmente en revisión.</p>
    
    <div style="background: #FEF3C7; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.7;">Durante este proceso de validación, no será posible realizar nuevos pedidos ni modificar información existente en tu Área Cliente. Esta medida es temporal y forma parte de nuestros procedimientos de verificación.</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo está revisando la información proporcionada y te notificaremos por este mismo medio en cuanto el proceso haya finalizado o si fuera necesario aportar documentación adicional.</p>
  `;
  return getEmailWrapper(content);
}

// 3b. Cuenta actualizada a VIP
export function getAccountVipTemplate(name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Tu cuenta ha sido actualizada al estado VIP.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0 0 15px 0; font-size: 15px; color: #0E1215; font-weight: 600;">Beneficios VIP:</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.8;">
        <li>Atención prioritaria y gestión acelerada</li>
        <li>Seguimiento preferente por nuestro equipo</li>
        <li>Acceso completo a todos los servicios</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Mi Área Cliente</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 3c. Cuenta reactivada
export function getAccountReactivatedTemplate(name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Tu cuenta ha sido reactivada correctamente.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Ya puedes acceder a tu Área Cliente y utilizar todos nuestros servicios con normalidad.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Mi Área Cliente</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 4. Confirmación de Solicitud (LLC / Mantenimiento)
export function getConfirmationEmailTemplate(name: string, requestCode: string, details?: { companyName?: string; state?: string; serviceType?: string }) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hemos recibido correctamente tu solicitud.</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
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
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A; text-align: center;">
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
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
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
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.6;">Ya puedes acceder a toda la documentación desde tu Área Cliente.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Acceder a documentos</a>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Tu experiencia es importante para nosotros. Si lo deseas, puedes valorar nuestro servicio cuando recibas la invitación correspondiente.</p>
  `;
  return getEmailWrapper(content);
}

// 8. Nuevo Mensaje (admin a cliente)
export function getNoteReceivedTemplate(name: string, noteContent: string, orderNumber?: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Tienes un nuevo mensaje de nuestro equipo${orderNumber ? ` relacionado con tu pedido <strong>#${orderNumber}</strong>` : ''}.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7; white-space: pre-wrap;">${noteContent}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Mi Área Cliente</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 8b. Nota con ticket (admin a cliente)
export function getAdminNoteTemplate(name: string, title: string, message: string, ticketId: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #0E1215;">${title}</h2>
      <span style="font-size: 12px; color: #6B7280; background: #F3F4F6; padding: 6px 12px; border-radius: 20px;">Ticket: ${ticketId}</span>
    </div>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7; white-space: pre-wrap;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Mi Área Cliente</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 8c. Solicitud de Pago
export function getPaymentRequestTemplate(name: string, message: string, paymentLink: string, amount?: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Se ha generado una solicitud de pago para continuar con tu trámite${amount ? ` por un valor de <strong>${amount}</strong>` : ''}.</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Mensaje:</p>
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${paymentLink}" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 16px 45px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Realizar Pago</a>
    </div>
    
    <p style="line-height: 1.5; font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 20px;">Si el botón no funciona, copia y pega este enlace:<br><a href="${paymentLink}" style="color: #6EDC8A; word-break: break-all;">${paymentLink}</a></p>
  `;
  return getEmailWrapper(content);
}

// 8d. Solicitud de Documentación
export function getDocumentRequestTemplate(name: string, documentType: string, message: string, ticketId: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo requiere que subas el siguiente documento:</p>
    
    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #F59E0B; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #92400E;">${documentType}</p>
    </div>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase;">Mensaje:</p>
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7;">${message}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 13px; color: #6B7280; margin-bottom: 25px;">Ticket de referencia: <strong>#${ticketId}</strong></p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Subir Documento</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 8e. Documento Subido por Admin
export function getDocumentUploadedTemplate(name: string, documentType: string, orderCode: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Hemos añadido un nuevo documento a tu expediente:</p>
    
    <div style="background: linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%); padding: 20px 25px; border-radius: 16px; margin: 25px 0; border: 2px solid #10B981; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #065F46;">${documentType}</p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #047857;">Pedido: ${orderCode}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Puedes acceder y descargar este documento desde tu Área Cliente.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Mis Documentos</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 8f. Respuesta a consulta (admin a cliente)
export function getMessageReplyTemplate(name: string, content: string, ticketId: string) {
  const emailContent = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Hemos respondido a tu consulta (Ticket: <strong>#${ticketId}</strong>):</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.7; white-space: pre-wrap;">${content}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Mi Área Cliente</a>
    </div>
  `;
  return getEmailWrapper(emailContent);
}

// 8f. Código para cambio de contraseña
export function getPasswordChangeOtpTemplate(name: string, otp: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Has solicitado cambiar tu contraseña. Usa este código para verificar tu identidad:</p>
    
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 30px; border-radius: 16px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
      <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0E1215; letter-spacing: 12px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
    </div>
    
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Este código expira en <strong>10 minutos</strong>.</p>
    <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Si no solicitaste este cambio, ignora este mensaje.</p>
  `;
  return getEmailWrapper(content);
}

// 8g. Evento de timeline de pedido
export function getOrderEventTemplate(name: string, orderId: string, eventType: string, description: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Tu pedido <strong>#${orderId}</strong> tiene una actualización:</p>
    
    <div style="background: #F9FAFB; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #0E1215;">${eventType}</p>
      <p style="margin: 0; font-size: 14px; color: #6B7280; line-height: 1.6;">${description}</p>
    </div>
    
    <p style="line-height: 1.5; font-size: 13px; color: #9CA3AF;">Fecha: ${new Date().toLocaleString('es-ES')}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Ver Detalles</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 9. Cuenta Desactivada
export function getAccountDeactivatedTemplate(name: string = "Cliente") {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Te informamos de que tu cuenta ha sido desactivada temporalmente.</p>
    
    <div style="background: #FEE2E2; padding: 20px 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #EF4444;">
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

// 11. Recordatorio de Renovación (plantilla única para 60/30/7 días)
export function getRenewalReminderTemplate(
  name: string, 
  companyName: string, 
  daysRemaining: string, 
  renewalDate: string,
  state: string
) {
  const urgencyColor = daysRemaining === "una semana" ? "#EF4444" : "#F59E0B";
  const urgencyBg = daysRemaining === "una semana" ? "#FEE2E2" : "#FEF3C7";
  
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Te recordamos que el pack de mantenimiento de tu LLC <strong>${companyName}</strong> (${state}) vence pronto.</p>
    
    <div style="background: ${urgencyBg}; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid ${urgencyColor};">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: ${urgencyColor}; text-transform: uppercase;">Vence en ${daysRemaining}</p>
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0E1215;">Fecha de vencimiento: ${renewalDate}</p>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 20px;">Sin el pack de mantenimiento activo, tu LLC puede perder su buen estado legal. Esto incluye:</p>
    
    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8;">
      <li>Agente registrado activo</li>
      <li>Presentación de informes anuales</li>
      <li>Cumplimiento fiscal (IRS 1120/5472)</li>
      <li>Domicilio legal en Estados Unidos</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://${appDomain}/llc/maintenance" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 50px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(110,220,138,0.35);">Renovar Ahora</a>
    </div>
  `;
  return getEmailWrapper(content);
}

// 17. Registro con código de verificación
export function getRegistrationOtpTemplate(name: string, otp: string, clientId: string, expiryMinutes: number = 15) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Gracias por registrarte en Easy US LLC. Tu código de verificación es:</p>
    
    <div style="background-color: #0E1215; padding: 25px; text-align: center; border-radius: 16px; margin: 25px 0;">
      <span style="color: #6EDC8A; font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">${otp}</span>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Este código expira en ${expiryMinutes} minutos.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Tu ID de cliente es: <strong>${clientId}</strong></p>
  `;
  return getEmailWrapper(content);
}

// 18. Notificación admin de nuevo registro
export function getAdminNewRegistrationTemplate(clientId: string, firstName: string, lastName: string, email: string, phone?: string) {
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;"><strong>Nueva cuenta creada en el sistema.</strong></p>
    
    <div style="background-color: #F7F7F5; padding: 20px; border-radius: 16px; border-left: 4px solid #6EDC8A; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Cliente ID:</strong> ${clientId}</p>
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Nombre:</strong> ${firstName} ${lastName}</p>
      <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
      ${phone ? `<p style="margin: 0; font-size: 14px;"><strong>Teléfono:</strong> ${phone}</p>` : ''}
    </div>
  `;
  return getEmailWrapper(content);
}

// 19. Cuenta bloqueada por seguridad
export function getAccountLockedTemplate(name: string, ticketId: string) {
  const baseUrl = process.env.BASE_URL || 'https://app.easyusllc.com';
  const content = `
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin: 0 0 25px 0;">Hola ${name},</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Por su seguridad, su cuenta ha sido temporalmente bloqueada tras detectar múltiples intentos de acceso fallidos.</p>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Para desbloquear su cuenta y verificar su identidad, necesitamos que nos envíe:</p>
    
    <div style="background-color: #FFF3E0; padding: 20px; border-radius: 16px; border-left: 4px solid #FF9800; margin: 25px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #444;">
        <li style="margin-bottom: 8px;">Imagen del DNI/Pasaporte de alta resolución (ambas caras)</li>
        <li>Su fecha de nacimiento confirmada</li>
      </ul>
    </div>
    
    <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Su Ticket ID de referencia es: <strong>#${ticketId}</strong></p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${baseUrl}/forgot-password" style="background-color: #6EDC8A; color: #0E1215; font-weight: 700; font-size: 15px; padding: 16px 40px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(110, 220, 138, 0.3);">Restablecer contraseña</a>
    </div>
  `;
  return getEmailWrapper(content);
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
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Información del Propietario</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Nombre:</strong> ${orderData.ownerFullName || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Email:</strong> ${orderData.ownerEmail || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Teléfono:</strong> ${orderData.ownerPhone || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Fecha nacimiento:</strong> ${orderData.ownerBirthDate || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Documento:</strong> ${orderData.ownerIdType || 'N/A'} - ${orderData.ownerIdNumber || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Dirección:</strong> ${orderData.ownerAddress || 'N/A'}, ${orderData.ownerCity || ''}, ${orderData.ownerProvince || ''} ${orderData.ownerPostalCode || ''}, ${orderData.ownerCountry || ''}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Información de la Empresa</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Empresa:</strong> ${orderData.companyName || 'N/A'} ${orderData.designator || ''}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Alternativo:</strong> ${orderData.companyNameOption2 || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Estado:</strong> ${orderData.state || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Categoría:</strong> ${orderData.businessCategory || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Actividad:</strong> ${orderData.businessActivity || 'N/A'}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Servicios</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
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
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Información del Propietario</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Nombre:</strong> ${orderData.ownerFullName || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Email:</strong> ${orderData.ownerEmail || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Teléfono:</strong> ${orderData.ownerPhone || 'N/A'}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Información de la Empresa</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Empresa:</strong> ${orderData.companyName || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>EIN:</strong> ${orderData.ein || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Estado:</strong> ${orderData.state || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Creado con:</strong> ${orderData.creationSource || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Año creación:</strong> ${orderData.creationYear || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Cuenta bancaria:</strong> ${orderData.bankAccount || 'N/A'}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Pasarela:</strong> ${orderData.paymentGateway || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Actividad:</strong> ${orderData.businessActivity || 'N/A'}</p>
    </div>
    
    <h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #333; border-bottom: 2px solid #6EDC8A; padding-bottom: 5px;">Servicios Solicitados</h3>
    <div style="background: #F7F7F5; border-left: 4px solid #6EDC8A; padding: 15px; margin: 10px 0; border-radius: 8px;">
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
    console.log(`Cleaned up ${removed} stale emails from queue`);
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
        from: `"Easy US LLC" <no-reply@easyusllc.com>`,
        replyTo: job.replyTo || "hola@easyusllc.com",
        to: job.to,
        subject: job.subject,
        html: job.html,
      });
      
      // Success - remove from queue
      emailQueue.shift();
    } catch (error: any) {
      job.retries++;
      
      if (job.retries >= job.maxRetries) {
        // Max retries reached - remove and log
        emailQueue.shift();
        console.error(`Email failed after ${job.maxRetries} retries:`, job.id, job.to);
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
    console.warn(`Email queue full (${MAX_QUEUE_SIZE}), dropping email to: ${to}`);
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
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <no-reply@easyusllc.com>`,
      replyTo: replyTo || "hola@easyusllc.com",
      to: to,
      subject: subject,
      html,
    });
    return info;
  } catch (error: any) {
    // On failure, queue for retry
    queueEmail({ to, subject, html, replyTo });
    return null;
  }
}

export async function sendTrustpilotEmail({ to, name, orderNumber }: { to: string; name: string; orderNumber: string }) {
  if (!process.env.SMTP_PASS) {
    return;
  }

  const trustpilotBcc = process.env.TRUSTPILOT_BCC_EMAIL || "easyusllc.com+62fb280c0a@invite.trustpilot.com";
  const html = getOrderCompletedTemplate(name, orderNumber);

  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <no-reply@easyusllc.com>`,
      replyTo: "hola@easyusllc.com",
      to: to,
      bcc: trustpilotBcc,
      subject: `Pedido completado - Documentación disponible`,
      html,
    });
    return info;
  } catch (error: any) {
    return null;
  }
}
