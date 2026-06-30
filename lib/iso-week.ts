import { startOfIsoWeekUTC } from '@/lib/habit-streak'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function getCurrentWeekStart(): Date {
  return startOfIsoWeekUTC(new Date())
}

export function addWeeks(weekStart: Date, delta: number): Date {
  const d = new Date(weekStart)
  d.setUTCDate(d.getUTCDate() + delta * 7)
  return d
}

export function getIsoWeekNumber(weekStart: Date): number {
  // weekStart is already the Monday of its ISO week (UTC), so the ISO week
  // number of that Monday is the week number for the whole period.
  const target = new Date(weekStart)
  target.setUTCDate(target.getUTCDate() + 3) // Thursday of the same ISO week
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  firstThursday.setUTCDate(firstThursday.getUTCDate() + 3 - ((firstThursday.getUTCDay() + 6) % 7))
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY))
}

export function getIsoWeekYear(weekStart: Date): number {
  // The ISO week-year is the year of the Thursday within that week.
  const thursday = new Date(weekStart)
  thursday.setUTCDate(thursday.getUTCDate() + 3)
  return thursday.getUTCFullYear()
}

export function isCurrentWeek(weekStart: Date): boolean {
  return weekStart.getTime() === getCurrentWeekStart().getTime()
}

export function formatWeekRange(weekStart: Date, locale?: string): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startLabel = weekStart.toLocaleDateString(locale, options)
  const endLabel = weekEnd.toLocaleDateString(locale, options)
  return `${startLabel} – ${endLabel}`
}
