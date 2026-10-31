import type {EventSummary} from '../sanity/lib/queries'

/** Escape text for an iCalendar property value (RFC 5545 §3.3.11). */
const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** Lines longer than 75 characters continue on the next line after a space (RFC 5545 §3.1). */
const fold = (line: string) => line.match(/.{1,74}/g)!.join('\r\n ')

/** "2026-11-14" -> "20261114" */
const icsDate = (date: string) => date.replace(/-/g, '')

/** All-day events end on the day *after* the last day (DTEND is exclusive). */
function dayAfter(date: string): string {
  const next = new Date(`${date}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
}

/**
 * A data: URL for a one-event .ics file. Events only store dates, not times,
 * so the calendar entry is all-day.
 */
export function calendarFileUrl(event: EventSummary, pageUrl: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Doctors Health Aotearoa//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.slug}@doctorshealth.co.nz`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(event.startDate)}`,
    `DTEND;VALUE=DATE:${icsDate(dayAfter(event.endDate ?? event.startDate))}`,
    `SUMMARY:${escape(event.title)}`,
    event.location && `LOCATION:${escape(event.location)}`,
    `URL:${event.link ?? pageUrl}`,
    `DESCRIPTION:${escape([event.shortDescription, `More information: ${pageUrl}`].filter(Boolean).join('\n\n'))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((line): line is string => Boolean(line))
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.map(fold).join('\r\n'))}`
}
