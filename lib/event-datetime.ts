export function buildIsoWithOffset(date: string, time: string): string {
  const offset = -new Date().getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
  const mm = String(Math.abs(offset) % 60).padStart(2, '0')
  return `${date}T${time}:00${sign}${hh}:${mm}`
}

export function parseEventDate(startAt: string): string {
  return startAt.slice(0, 10)
}

export function parseEventTime(startAt: string): string {
  return startAt.slice(11, 16)
}
