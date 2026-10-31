import type {EventSummary} from '../sanity/lib/queries'
import {isPast} from './dates'

/**
 * Split events (as returned by getEvents, newest first) into upcoming events,
 * soonest first, and past events, most recent first. Evaluated at build time.
 */
export function splitEvents<T extends EventSummary>(events: T[]): {upcoming: T[]; past: T[]} {
  const upcoming = events.filter((event) => !isPast(event.startDate, event.endDate)).reverse()
  const past = events.filter((event) => isPast(event.startDate, event.endDate))
  return {upcoming, past}
}
