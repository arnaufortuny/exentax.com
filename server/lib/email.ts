import nodemailer from "nodemailer";

export function getEmailHeader() {
  return `
    <div style="background-color: #000; padding: 40px 20px; text-align: center; border-bottom: 6px solid #b6ff40;">
      <h1 style="color: #b6ff40; margin: 0; font-family: 'Inter', Arial, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: -1.5px; font-size: 36px; line-height: 1;">
        Easy US <span style="color: #fff;">LLC</span>
      </h1>
      <p style="color: #fff; margin: 10px 0 0 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8;">Premium Business Formation</p>
    </div>
  `;
}

export function getEmailFooter() {
  const year = new Date().getFullYear();
  return `
    <div style="background-color: #000; padding: 40px 20px; text-align: center; color: #fff; font-family: 'Inter', Arial, sans-serif; border-top: 1px solid #333;">
      <p style="margin: 0 0 15px 0; font-weight: 900; color: #b6ff40; text-transform: uppercase; font-size: 14px; letter-spacing: 2px;">Expertos en formación de LLC</p>
      <p style="margin: 0; font-size: 14px; color: #999; font-weight: 500;">New Mexico, USA | <a href="mailto:info@easyusllc.com" style="color: #b6ff40; text-decoration: none;">info@easyusllc.com</a></p>
      <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #222;">
        <a href="https://wa.me/34614916910" style="background-color: #b6ff40; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 12px; text-transform: uppercase; margin: 0 5px; display: inline-block;">WhatsApp</a>
        <a href="https://easyusllc.com" style="border: 2px solid #b6ff40; color: #b6ff40; padding: 8px 20px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 12px; text-transform: uppercase; margin: 0 5px; display: inline-block;">Visitar Web</a>
      </div>
      <p style="margin-top: 30px; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px;">© ${year} Easy US LLC. Todos los derechos reservados.</p>
    </div>
  `;
}

