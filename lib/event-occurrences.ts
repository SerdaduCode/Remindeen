import { rrulestr } from 'rrule'
import type { Event } from '@/hooks/use-events'

export interface EventOccurrence {
  event: Event
  startAt: Date
  endAt: Date | null
}

function toUtcWallClock(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()))
}

function fromUtcWallClock(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes())
}

// rrule.js derives BYDAY from a Date's UTC day-of-week, not its local one, so dtstart and
// the range bounds are encoded as UTC-wall-clock equivalents of local time (not the real
// instant) to keep recurrence math anchored to the user's local calendar days.
export function getEventOccurrences(event: Event, rangeStart: Date, rangeEnd: Date): EventOccurrence[] {
  const literalStartAt = new Date(event.startAt)
  const literalEndAt = event.endAt ? new Date(event.endAt) : null
  const durationMs = literalEndAt ? literalEndAt.getTime() - literalStartAt.getTime() : null

  if (!event.isRecurring || !event.rrule) {
    return literalStartAt >= rangeStart && literalStartAt < rangeEnd
      ? [{ event, startAt: literalStartAt, endAt: literalEndAt }]
      : []
  }

  try {
    const rule = rrulestr(event.rrule, { dtstart: toUtcWallClock(literalStartAt) })
    const occurrences = rule.between(toUtcWallClock(rangeStart), toUtcWallClock(rangeEnd), true)
    return occurrences.map((date) => {
      const startAt = fromUtcWallClock(date)
      const endAt = durationMs !== null ? new Date(startAt.getTime() + durationMs) : null
      return { event, startAt, endAt }
    })
  } catch (error: unknown) {
    console.error(`Failed to parse rrule for event ${event.id}:`, error)
    return []
  }
}
