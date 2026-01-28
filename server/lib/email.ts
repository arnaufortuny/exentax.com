import nodemailer from "nodemailer";

export function getEmailHeader(title: string = "Easy US LLC") {
  const domain = "easyusllc.com";
  const protocol = 'https';
  const logoUrl = `${protocol}://${domain}/logo-email.png?v=4`;
  
  return `
    <div style="background-color: #ffffff; padding: 40px 20px; text-align: center; border-bottom: 3px solid #6EDC8A;">
      <div style="margin-bottom: 25px; display: block; width: 100%; text-align: center;">
        <a href="https://${domain}" target="_blank" style="text-decoration: none; display: inline-block;">
          <img src="${logoUrl}" alt="Easy US LLC" width="120" height="120" style="display: inline-block; margin: 0 auto; width: 120px; height: 120px; object-fit: contain; border: 0;" />
        </a>
      </div>
      <h1 style="color: #0E1215; margin: 0; font-family: 'Inter', Arial, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -1.5px; font-size: 28px; line-height: 1.1;">
        ${title}
      </h1>
    </div>
  `;
}

export function getEmailFooter() {
  const year = new Date().getFullYear();
  return `
    <div style="background-color: #0E1215; padding: 40px 20px; text-align: center; color: #F7F7F5; font-family: 'Inter', Arial, sans-serif;">
      <p style="margin: 0 0 15px 0; font-weight: 800; color: #6EDC8A; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Expertos en formación de LLC</p>
      <p style="margin: 0; font-size: 13px; color: #F7F7F5; font-weight: 500;">New Mexico, USA | <a href="mailto:info@easyusllc.com" style="color: #6EDC8A; text-decoration: none; font-weight: 700;">info@easyusllc.com</a></p>
      <div style="margin-top: 20px;">
        <a href="https://wa.me/34614916910" style="color: #F7F7F5; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; margin: 0 15px; border-bottom: 1px solid #6EDC8A;">WhatsApp</a>
        <a href="https://easyusllc.com" style="color: #F7F7F5; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; margin: 0 15px; border-bottom: 1px solid #6EDC8A;">Web Oficial</a>
      </div>
      <p style="margin-top: 30px; font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">© ${year} Easy US LLC. Todos los derechos reservados.</p>
    </div>
  `;
}

