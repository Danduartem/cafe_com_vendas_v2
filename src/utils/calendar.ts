/**
 * Calendar Utility Functions
 * Generates iCalendar (.ics) files for event downloads
 */

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

/**
 * Formats a date for iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escapes special characters for iCalendar format
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

/**
 * Generates a unique ID for the calendar event
 */
function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}@jucanamaximiliano.com.br`;
}

/**
 * Generates iCalendar (.ics) content for an event
 */
export function generateIcsContent(event: CalendarEvent): string {
  const now = new Date();
  const eventId = generateEventId();

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Café com Vendas//Event Calendar//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${eventId}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(event.startDate)}`,
    `DTEND:${formatIcsDate(event.endDate)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'CATEGORIES:BUSINESS,EDUCATION',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Café com Vendas event starts in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Downloads an .ics file with the given content
 */
export function downloadIcsFile(icsContent: string, filename = 'evento.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  URL.revokeObjectURL(url);
}

/**
 * Platform detection utilities
 */
export function detectUserPlatform(): 'ios' | 'android' | 'windows' | 'mac' | 'unknown' {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/windows/.test(userAgent)) return 'windows';
  if (/mac/.test(userAgent) && !/iphone|ipad|ipod/.test(userAgent)) return 'mac';

  return 'unknown';
}

/**
 * Calendar provider URL generators
 */
export interface CalendarUrls {
  google: string;
  outlook: string;
  ics: string; // For iPhone/Apple fallback
}

/**
 * Formats date for Google Calendar (YYYYMMDDTHHMMSSZ)
 */
function formatGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Formats date for Outlook (ISO format with timezone)
 */
function formatOutlookDate(date: Date): string {
  return date.toISOString();
}

/**
 * URL encodes text for calendar URLs
 */
function urlEncodeCalendarText(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Generates URLs for all calendar platforms
 */
export function generateCalendarUrls(event: CalendarEvent): CalendarUrls {
  const startDateGoogle = formatGoogleCalendarDate(event.startDate);
  const endDateGoogle = formatGoogleCalendarDate(event.endDate);
  const startDateOutlook = formatOutlookDate(event.startDate);
  const endDateOutlook = formatOutlookDate(event.endDate);

  const encodedTitle = urlEncodeCalendarText(event.title);
  const encodedDescription = urlEncodeCalendarText(event.description);
  const encodedLocation = urlEncodeCalendarText(event.location);

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodedTitle}` +
      `&dates=${startDateGoogle}/${endDateGoogle}` +
      `&details=${encodedDescription}` +
      `&location=${encodedLocation}` +
      `&ctz=${event.timezone || 'Europe/Lisbon'}`,

    outlook: `https://outlook.live.com/calendar/0/deeplink/compose` +
      `?subject=${encodedTitle}` +
      `&startdt=${startDateOutlook}` +
      `&enddt=${endDateOutlook}` +
      `&body=${encodedDescription}` +
      `&location=${encodedLocation}`,

    ics: generateIcsContent(event) // For iPhone/Apple devices
  };
}

/**
 * Creates the Café com Vendas event calendar entry
 */
export function createCafeComVendasEvent(): CalendarEvent {
  // September 20, 2025 - Full day event (9:00 AM - 6:00 PM Portugal time)
  const eventStart = new Date('2025-10-04T09:00:00+01:00'); // Portugal timezone (UTC+1)
  const eventEnd = new Date('2025-10-04T18:00:00+01:00');

  return {
    title: 'Café com Vendas - Edição Exclusiva Portugal',
    description: 'Experiência premium com estratégias comprovadas para liberdade empresarial. ' +
      'Grupo seleto de empreendedoras comprometidas com o crescimento inteligente. ' +
      'Inclui materiais exclusivos e suporte personalizado durante e após o evento.',
    location: 'Portugal - Local será confirmado por email',
    startDate: eventStart,
    endDate: eventEnd,
    timezone: 'Europe/Lisbon'
  };
}