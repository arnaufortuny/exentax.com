import { google } from 'googleapis';
import { createLogger } from './logger';

const log = createLogger('gmail');

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

export async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function buildMimeMessage({
  from,
  to,
  subject,
  html,
  replyTo,
  bcc,
  attachments,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  bcc?: string;
  attachments?: Array<{ filename: string; content: Buffer; cid: string }>;
}): string {
  let headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `MIME-Version: 1.0`,
  ];

  if (replyTo) {
    headers.push(`Reply-To: ${replyTo}`);
  }
  if (bcc) {
    headers.push(`Bcc: ${bcc}`);
  }

  if (attachments && attachments.length > 0) {
    const relatedBoundary = `related_${Date.now()}`;
    headers.push(`Content-Type: multipart/related; boundary="${relatedBoundary}"`);

    let body = headers.join('\r\n') + '\r\n\r\n';

    body += `--${relatedBoundary}\r\n`;
    body += `Content-Type: text/html; charset="UTF-8"\r\n`;
    body += `Content-Transfer-Encoding: base64\r\n\r\n`;
    body += Buffer.from(html).toString('base64') + '\r\n';

    for (const att of attachments) {
      body += `--${relatedBoundary}\r\n`;
      body += `Content-Type: image/png; name="${att.filename}"\r\n`;
      body += `Content-Transfer-Encoding: base64\r\n`;
      body += `Content-ID: <${att.cid}>\r\n`;
      body += `Content-Disposition: inline; filename="${att.filename}"\r\n\r\n`;
      body += att.content.toString('base64') + '\r\n';
    }

    body += `--${relatedBoundary}--`;
    return body;
  } else {
    headers.push(`Content-Type: text/html; charset="UTF-8"`);
    headers.push(`Content-Transfer-Encoding: base64`);

    let body = headers.join('\r\n') + '\r\n\r\n';
    body += Buffer.from(html).toString('base64');
    return body;
  }
}

export async function sendGmailMessage({
  to,
  subject,
  html,
  replyTo,
  bcc,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  bcc?: string;
  attachments?: Array<{ filename: string; content: Buffer; cid: string }>;
}): Promise<{ id: string } | null> {
  try {
    const gmail = await getUncachableGmailClient();

    const profile = await gmail.users.getProfile({ userId: 'me' });
    const senderEmail = profile.data.emailAddress;
    const from = `"Exentax" <${senderEmail}>`;

    const rawMessage = buildMimeMessage({
      from,
      to,
      subject,
      html,
      replyTo,
      bcc,
      attachments,
    });

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    log.info(`Email sent via Gmail to ${to}, messageId: ${result.data.id}`);
    return { id: result.data.id || '' };
  } catch (error: any) {
    log.error('Failed to send email via Gmail', error, { to, subject });
    throw error;
  }
}

export async function isGmailConfigured(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch {
    return false;
  }
}