export function getAccountSuspendedTemplate(name: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Cuenta Suspendida Temporalmente")}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hola ${name},</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Te informamos que tu cuenta en Easy US LLC ha sido <strong>suspendida temporalmente</strong>.</p>
          <div style="background: #FEF3CD; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FFC107;">
            <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">Esta suspensión es temporal y puede deberse a documentación pendiente o verificación de datos. Revisa el correo de nuestro equipo de atención al cliente para conocer los pasos a seguir y restaurar el acceso.</p>
          </div>
          <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px; text-align: center;">Si tienes alguna duda urgente, puedes contactarnos vía WhatsApp.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getAccountDeactivatedTemplate(name: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Cuenta Desactivada")}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hola ${name},</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Te informamos que tu cuenta en Easy US LLC ha sido <strong>desactivada permanentemente</strong>.</p>
          <div style="background: #FEE2E2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #EF4444;">
            <p style="margin: 0; font-size: 14px; color: #B91C1C; line-height: 1.6;">Esta desactivación es definitiva debido a incumplimiento de políticas o por solicitud propia. Si crees que esto es un error, contacta con nuestro equipo de soporte.</p>
          </div>
          <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px; text-align: center;">Si tienes alguna consulta, puedes contactarnos vía WhatsApp o email.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getClaudiaMessageTemplate(name: string, customMessage: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Mensaje de Claudia")}
        <div style="padding: 40px;">
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 20px;">Hola <strong>${name}</strong>,</p>
          <div style="font-size: 15px; color: #0E1215; line-height: 1.7; white-space: pre-wrap; margin-bottom: 30px;">
            ${customMessage}
          </div>
          <p style="line-height: 1.6; font-size: 14px; color: #444;">Quedo a tu disposición para cualquier consulta adicional.</p>
          <p style="margin-top: 20px; font-weight: 800; color: #0E1215;">Atentamente,<br>Claudia<br><span style="color: #6EDC8A; font-size: 12px; text-transform: uppercase;">Atención al Cliente | Easy US LLC</span></p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getAutoReplyTemplate(ticketId: string, name: string = "Cliente") {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hemos recibido tu consulta</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Hola <strong>${name}</strong>, gracias por contactar con Easy US LLC. Tu consulta ha sido registrada correctamente con el identificador que verás a continuación.</p>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #6EDC8A; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Referencia de Seguimiento</p>
            <p style="margin: 0; font-size: 24px; font-weight: 900; color: #0E1215;">${ticketId}</p>
          </div>

          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 20px;">Nuestro equipo de expertos revisará tu mensaje y te responderá de forma personalizada en un plazo de <strong>24 a 48 horas hábiles</strong>.</p>
          
          <p style="line-height: 1.6; font-size: 14px; color: #6B7280;">Si necesitas añadir información adicional, simplemente responde a este correo manteniendo el asunto intacto.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getOtpEmailTemplate(otp: string) {
  return `
    <div style="background-color: #F7F7F5; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #0E1215; background-color: #ffffff; border: 1px solid #E6E9EC;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #0E1215;">Verificación de Identidad</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #0E1215; margin-bottom: 25px;">Verifica tu email con el siguiente código de seguridad:</p>
          
          <div style="background: #F7F7F5; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
            <p style="margin: 0; font-size: 32px; font-weight: 900; color: #0E1215; letter-spacing: 8px;">${otp}</p>
          </div>

          <p style="line-height: 1.6; font-size: 12px; color: #6B7280; margin-top: 20px;">Este código caducará en 10 minutos.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getWelcomeEmailTemplate(name: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Bienvenido a Easy US LLC, ${name}</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 20px;">Es un placer acompañarte en la expansión de tu negocio hacia los Estados Unidos. Nuestra misión es simplificar cada paso administrativo para que tú puedas centrarte en crecer.</p>
          
          <div style="background: #fcfcfc; border-left: 3px solid #000; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 15px; font-weight: 700; color: #000;">¿Qué esperar ahora?</p>
            <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Asignación de un agente especializado a tu expediente.</li>
              <li style="margin-bottom: 8px;">Revisión de disponibilidad de nombres en el estado seleccionado.</li>
              <li style="margin-bottom: 8px;">Preparación de documentos constitutivos oficiales.</li>
            </ul>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #666;">Recibirás actualizaciones periódicas sobre el estado de tu formación. Si tienes cualquier consulta, nuestro equipo está a tu disposición vía WhatsApp o email.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getConfirmationEmailTemplate(name: string, requestCode: string, details?: any) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });
  const timeStr = now.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });

  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">¡Gracias por tu solicitud, ${name}!</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Hemos recibido correctamente los datos para el registro de tu nueva LLC. Nuestro equipo de especialistas comenzará con la revisión técnica de inmediato.</p>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #6EDC8A;">
            <p style="margin: 0 0 15px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">Referencia de Solicitud</p>
            <p style="margin: 0; font-size: 24px; font-weight: 900; color: #0E1215;">${requestCode}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #000; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">Resumen del Registro</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Fecha y hora:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right;">${dateStr} | ${timeStr}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Nombre Propuesto:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right;">${details?.companyName || 'Pendiente'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Estado de Pago:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0d9488;">Confirmado / Procesando</td>
              </tr>
            </table>
          </div>

          <div style="background: #FFF9E6; padding: 20px; border-radius: 8px; border: 1px solid #FFE4B3; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;"><strong>Próximos Pasos:</strong> En las próximas 24-48h recibirás un email con los documentos constitutivos para tu firma electrónica. Por favor, mantente atento a tu bandeja de entrada.</p>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #666;">Si necesitas realizar cualquier cambio en los datos suministrados, por favor contacta con nosotros respondiendo a este correo.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getNewsletterWelcomeTemplate() {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Suscripción Confirmada</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Ya formas parte de la comunidad de Easy US LLC. A partir de ahora, recibirás información estratégica para optimizar tu negocio en EE.UU.</p>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 8px; border: 1px solid #eee;">
            <p style="margin: 0 0 15px 0; font-weight: 800; font-size: 12px; text-transform: uppercase; color: #000;">Lo que vas a recibir:</p>
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: 700; font-size: 14px; color: #000;">Guías de Cumplimiento</p>
              <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;">Información clave sobre BOI Reports y declaraciones anuales.</p>
            </div>
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; font-weight: 700; font-size: 14px; color: #000;">Tips de Banca USA</p>
              <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;">Novedades sobre Mercury, Relay y gestión de fondos en USD.</p>
            </div>
            <div>
              <p style="margin: 0; font-weight: 700; font-size: 14px; color: #000;">Estrategia Fiscal</p>
              <p style="margin: 3px 0 0 0; font-size: 13px; color: #666;">Cómo operar sin IVA y minimizar el impacto tributario legalmente.</p>
            </div>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #666; margin-top: 25px; text-align: center;">Bienvenido al ecosistema global de emprendimiento.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getReminderEmailTemplate(name: string, requestCode: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Termina tu registro</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444;">Hola <strong>${name}</strong>, hemos notado que tu solicitud para una nueva LLC aún no está completa.</p>
          
          <div style="background: #f1f5f9; padding: 25px; border-radius: 8px; margin: 35px 0; border: 1px dashed #cbd5e1; text-align: center;">
            <p style="margin: 0; font-size: 15px; color: #000;"><strong>Solicitud pendiente:</strong> ${requestCode}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://easyusllc.com/seguimiento" style="background-color: #000; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 800; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Continuar Solicitud →</a>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getActionRequiredTemplate(name: string, orderNumber: string, actionDescription: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Acción Requerida")}
        <div style="padding: 40px;">
          <div style="background: #FEF2F2; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #EF4444;">
            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #DC2626; text-transform: uppercase;">Requiere tu atención</p>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hola ${name},</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Necesitamos tu ayuda para continuar con el proceso de tu solicitud. Por favor, revisa la siguiente información:</p>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e5e5e5;">
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">Pedido</p>
            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 900; color: #0E1215;">${orderNumber}</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">Acción Necesaria</p>
            <p style="margin: 0; font-size: 15px; color: #444; line-height: 1.6;">${actionDescription}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://easyusllc.com/dashboard" style="background-color: #0E1215; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 800; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Ir a Mi Panel →</a>
          </div>
          
          <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px; text-align: center;">También puedes responder directamente a este correo si tienes alguna duda.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getNoteReceivedTemplate(name: string, noteContent: string, orderNumber?: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Nuevo Mensaje")}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hola ${name},</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Has recibido un nuevo mensaje de nuestro equipo${orderNumber ? ` relacionado con tu pedido <strong>${orderNumber}</strong>` : ""}:</p>
          
          <div style="background: #F0FDF4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6EDC8A;">
            <p style="margin: 0; font-size: 15px; color: #0E1215; line-height: 1.6; white-space: pre-wrap;">${noteContent}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://easyusllc.com/dashboard" style="background-color: #6EDC8A; color: #0E1215; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 800; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Ver en Mi Panel →</a>
          </div>
          
          <p style="line-height: 1.6; font-size: 14px; color: #6B7280; margin-top: 25px; text-align: center;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getOrderUpdateTemplate(name: string, orderNumber: string, newStatus: string, statusDescription: string, amount?: number) {
  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    pending: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    processing: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    paid: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
    filed: { bg: "#E0E7FF", border: "#6366F1", text: "#3730A3" },
    documents_ready: { bg: "#E0E7FF", border: "#6366F1", text: "#3730A3" },
    completed: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
    cancelled: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
  };
  
  const colors = statusColors[newStatus] || statusColors.processing;
  const statusLabels: Record<string, string> = {
    pending: "PENDIENTE",
    processing: "EN PROCESO",
    paid: "PAGADO",
    filed: "PRESENTADO",
    documents_ready: "DOCUMENTOS LISTOS",
    completed: "COMPLETADO",
    cancelled: "CANCELADO"
  };
  const statusLabel = statusLabels[newStatus] || newStatus.toUpperCase().replace(/_/g, " ");
  
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Actualización de Pedido")}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hola ${name},</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Tu pedido ha sido actualizado con un nuevo estado:</p>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e5e5e5;">
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">Número de Pedido</p>
            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 900; color: #0E1215;">${orderNumber}</p>
            
            <div style="background: ${colors.bg}; padding: 15px 20px; border-radius: 8px; border-left: 4px solid ${colors.border};">
              <p style="margin: 0; font-size: 14px; font-weight: 800; color: ${colors.text}; text-transform: uppercase;">${statusLabel}</p>
            </div>
            ${amount ? `<p style="margin: 15px 0 0 0; font-size: 14px; color: #6B7280;">Total pagado: <strong>$${(amount/100).toFixed(2)}</strong></p>` : ''}
          </div>
          
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">${statusDescription}</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.BASE_URL || 'https://easyusllc.com'}/dashboard" style="background-color: #0E1215; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 800; display: inline-block; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Ver Detalles y Recibo →</a>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getInvoiceEmailTemplate(name: string, orderNumber: string, invoiceDetails: {
  items: Array<{ description: string; quantity: number; price: number }>;
  subtotal: number;
  tax?: number;
  total: number;
  invoiceNumber: string;
  issueDate: string;
}) {
  const itemsHtml = invoiceDetails.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444;">${item.description}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join("");

  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader("Factura")}
        <div style="padding: 40px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Factura</p>
              <p style="margin: 0; font-size: 18px; font-weight: 900; color: #0E1215;">${invoiceDetails.invoiceNumber}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Fecha</p>
              <p style="margin: 0; font-size: 14px; color: #444;">${invoiceDetails.issueDate}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Cliente</p>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0E1215;">${name}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6B7280;">Pedido: ${orderNumber}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 12px 0; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280; border-bottom: 2px solid #e5e5e5;">Descripción</th>
                <th style="padding: 12px 0; text-align: center; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280; border-bottom: 2px solid #e5e5e5;">Cant.</th>
                <th style="padding: 12px 0; text-align: right; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280; border-bottom: 2px solid #e5e5e5;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #0E1215; padding-top: 15px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #6B7280;">Subtotal</span>
              <span style="font-size: 14px; color: #444;">$${invoiceDetails.subtotal.toFixed(2)}</span>
            </div>
            ${invoiceDetails.tax ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #6B7280;">Impuestos</span>
              <span style="font-size: 14px; color: #444;">$${invoiceDetails.tax.toFixed(2)}</span>
            </div>
            ` : ""}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e5e5;">
              <span style="font-size: 16px; font-weight: 800; color: #0E1215;">TOTAL</span>
              <span style="font-size: 18px; font-weight: 900; color: #6EDC8A;">$${invoiceDetails.total.toFixed(2)}</span>
            </div>
          </div>

          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #6EDC8A;">
            <p style="margin: 0; font-size: 14px; color: #065F46; text-align: center;"><strong>Pago confirmado</strong> - Gracias por tu confianza</p>
          </div>
          
          <p style="line-height: 1.6; font-size: 12px; color: #6B7280; margin-top: 25px; text-align: center;">Este documento sirve como comprobante de pago. Para cualquier consulta sobre facturación, contacta con nosotros.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.es",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Email credentials missing. Email not sent.");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
