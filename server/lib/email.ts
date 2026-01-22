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

export function getWelcomeEmailTemplate(name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #333;">¡Bienvenido a Easy US LLC, ${name}!</h2>
      <p>Estamos encantados de acompañarte en la creación de tu empresa en Estados Unidos.</p>
      <p>Nuestro equipo ya está revisando tu solicitud y nos pondremos en contacto contigo muy pronto para los siguientes pasos.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">¿Qué sigue ahora?</h3>
        <ol>
          <li>Revisión de tu información básica.</li>
          <li>Verificación de identidad (DNI o Pasaporte).</li>
          <li>Inicio del proceso de constitución oficial.</li>
        </ol>
      </div>
      <p>Si tienes alguna duda inmediata, puedes escribirnos por WhatsApp.</p>
      <p style="color: #888; font-size: 12px; margin-top: 30px;">
        Este es un mensaje automático de Easy US LLC.
      </p>
    </div>
  `;
}
