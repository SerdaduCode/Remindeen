import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/pusher-client'
import { getStoredSession } from '@/stores/auth'

const QURAN_PROGRESS_URL = import.meta.env.VITE_API_QURAN_PROGRESS as string

const PAGES_PER_JUZ = 20
const TOTAL_JUZ = 30

export interface QuranProgress {
  id: number
  userId: string
  juzCompleted: number
  pagesInCurrentJuz: number
  updatedAt: string
}

export function useQuranProgress(enabled: boolean) {
  const [progress, setProgress] = useState<QuranProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setProgress(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<QuranProgress>(QURAN_PROGRESS_URL)
      setProgress(data)
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

    const setLatest = (data: QuranProgress) => setProgress(data)
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
      channel.bind('quranProgress.updated', setLatest)
      pusherClient.connection.bind('state_change', handleStateChange)
    })

    return () => {
      active = false
      if (channel) {
        channel.unbind('quranProgress.updated', setLatest)
      }
      if (pusherClient) {
        pusherClient.connection.unbind('state_change', handleStateChange)
        releasePrivateChannel()
      }
    }
  }, [enabled, refresh])

  const incrementPage = async () => {
    const previous = progress
    if (previous) {
      let { juzCompleted, pagesInCurrentJuz } = previous
      if (juzCompleted < TOTAL_JUZ) {
        pagesInCurrentJuz += 1
        if (pagesInCurrentJuz >= PAGES_PER_JUZ) {
          pagesInCurrentJuz = 0
          juzCompleted += 1
        }
      }
      setProgress({ ...previous, juzCompleted, pagesInCurrentJuz })
    }

    try {
      const updated = await apiFetch<QuranProgress>(`${QURAN_PROGRESS_URL}/increment-page`, { method: 'POST' })
      setProgress(updated)
      return updated
    } catch (err) {
      setProgress(previous)
      throw err
    }
  }

  return { progress, loading, error, incrementPage }
}
