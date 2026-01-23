import nodemailer from "nodemailer";

export function getEmailHeader() {
  return `
    <div style="background-color: #ffffff; padding: 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
      <div style="margin-bottom: 20px;">
        <img src="https://easyusllc.com/favicon.png" alt="Easy US LLC" style="width: 50px; height: 50px; object-fit: contain;" />
      </div>
      <h1 style="color: #000000; margin: 0; font-family: 'Inter', Arial, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; font-size: 24px; line-height: 1;">
        Easy US <span style="color: #666;">LLC</span>
      </h1>
      <p style="color: #999; margin: 8px 0 0 0; font-family: 'Inter', Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Premium Business Formation</p>
    </div>
  `;
}

export function getEmailFooter() {
  const year = new Date().getFullYear();
  return `
    <div style="background-color: #fafafa; padding: 40px 20px; text-align: center; color: #666; font-family: 'Inter', Arial, sans-serif; border-top: 1px solid #f0f0f0;">
      <p style="margin: 0 0 15px 0; font-weight: 800; color: #000; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Expertos en formación de LLC</p>
      <p style="margin: 0; font-size: 12px; color: #888; font-weight: 500;">New Mexico, USA | <a href="mailto:info@easyusllc.com" style="color: #000; text-decoration: none; font-weight: 700;">info@easyusllc.com</a></p>
      <div style="margin-top: 20px;">
        <a href="https://wa.me/34614916910" style="color: #000; text-decoration: none; font-weight: 800; font-size: 10px; text-transform: uppercase; margin: 0 10px;">WhatsApp</a>
        <a href="https://easyusllc.com" style="color: #000; text-decoration: none; font-weight: 800; font-size: 10px; text-transform: uppercase; margin: 0 10px;">Web Oficial</a>
      </div>
      <p style="margin-top: 25px; font-size: 9px; color: #bbb; text-transform: uppercase; letter-spacing: 1px;">© ${year} Easy US LLC. Todos los derechos reservados.</p>
    </div>
  `;
}

export function getAutoReplyTemplate(ticketId: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">Hemos recibido tu mensaje</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Gracias por contactar con el equipo de soporte de <strong>Easy US LLC</strong>. Hemos registrado tu consulta correctamente y un agente especializado la revisará en breve.</p>
          
          <div style="background: #fcfcfc; padding: 15px; border-radius: 6px; margin: 25px 0; border: 1px solid #eee; text-align: left;">
            <p style="margin: 0; font-size: 14px; color: #666;"><strong>ID de seguimiento:</strong> #${ticketId}</p>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #666; margin-bottom: 20px;">Nuestro tiempo de respuesta habitual es inferior a 24 horas laborables.</p>
          
          <div style="padding-top: 20px; border-top: 1px solid #f0f0f0;">
            <p style="font-size: 12px; color: #999; margin: 0;">Si necesitas añadir información a tu consulta, puedes responder directamente a este correo.</p>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getOtpEmailTemplate(otp: string) {
  return `
    <div style="background-color: #f9f9f9; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; color: #1a1a1a; background-color: #ffffff; border: 1px solid #e5e5e5;">
        ${getEmailHeader()}
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">OTP Verificación de Identidad</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Hola <strong>Cliente de Prueba</strong>, verifica tu email con el siguiente código:</p>
          
          <div style="background: #f4f4f4; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 1px solid #eee;">
            <p style="margin: 0; font-size: 28px; font-weight: 800; color: #000000; letter-spacing: 6px;">${otp}</p>
          </div>

          <p style="line-height: 1.6; font-size: 12px; color: #999; margin-top: 20px;">Este código caducará automáticamente en 10 minutos por motivos de seguridad.</p>
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
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px; color: #000;">¡Gracias por tu pedido, ${name}!</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #444; margin-bottom: 25px;">Hemos recibido correctamente los datos para el registro de tu nueva LLC. Nuestro equipo comenzará con el proceso de inmediato.</p>
          
          <div style="background: #fcfcfc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #eee;">
            <h3 style="margin: 0 0 15px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #000; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">Detalles del Pedido</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Número de pedido:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right;">${requestCode}</td>
              </tr>
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
                <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0d9488;">Confirmado / Pendiente de Procesar</td>
              </tr>
            </table>
          </div>

          <div style="margin: 25px 0; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #000;">¿Necesitas modificar algo?</h3>
            <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">Si detectas cualquier error en los datos enviados o necesitas realizar un cambio, por favor <strong>responde directamente a este email</strong> y un agente te asistirá personalmente.</p>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #666;">Recibirás actualizaciones periódicas sobre el estado de tu formación ante el Secretario de Estado.</p>
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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.es",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
