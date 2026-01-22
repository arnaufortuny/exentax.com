import nodemailer from "nodemailer";

// Configuración de transporte
// Nota: El usuario deberá configurar las variables de entorno SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.es",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"Easy US LLC" <${process.env.SMTP_USER || "info@easyusallc.com"}>`,
      to,
      subject,
      html,
    });
    console.log("Email enviado: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
}

export function getOtpEmailTemplate(otp: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #333;">Verifica tu email - Easy US LLC</h2>
      <p>Tu código de verificación de un solo uso (OTP) es:</p>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #b6ff40;">${otp}</h1>
      </div>
      <p>Este código caducará en 10 minutos.</p>
      <p style="color: #888; font-size: 12px; margin-top: 30px;">
        Si no has solicitado este código, puedes ignorar este email.
      </p>
    </div>
  `;
}

export function getWelcomeEmailTemplate(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #b6ff40; margin: 0; font-size: 28px; text-transform: uppercase;">Easy US LLC</h1>
        <p style="color: #666; font-size: 14px;">Bienvenido a la Libertad Empresarial</p>
      </div>
      
      <h2 style="font-size: 20px; margin-bottom: 20px;">¡Hola ${name}!</h2>
      <p style="line-height: 1.6;">Estamos encantados de acompañarte en la creación de tu empresa en Estados Unidos. Has dado el primer paso hacia una estructura fiscal eficiente y acceso al sistema bancario global.</p>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee;">
        <h3 style="margin-top: 0; font-size: 16px;">¿Qué sigue ahora?</h3>
        <ol style="line-height: 1.8;">
          <li>Completa tu formulario de solicitud con los datos de tu futura LLC.</li>
          <li>Nuestro equipo revisará la disponibilidad del nombre.</li>
          <li>Iniciaremos el registro oficial ante el Estado (2 días hábiles).</li>
        </ol>
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://easyusllc.com/application" style="background-color: #b6ff40; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Completar mi Solicitud Ahora</a>
      </div>

      <p style="margin-top: 40px; font-size: 14px; text-align: center; color: #666;">
        Si tienes cualquier duda inmediata, nuestro equipo de soporte está disponible vía WhatsApp.
      </p>
    </div>
  `;
}

export function getConfirmationEmailTemplate(name: string, requestCode: string, details: any) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #b6ff40; margin: 0; font-size: 28px; text-transform: uppercase;">Easy US LLC</h1>
        <p style="color: #666; font-size: 14px;">Confirmación de Solicitud</p>
      </div>
      
      <h2 style="font-size: 20px; margin-bottom: 20px;">¡Hola ${name}!</h2>
      <p style="line-height: 1.6;">Hemos recibido correctamente toda la información para la constitución de tu nueva LLC. Nuestro equipo de expertos comenzará la revisión técnica de inmediato.</p>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #666; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Número de Solicitud</p>
        <p style="margin: 0; font-size: 24px; font-weight: 900; color: #1a1a1a;">${requestCode}</p>
      </div>

      <h3 style="font-size: 16px; border-bottom: 2px solid #b6ff40; padding-bottom: 8px; margin-top: 30px;">Detalles de la Solicitud:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">Empresa (Opción 1):</td>
          <td style="padding: 8px 0; font-weight: bold;">${details.companyName} ${details.designator}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Estado de formación:</td>
          <td style="padding: 8px 0; font-weight: bold;">${details.state}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Categoría:</td>
          <td style="padding: 8px 0; font-weight: bold;">${details.businessCategory}</td>
        </tr>
      </table>

      <div style="margin-top: 40px; padding: 20px; background: #1a1a1a; color: #fff; border-radius: 12px;">
        <h4 style="margin: 0 0 10px 0; color: #b6ff40;">¿Qué sucede ahora?</h4>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.6; font-size: 14px;">
          <li>Revisaremos que los nombres elegidos estén disponibles.</li>
          <li>Prepararemos los Articles of Organization para su presentación.</li>
          <li>Te contactaremos si necesitamos alguna aclaración adicional.</li>
        </ul>
      </div>

      <p style="margin-top: 30px; font-size: 14px; text-align: center; color: #666;">
        Si tienes cualquier duda, recuerda que tienes soporte prioritario vía WhatsApp.
      </p>
    </div>
  `;
}

export function getReminderEmailTemplate(name: string, requestCode: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #b6ff40; margin: 0; font-size: 28px; text-transform: uppercase;">Easy US LLC</h1>
        <p style="color: #666; font-size: 14px;">Recordatorio de Solicitud</p>
      </div>
      
      <h2 style="font-size: 20px; margin-bottom: 20px;">¡Hola ${name}!</h2>
      <p style="line-height: 1.6;">Hemos notado que no has completado tu solicitud para la constitución de tu nueva LLC.</p>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #666; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Tu Número de Solicitud es:</p>
        <p style="margin: 0; font-size: 24px; font-weight: 900; color: #1a1a1a;">${requestCode}</p>
      </div>

      <p style="line-height: 1.6;">Tu proceso está a mitad de camino. Solo te faltan unos pocos pasos para tener tu empresa lista en Estados Unidos.</p>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://easyusllc.com/seguimiento" style="background-color: #b6ff40; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Continuar mi Solicitud</a>
      </div>

      <p style="margin-top: 40px; font-size: 14px; text-align: center; color: #666;">
        Si tienes cualquier duda o problema técnico, escríbenos por WhatsApp y te ayudaremos de inmediato.
      </p>
    </div>
  `;
}
