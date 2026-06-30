import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/pusher-client'
import { getStoredSession } from '@/stores/auth'

const EVENTS_URL = import.meta.env.VITE_API_EVENTS as string

export interface Event {
  id: number
  userId: string
  title: string
  description: string | null
  location: string | null
  startAt: string
  endAt: string | null
  isRecurring: boolean
  rrule: string | null
  syncToCalendar: boolean
  createdAt: string
  updatedAt: string
}

export interface EventInput {
  title: string
  description?: string | null
  location?: string | null
  startAt: string
  endAt?: string | null
  isRecurring?: boolean
  rrule?: string | null
  syncToCalendar?: boolean
}

export function useEvents(enabled: boolean) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setEvents([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<Event[]>(EVENTS_URL)
      setEvents(data)
      setError(null)
    } catch {
      setError('failed')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!enabled) return

    let active = true
    let channel: import('pusher-js').Channel | null = null
    let pusherClient: import('pusher-js').default | null = null
    let hasConnectedOnce = false

    const upsertEvent = (event: Event) =>
      setEvents((prev) =>
        prev.some((e) => e.id === event.id) ? prev.map((e) => (e.id === event.id ? event : e)) : [...prev, event]
      )
    const removeEvent = ({ id }: { id: number }) => {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
    const handleStateChange = ({ current }: { current: string }) => {
      if (current === 'connected') {
        if (hasConnectedOnce) refresh()
        hasConnectedOnce = true
      }
    }

    getStoredSession().then((session) => {
      if (!session || !active) return
      const acquired = acquirePrivateChannel(session.user.id)
      if (!active) {
        releasePrivateChannel()
        return
      }
      pusherClient = acquired.client
      channel = acquired.channel
      channel.bind('event.created', upsertEvent)
      channel.bind('event.updated', upsertEvent)
      channel.bind('event.deleted', removeEvent)
      pusherClient.connection.bind('state_change', handleStateChange)
    })

    return () => {
      active = false
      if (channel) {
        channel.unbind('event.created', upsertEvent)
        channel.unbind('event.updated', upsertEvent)
        channel.unbind('event.deleted', removeEvent)
      }
      if (pusherClient) {
        pusherClient.connection.unbind('state_change', handleStateChange)
        releasePrivateChannel()
      }
    }
  }, [enabled, refresh])

  const createEvent = async (input: EventInput) => {
    const created = await apiFetch<Event>(EVENTS_URL, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    setEvents((prev) => [...prev, created])
    return created
  }

  const updateEvent = async (id: number, updates: Partial<EventInput>) => {
    const updated = await apiFetch<Event>(`${EVENTS_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    setEvents((prev) => prev.map((event) => (event.id === id ? updated : event)))
    return updated
  }

  const deleteEvent = async (id: number) => {
    await apiFetch<void>(`${EVENTS_URL}/${id}`, { method: 'DELETE' })
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }

  return {
    events,
    loading,
    error,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
