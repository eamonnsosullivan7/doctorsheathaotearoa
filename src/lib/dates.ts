const formatter = new Intl.DateTimeFormat('en-NZ', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'})

/** Sanity `date` fields are plain YYYY-MM-DD strings; format them without timezone drift. */
export function formatDate(date: string): string {
  return formatter.format(new Date(`${date}T00:00:00Z`))
}

export function formatDateRange(start: string, end?: string): string {
  if (!end || end === start) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}

/** True once the event's last day is over (in New Zealand). Evaluated at build time. */
export function isPast(start: string, end?: string): boolean {
  const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Pacific/Auckland'}).format(new Date())
  return (end ?? start) < today
}
