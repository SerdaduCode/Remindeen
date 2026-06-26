import { browser } from '#imports'
import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

const GOOGLE_CALENDAR_URL = import.meta.env.VITE_API_GOOGLE_CALENDAR as string

type ConnectResult = { ok: true } | { ok: false; error: string }

interface CalendarStatus {
  connected: boolean
  calendarId?: string
}

export function useCalendarConnection() {
  const [status, setStatus] = useState<CalendarStatus>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Status always comes from al-quotes, never a locally remembered flag — so a
  // connection made from another device/session is reflected here too.
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<CalendarStatus>(GOOGLE_CALENDAR_URL)
      setStatus(data)
      setError(null)
    } catch {
      setError('Failed to load calendar connection status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const connect = async () => {
    setConnecting(true)
    setError(null)
    try {
      const result: ConnectResult = await browser.runtime.sendMessage({ type: 'auth:connectCalendar' })
      if (!result.ok) {
        setError(result.error)
        return
      }
      await refresh()
    } catch {
      setError('Connecting Google Calendar failed')
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    setError(null)
    try {
      await apiFetch<void>(GOOGLE_CALENDAR_URL, { method: 'DELETE' })
      setStatus({ connected: false })
    } catch {
      setError('Disconnecting Google Calendar failed')
    }
  }

  return { status, loading, connecting, error, connect, disconnect }
}
