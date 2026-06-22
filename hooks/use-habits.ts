import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { computeCurrentStreak, isCheckedInForCurrentPeriod } from '@/lib/habit-streak'
import type { TaskPriority } from '@/hooks/use-tasks'

const HABITS_URL = import.meta.env.VITE_API_HABITS as string

export type HabitFrequency = 'daily' | 'weekly'

export interface Habit {
  id: number
  userId: string
  title: string
  description: string | null
  priority: TaskPriority | null
  frequency: HabitFrequency
  createdAt: string
  updatedAt: string
}

export interface HabitCheckIn {
  id: number
  habitId: number
  periodStart: string
  completed: boolean
  completedAt: string
}

export interface HabitInput {
  title: string
  description?: string
  priority?: TaskPriority | null
  frequency: HabitFrequency
}

export function useHabits(enabled: boolean) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkInsByHabit, setCheckInsByHabit] = useState<Record<number, HabitCheckIn[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCheckIns = useCallback(async (habitList: Habit[]) => {
    const entries = await Promise.all(
      habitList.map(async (habit) => {
        const checkIns = await apiFetch<HabitCheckIn[]>(`${HABITS_URL}/${habit.id}/checkins`)
        return [habit.id, checkIns] as const
      })
    )
    setCheckInsByHabit(Object.fromEntries(entries))
  }, [])

  const refresh = useCallback(async () => {
    if (!enabled) {
      setHabits([])
      setCheckInsByHabit({})
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<Habit[]>(HABITS_URL)
      setHabits(data)
      await loadCheckIns(data)
      setError(null)
    } catch {
      setError('failed')
    } finally {
      setLoading(false)
    }
  }, [enabled, loadCheckIns])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createHabit = async (input: HabitInput) => {
    const created = await apiFetch<Habit>(HABITS_URL, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    setHabits((prev) => [...prev, created])
    setCheckInsByHabit((prev) => ({ ...prev, [created.id]: [] }))
    return created
  }

  const updateHabit = async (id: number, updates: Partial<HabitInput>) => {
    const updated = await apiFetch<Habit>(`${HABITS_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    setHabits((prev) => prev.map((habit) => (habit.id === id ? updated : habit)))
    return updated
  }

  const deleteHabit = async (id: number) => {
    await apiFetch<void>(`${HABITS_URL}/${id}`, { method: 'DELETE' })
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
    setCheckInsByHabit((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const checkIn = async (habit: Habit) => {
    const checkInRecord = await apiFetch<HabitCheckIn>(`${HABITS_URL}/${habit.id}/checkins`, {
      method: 'POST',
    })
    setCheckInsByHabit((prev) => {
      const existing = prev[habit.id] ?? []
      const alreadyHasPeriod = existing.some((entry) => entry.periodStart === checkInRecord.periodStart)
      return {
        ...prev,
        [habit.id]: alreadyHasPeriod ? existing : [checkInRecord, ...existing],
      }
    })
  }

  const streakFor = (habit: Habit) =>
    computeCurrentStreak(habit.frequency, (checkInsByHabit[habit.id] ?? []).map((c) => c.periodStart))

  const isCheckedInToday = (habit: Habit) =>
    isCheckedInForCurrentPeriod(habit.frequency, (checkInsByHabit[habit.id] ?? []).map((c) => c.periodStart))

  return {
    habits,
    loading,
    error,
    refresh,
    createHabit,
    updateHabit,
    deleteHabit,
    checkIn,
    streakFor,
    isCheckedInToday,
  }
}
