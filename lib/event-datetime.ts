function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function buildIsoWithOffset(date: string, time: string): string {
  const offset = -new Date().getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const hh = pad2(Math.floor(Math.abs(offset) / 60))
  const mm = pad2(Math.abs(offset) % 60)
  return `${date}T${time}:00${sign}${hh}:${mm}`
}

// Parses startAt as a real Date instant and formats it in the viewer's local
// timezone, rather than slicing the raw string — the string's offset may not
// be the viewer's own (e.g. an MCP-created event normalized to UTC), so the
// literal digits in the string are not necessarily the correct local time.
export function parseEventDate(startAt: string): string {
  const d = new Date(startAt)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function parseEventTime(startAt: string): string {
  const d = new Date(startAt)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
