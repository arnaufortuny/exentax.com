import { google } from 'googleapis';
import { createLogger } from './logger';
import { ORG_EMAILS } from './config';

const log = createLogger('google-calendar');

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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function createGoogleMeetEvent({
  summary,
  description,
  startDateTime,
  endDateTime,
  attendeeEmail,
}: {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail: string;
}): Promise<{ meetLink: string; eventId: string; htmlLink: string } | null> {
  try {
    const calendar = await getUncachableGoogleCalendarClient();

    const requestId = `exentax-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: 'Europe/Madrid',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Europe/Madrid',
        },
        attendees: [
          { email: attendeeEmail },
          ...ORG_EMAILS.filter(e => e !== attendeeEmail).map(email => ({ email })),
        ],
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      },
    });

    const meetLink = event.data.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri;

    const eventId = event.data.id || '';
    const htmlLink = event.data.htmlLink || '';

    if (meetLink) {
      log.info(`Google Meet event created: ${eventId}, meetLink: ${meetLink}`);
      return { meetLink, eventId, htmlLink };
    }

    log.warn('Google Calendar event created but no Meet link found', { eventId });
    return null;
  } catch (error: any) {
    log.error('Failed to create Google Meet event', error, { summary, attendeeEmail });
    return null;
  }
}
