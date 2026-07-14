import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/pusher-client'
import { getStoredSession } from '@/stores/auth'

const BRAIN_DUMP_URL = import.meta.env.VITE_API_BRAIN_DUMP as string

export type BrainDumpTheme = 'ide' | 'kerja' | 'pribadi' | 'dakwah'

export interface BrainDumpNote {
  id: number
  userId: string
  theme: BrainDumpTheme
  body: string
  createdAt: string
}

export interface BrainDumpNoteInput {
  theme: BrainDumpTheme
  body: string
}

export function useBrainDump(enabled: boolean) {
  const [notes, setNotes] = useState<BrainDumpNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setNotes([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<BrainDumpNote[]>(BRAIN_DUMP_URL)
      setNotes(data)
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

    const upsert = (note: BrainDumpNote) =>
      setNotes((prev) =>
        prev.some((n) => n.id === note.id) ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev]
      )
    const remove = ({ id }: { id: number }) => setNotes((prev) => prev.filter((n) => n.id !== id))
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
      channel.bind('brainDump.created', upsert)
      channel.bind('brainDump.deleted', remove)
      pusherClient.connection.bind('state_change', handleStateChange)
    })

    return () => {
      active = false
      if (channel) {
        channel.unbind('brainDump.created', upsert)
        channel.unbind('brainDump.deleted', remove)
      }
      if (pusherClient) {
        pusherClient.connection.unbind('state_change', handleStateChange)
        releasePrivateChannel()
      }
    }
  }, [enabled, refresh])

  const createNote = async (input: BrainDumpNoteInput) => {
    const created = await apiFetch<BrainDumpNote>(BRAIN_DUMP_URL, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    setNotes((prev) => [created, ...prev])
    return created
  }

  const deleteNote = async (id: number) => {
    await apiFetch<void>(`${BRAIN_DUMP_URL}/${id}`, { method: 'DELETE' })
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  return { notes, loading, error, refresh, createNote, deleteNote }
}