export function getOtpEmailTemplate(otp: string) {
  return `
    <div style="background-color: #f4f4f4; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 20px; overflow: hidden; color: #1a1a1a; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background-color: #ffffff;">
        ${getEmailHeader()}
        <div style="padding: 50px 40px; text-align: center;">
          <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 25px; text-transform: uppercase; letter-spacing: -0.5px; color: #000;">Verifica tu identidad</h2>
          <p style="line-height: 1.8; font-size: 16px; color: #555; margin-bottom: 30px;">Has iniciado el proceso de formación de tu LLC. Para continuar de forma segura, introduce el siguiente código:</p>
          
          <div style="background: #000; padding: 40px; border-radius: 24px; margin: 30px 0; text-align: center; border: 4px solid #b6ff40;">
            <p style="margin: 0 0 15px 0; font-weight: 900; color: #b6ff40; text-transform: uppercase; font-size: 12px; letter-spacing: 3px;">Tu código de seguridad</p>
            <p style="margin: 0; font-size: 52px; font-weight: 900; color: #fff; letter-spacing: 12px;">${otp}</p>
          </div>

          <p style="line-height: 1.6; font-size: 14px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Expira en 10 minutos</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getWelcomeEmailTemplate(name: string) {
  return `
    <div style="background-color: #f4f4f4; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 20px; overflow: hidden; color: #1a1a1a; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background-color: #ffffff;">
        ${getEmailHeader()}
        <div style="padding: 50px 40px;">
          <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 25px; text-transform: uppercase; letter-spacing: -0.5px; color: #000; text-align: center;">¡Bienvenido, ${name}!</h2>
          <p style="line-height: 1.8; font-size: 17px; color: #444;">Es un placer saludarte. En <strong>Easy US LLC</strong> nos especializamos en hacer que tu entrada al mercado de Estados Unidos sea rápida y sin complicaciones.</p>
          
          <div style="background: #b6ff40; padding: 35px; border-radius: 24px; margin: 35px 0; text-align: center; box-shadow: 0 8px 20px rgba(182, 255, 64, 0.25);">
            <p style="margin: 0; font-size: 20px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: -0.5px;">Tu futuro en USA comienza ahora.</p>
          </div>

          <p style="line-height: 1.8; font-size: 16px; color: #555;">Nuestro equipo ya ha sido notificado y comenzaremos a trabajar en tu estructura de inmediato. Te mantendremos informado de cada hito alcanzado.</p>
          
          <div style="margin-top: 40px; padding: 30px; border-radius: 20px; background-color: #f9f9f9; border: 1px solid #eee;">
            <p style="margin: 0; font-size: 14px; color: #666; font-weight: 600;">¿Tienes alguna duda urgente? Responde a este email o escríbenos directamente a nuestro WhatsApp de soporte prioritario.</p>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getConfirmationEmailTemplate(name: string, requestCode: string) {
  return `
    <div style="background-color: #f4f4f4; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 20px; overflow: hidden; color: #1a1a1a; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background-color: #ffffff;">
        ${getEmailHeader()}
        <div style="padding: 50px 40px;">
          <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 25px; text-transform: uppercase; letter-spacing: -0.5px; color: #000; text-align: center;">Solicitud Confirmada</h2>
          <p style="line-height: 1.8; font-size: 17px; color: #444; text-align: center;">Hola <strong>${name}</strong>, hemos recibido correctamente tu formulario de aplicación.</p>
          
          <div style="background: #000; padding: 35px; border-radius: 24px; margin: 35px 0; text-align: center; border-left: 8px solid #b6ff40;">
            <p style="margin: 0 0 10px 0; font-weight: 900; color: #b6ff40; text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Referencia de Solicitud:</p>
            <p style="margin: 0; font-size: 32px; font-weight: 900; color: #fff; letter-spacing: 1px;">${requestCode}</p>
          </div>

          <p style="line-height: 1.8; font-size: 16px; color: #555;">Estamos procesando tu registro oficial ante el Secretario de Estado. Recibirás tus documentos constitutivos firmados en un plazo de <strong>2-3 días hábiles</strong>.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getNewsletterWelcomeTemplate() {
  return `
    <div style="background-color: #f4f4f4; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 20px; overflow: hidden; color: #1a1a1a; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background-color: #ffffff;">
        ${getEmailHeader()}
        <div style="padding: 50px 40px;">
          <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 25px; text-transform: uppercase; letter-spacing: -0.5px; color: #000; text-align: center;">¡Bienvenido a la comunidad!</h2>
          <p style="line-height: 1.8; font-size: 17px; color: #444; text-align: center; margin-bottom: 35px;">Ya eres parte de la red de emprendedores de <strong>Easy US LLC</strong>.</p>
          
          <div style="background: #f9f9f9; padding: 35px; border-radius: 24px; margin: 20px 0; border: 1px solid #eee;">
            <p style="margin: 0 0 20px 0; font-weight: 900; color: #000; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Contenido exclusivo que recibirás:</p>
            <ul style="margin: 0; padding-left: 0; list-style: none;">
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative; font-size: 15px; color: #555; line-height: 1.6;">
                <span style="position: absolute; left: 0; color: #b6ff40; font-weight: 900;">✓</span> Optimización fiscal para no-residentes.
              </li>
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative; font-size: 15px; color: #555; line-height: 1.6;">
                <span style="position: absolute; left: 0; color: #b6ff40; font-weight: 900;">✓</span> Secretos de banca en Mercury y Relay.
              </li>
              <li style="margin-bottom: 15px; padding-left: 30px; position: relative; font-size: 15px; color: #555; line-height: 1.6;">
                <span style="position: absolute; left: 0; color: #b6ff40; font-weight: 900;">✓</span> Alertas de cumplimiento legal y BOI.
              </li>
            </ul>
          </div>

          <p style="line-height: 1.8; font-size: 16px; color: #555; text-align: center; margin-top: 30px;">Estamos aquí para ayudarte a escalar tu negocio a nivel global.</p>
        </div>
        ${getEmailFooter()}
      </div>
    </div>
  `;
}

export function getReminderEmailTemplate(name: string, requestCode: string) {
  return `
    <div style="background-color: #f4f4f4; padding: 20px 0;">
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 20px; overflow: hidden; color: #1a1a1a; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background-color: #ffffff;">
        ${getEmailHeader()}
        <div style="padding: 50px 40px;">
          <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 25px; text-transform: uppercase; letter-spacing: -0.5px; color: #000; text-align: center;">Termina tu registro</h2>
          <p style="line-height: 1.8; font-size: 17px; color: #444;">Hola <strong>${name}</strong>, hemos notado que tu solicitud para una nueva LLC aún no está completa.</p>
          
          <div style="background: #f1f5f9; padding: 35px; border-radius: 24px; margin: 35px 0; border: 2px dashed #cbd5e1; text-align: center;">
            <p style="margin: 0 0 10px 0; font-weight: 900; color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Solicitud pendiente:</p>
            <p style="margin: 0; font-size: 28px; font-weight: 900; color: #000;">${requestCode}</p>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="https://easyusllc.com/seguimiento" style="background-color: #b6ff40; color: #000; padding: 20px 45px; text-decoration: none; border-radius: 60px; font-weight: 900; display: inline-block; text-transform: uppercase; font-size: 15px; letter-spacing: 1px; box-shadow: 0 10px 25px rgba(182, 255, 64, 0.4);">Continuar Solicitud →</a>
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
