import nodemailer from "nodemailer";

export interface EmailMetadata {
  clientId?: string;
  date?: Date;
  reference?: string;
  ip?: string;
}

export function getEmailHeader(title: string = "Easy US LLC", metadata?: EmailMetadata) {
  const domain = "easyusllc.com";
  const now = metadata?.date || new Date();
  const dateStr = now.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
  
  const metadataHtml = (metadata?.clientId || metadata?.reference) ? `
    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
      <tr>
        ${metadata?.clientId ? `<td style="text-align: left; font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;"><strong>ID Cliente:</strong> ${metadata.clientId}</td>` : '<td></td>'}
        <td style="text-align: center; font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;"><strong>Fecha:</strong> ${dateStr} ${timeStr}</td>
        ${metadata?.reference ? `<td style="text-align: right; font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;"><strong>Ref:</strong> ${metadata.reference}</td>` : '<td></td>'}
      </tr>
    </table>
  ` : '';
  
  return `
    <div style="background: linear-gradient(180deg, #ffffff 0%, #F7F7F5 100%); padding: 35px 20px 25px; text-align: center; border-bottom: 4px solid #6EDC8A;">
      <div style="margin-bottom: 20px; display: block; width: 100%; text-align: center;">
        <a href="https://${domain}" target="_blank" style="text-decoration: none; display: inline-block;">
          <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #6EDC8A 0%, #4CAF50 100%); border-radius: 16px; box-shadow: 0 4px 12px rgba(110,220,138,0.3); text-align: center; line-height: 80px;">
            <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 32px; font-weight: 900; color: #ffffff;">US</span>
          </div>
        </a>
      </div>
      <h1 style="color: #0E1215; margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; font-size: 24px; line-height: 1.2;">
        ${title}
      </h1>
      ${metadataHtml}
    </div>
  `;
}

