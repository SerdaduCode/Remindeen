import { useCallback, useEffect, useState } from 'react'
import { storage } from '#imports'
import { apiFetch } from '@/lib/api'
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/pusher-client'
import { getStoredSession } from '@/stores/auth'

const PRAYER_CHECKINS_URL = import.meta.env.VITE_API_PRAYER_CHECKINS as string

export type Prayer = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export interface PrayerCheckIn {
  id: number
  userId: string
  date: string
  prayer: Prayer
  scheduledTime: string
  actualTime: string | null
  createdAt: string
  updatedAt: string
}

type PrayerSchedule = Record<Prayer, string>

// Same key Prayers.tsx and entrypoints/background.ts read/write — this hook
// only consumes it, never fetches or writes the schedule itself.
const prayerTimesStorage = storage.defineItem<{ times: PrayerSchedule & { Imsak: string }; date: string } | null>(
  'local:prayerTimes',
  { fallback: null }
)

const todayDateString = () => new Date().toISOString().split('T')[0]

export function usePrayerCheckins(enabled: boolean) {
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null)
  const [checkIns, setCheckIns] = useState<PrayerCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let active = true

    const applyStored = (stored: { times: PrayerSchedule & { Imsak: string } } | null) => {
      if (!active || !stored) return
      const { Imsak: _imsak, ...rest } = stored.times
      setSchedule(rest)
    }

    prayerTimesStorage.getValue().then(applyStored)
    const unwatch = prayerTimesStorage.watch(applyStored)
    return () => {
      active = false
      unwatch()
    }
  }, [enabled])

  const refresh = useCallback(async () => {
    if (!enabled || !schedule) {
      if (!enabled) setCheckIns([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({ date: todayDateString(), ...schedule })
      const data = await apiFetch<PrayerCheckIn[]>(`${PRAYER_CHECKINS_URL}?${params.toString()}`)
      setCheckIns(data)
      setError(null)
    } catch {
      setError('failed')
    } finally {
      setLoading(false)
    }
  }, [enabled, schedule])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!enabled) return

    let active = true
    let channel: import('pusher-js').Channel | null = null
    let pusherClient: import('pusher-js').default | null = null
    let hasConnectedOnce = false

    const upsert = (checkIn: PrayerCheckIn) =>
      setCheckIns((prev) =>
        prev.some((c) => c.id === checkIn.id) ? prev.map((c) => (c.id === checkIn.id ? checkIn : c)) : [...prev, checkIn]
      )
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
      channel.bind('prayerCheckIn.updated', upsert)
      pusherClient.connection.bind('state_change', handleStateChange)
    })

    return () => {
      active = false
      if (channel) {
        channel.unbind('prayerCheckIn.updated', upsert)
      }
      if (pusherClient) {
        pusherClient.connection.unbind('state_change', handleStateChange)
        releasePrivateChannel()
      }
    }
  }, [enabled, refresh])

  const toggle = async (prayer: Prayer) => {
    const previousActualTime = checkIns.find((c) => c.prayer === prayer)?.actualTime ?? null
    const done = !previousActualTime
    const optimisticActualTime = done ? new Date().toISOString() : null

    setCheckIns((prev) =>
      prev.map((c) => (c.prayer === prayer ? { ...c, actualTime: optimisticActualTime } : c))
    )

    try {
      const updated = await apiFetch<PrayerCheckIn>(`${PRAYER_CHECKINS_URL}/${prayer}`, {
        method: 'PATCH',
        body: JSON.stringify({ date: todayDateString(), done }),
      })
      setCheckIns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      return updated
    } catch (err) {
      setCheckIns((prev) =>
        prev.map((c) => (c.prayer === prayer ? { ...c, actualTime: previousActualTime } : c))
      )
      throw err
    }
  }

  return { checkIns, loading, error, toggle }
}
