import type { HabitFrequency } from '@/hooks/use-habits'

// Mirrors al-quotes' lib/period.js exactly (UTC day start / ISO week start)
// so the client's idea of "current period" never drifts from the server's,
// even though no streak-computing endpoint exists yet.
function startOfDayUTC(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function startOfIsoWeekUTC(date: Date): Date {
  const d = startOfDayUTC(date)
  const day = d.getUTCDay()
  const diffToMonday = (day === 0 ? -6 : 1) - day
  d.setUTCDate(d.getUTCDate() + diffToMonday)
  return d
}

export function computePeriodStart(frequency: HabitFrequency, date: Date = new Date()): Date {
  return frequency === 'weekly' ? startOfIsoWeekUTC(date) : startOfDayUTC(date)
}

function previousPeriodStart(frequency: HabitFrequency, date: Date): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() - (frequency === 'weekly' ? 7 : 1))
  return d
}

// Walks backward from the current period, counting consecutive completed
// periods, stopping at the first gap (sparse log: a missing row means missed).
export function computeCurrentStreak(frequency: HabitFrequency, periodStarts: string[]): number {
  const completed = new Set(periodStarts.map((value) => new Date(value).getTime()))
  let cursor = computePeriodStart(frequency)
  let streak = 0
  while (completed.has(cursor.getTime())) {
    streak += 1
    cursor = previousPeriodStart(frequency, cursor)
  }
  return streak
}

export function isCheckedInForCurrentPeriod(frequency: HabitFrequency, periodStarts: string[]): boolean {
  const currentPeriod = computePeriodStart(frequency).getTime()
  return periodStarts.some((value) => new Date(value).getTime() === currentPeriod)
}
