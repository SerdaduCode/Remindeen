import type { HabitFrequency } from '@/hooks/use-habits'

// Weekly periods still align to UTC ISO week start (the weekly boundary fix
// is out of scope, see al-quotes' fix-habit-checkin-timezone design doc).
// Daily periods use the user's local calendar date so check-ins are
// available immediately after local midnight, matching the server.
function startOfDayUTC(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export function startOfIsoWeekUTC(date: Date): Date {
  const d = startOfDayUTC(date)
  const day = d.getUTCDay()
  const diffToMonday = (day === 0 ? -6 : 1) - day
  d.setUTCDate(d.getUTCDate() + diffToMonday)
  return d
}

function addDaysToDateString(dateString: string, days: number): string {
  const d = new Date(`${dateString}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function currentPeriodKey(frequency: HabitFrequency): string {
  return frequency === 'weekly'
    ? startOfIsoWeekUTC(new Date()).toISOString().slice(0, 10)
    : new Date().toLocaleDateString('en-CA')
}

function previousPeriodKey(frequency: HabitFrequency, key: string): string {
  return addDaysToDateString(key, frequency === 'weekly' ? -7 : -1)
}

export function computePeriodStart(frequency: HabitFrequency, date: Date = new Date()): Date {
  return frequency === 'weekly' ? startOfIsoWeekUTC(date) : startOfDayUTC(date)
}

// Walks backward from the current period, counting consecutive completed
// periods, stopping at the first gap (sparse log: a missing row means missed).
export function computeCurrentStreak(frequency: HabitFrequency, periodStarts: string[]): number {
  const completed = new Set(periodStarts.map((value) => value.slice(0, 10)))
  let cursor = currentPeriodKey(frequency)
  let streak = 0
  while (completed.has(cursor)) {
    streak += 1
    cursor = previousPeriodKey(frequency, cursor)
  }
  return streak
}

export function isCheckedInForCurrentPeriod(frequency: HabitFrequency, periodStarts: string[]): boolean {
  const currentPeriod = currentPeriodKey(frequency)
  return periodStarts.some((value) => value.slice(0, 10) === currentPeriod)
}
