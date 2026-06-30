export type EventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly'

const ICAL_WEEKDAY_BY_INDEX = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

export function buildEventRrule(
  recurrence: EventRecurrence,
  weekDays?: number[]
): { isRecurring: boolean; rrule: string | null } {
  if (recurrence === 'none') return { isRecurring: false, rrule: null }
  if (recurrence === 'daily') return { isRecurring: true, rrule: 'RRULE:FREQ=DAILY' }
  if (recurrence === 'monthly') return { isRecurring: true, rrule: 'RRULE:FREQ=MONTHLY' }

  if (!weekDays || weekDays.length === 0) return { isRecurring: true, rrule: 'RRULE:FREQ=WEEKLY' }
  const byDay = [...weekDays].sort((a, b) => a - b).map((day) => ICAL_WEEKDAY_BY_INDEX[day])
  return { isRecurring: true, rrule: `RRULE:FREQ=WEEKLY;BYDAY=${byDay.join(',')}` }
}