export function getEmailFooter() {
  const year = new Date().getFullYear();
  return `
    <div style="background-color: #0E1215; padding: 35px 20px; text-align: center; color: #F7F7F5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
      <table style="width: 100%; max-width: 400px; margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td style="padding: 0 10px;">
            <a href="https://wa.me/34614916910" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 10px 20px; border-radius: 6px;">WhatsApp</a>
          </td>
          <td style="padding: 0 10px;">
            <a href="https://easyusllc.com/dashboard" style="display: inline-block; background: transparent; color: #F7F7F5; text-decoration: none; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 10px 20px; border-radius: 6px; border: 1px solid #6EDC8A;">Mi Panel</a>
          </td>
        </tr>
      </table>
      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #333;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #6EDC8A; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Expertos en formación de LLC en EE.UU.</p>
        <p style="margin: 0; font-size: 12px; color: #9CA3AF;">New Mexico, USA | <a href="mailto:info@easyusllc.com" style="color: #6EDC8A; text-decoration: none; font-weight: 600;">info@easyusllc.com</a></p>
      </div>
      <p style="margin-top: 20px; font-size: 10px; color: #6B7280;">© ${year} Easy US LLC. Todos los derechos reservados.</p>
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

export function getOtpEmailTemplate(otp: string, purpose: string = "verificar tu email") {
  return `
    <div style="background-color: #F7F7F5; padding: 20px 0;">
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: auto; border-radius: 12px; overflow: hidden; color: #0E1215; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        ${getEmailHeader("Código de Verificación")}
        <div style="padding: 40px;">
          <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px; text-align: center;">Usa el siguiente código para ${purpose}:</p>
          
          <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #6EDC8A;">
            <p style="margin: 0; font-size: 36px; font-weight: 900; color: #0E1215; letter-spacing: 10px; font-family: 'SF Mono', 'Consolas', monospace;">${otp}</p>
          </div>

          <div style="text-align: center;">
            <p style="line-height: 1.6; font-size: 13px; color: #6B7280; margin: 0;">Este código es válido por <strong>10 minutos</strong>.</p>
            <p style="line-height: 1.6; font-size: 12px; color: #9CA3AF; margin-top: 10px;">Si no solicitaste este código, ignora este mensaje.</p>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getWelcomeEmailTemplate(name: string, clientId?: string) {
  return `
    <div style="background-color: #F7F7F5; padding: 20px 0;">
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: auto; border-radius: 12px; overflow: hidden; color: #0E1215; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        ${getEmailHeader("¡Bienvenido!", { clientId })}
        <div style="padding: 40px;">
          <h2 style="font-size: 22px; font-weight: 900; margin-bottom: 20px; color: #0E1215;">Hola ${name},</h2>
          <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px;">Es un placer acompañarte en la expansión de tu negocio hacia Estados Unidos. Nuestra misión es simplificar cada paso administrativo para que tú puedas centrarte en crecer.</p>
          
          <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #6EDC8A;">
            <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 800; color: #0E1215; text-transform: uppercase; letter-spacing: 0.5px;">¿Qué esperar ahora?</p>
            <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
              <li style="margin-bottom: 10px;">Asignación de un agente especializado a tu expediente</li>
              <li style="margin-bottom: 10px;">Revisión de disponibilidad de nombres en el estado seleccionado</li>
              <li style="margin-bottom: 0;">Preparación de documentos constitutivos oficiales</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://easyusllc.com/dashboard" style="display: inline-block; background: #6EDC8A; color: #0E1215; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 14px 35px; border-radius: 8px; letter-spacing: 0.5px;">Acceder a Mi Panel</a>
          </div>

          <p style="line-height: 1.6; font-size: 13px; color: #6B7280; text-align: center;">Recibirás actualizaciones periódicas sobre el estado de tu formación.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getConfirmationEmailTemplate(name: string, requestCode: string, details?: any, clientId?: string) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });

  return `
    <div style="background-color: #F7F7F5; padding: 20px 0;">
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: auto; border-radius: 12px; overflow: hidden; color: #0E1215; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        ${getEmailHeader("Solicitud Recibida", { clientId, reference: requestCode })}
        <div style="padding: 40px;">
          <h2 style="font-size: 22px; font-weight: 900; margin: 0 0 20px 0; color: #0E1215; text-align: center;">¡Gracias, ${name}!</h2>
          <p style="line-height: 1.7; font-size: 15px; color: #444; margin-bottom: 25px; text-align: center;">Hemos recibido correctamente los datos para el registro de tu nueva LLC. Nuestro equipo comenzará con la revisión de inmediato.</p>
          
          <div style="background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #6EDC8A; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280; letter-spacing: 1px;">Número de Referencia</p>
            <p style="margin: 0; font-size: 28px; font-weight: 900; color: #0E1215; letter-spacing: 1px;">${requestCode}</p>
          </div>

          <div style="background: #F9FAFB; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0E1215; letter-spacing: 0.5px;">Resumen del Registro</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E5E7EB;">Fecha y hora</td>
                <td style="padding: 10px 0; font-weight: 700; text-align: right; border-bottom: 1px solid #E5E7EB;">${dateStr}, ${timeStr}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E5E7EB;">Nombre Propuesto</td>
                <td style="padding: 10px 0; font-weight: 700; text-align: right; border-bottom: 1px solid #E5E7EB;">${details?.companyName || 'Pendiente de confirmación'}</td>
              </tr>
              ${details?.state ? `<tr><td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E5E7EB;">Estado</td><td style="padding: 10px 0; font-weight: 700; text-align: right; border-bottom: 1px solid #E5E7EB;">${details.state}</td></tr>` : ''}
              ${details?.price ? `<tr><td style="padding: 10px 0; color: #6B7280; border-bottom: 1px solid #E5E7EB;">Importe</td><td style="padding: 10px 0; font-weight: 700; text-align: right; color: #059669; border-bottom: 1px solid #E5E7EB;">${details.price} €</td></tr>` : ''}
              <tr>
                <td style="padding: 10px 0; color: #6B7280;">Estado de Pago</td>
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
            ${amount ? `<p style="margin: 15px 0 0 0; font-size: 14px; color: #6B7280;">Total pagado: <strong>${(amount/100).toFixed(2)} €</strong></p>` : ''}
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
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #444; text-align: right;">${item.price.toFixed(2)} €</td>
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
              <span style="font-size: 14px; color: #444;">${invoiceDetails.subtotal.toFixed(2)} €</span>
            </div>
            ${invoiceDetails.tax ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #6B7280;">Impuestos</span>
              <span style="font-size: 14px; color: #444;">${invoiceDetails.tax.toFixed(2)} €</span>
            </div>
            ` : ""}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e5e5;">
              <span style="font-size: 16px; font-weight: 800; color: #0E1215;">TOTAL</span>
              <span style="font-size: 18px; font-weight: 900; color: #6EDC8A;">${invoiceDetails.total.toFixed(2)} €</span>
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
    return;
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error: any) {
    return null;
  }
}
