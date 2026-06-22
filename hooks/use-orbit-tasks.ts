import { storage } from '#imports'
import { useEffect, useState } from 'react'
import { findOrbitSlot, liveSlotInputs } from '@/components/remindeen/orbit/orbit-layout'
import { priorityRadiusBounds, type CanvasMetrics } from '@/components/remindeen/orbit/orbit-physics'
import { DEFAULT_CATEGORY_ID } from '@/hooks/use-orbit-categories'

export interface OrbitTask {
  id: string
  title: string
  note?: string
  color: string
  radius: number
  angle: number
  angleSetAt: number
  isFocus: boolean
  isPriority: boolean
  categoryId: string
  createdAt: number
}

export const DEFAULT_TASK_RADIUS = 180
export const DEFAULT_FOCUS_RELEASE_RADIUS = 140

const orbitTasksStorage = storage.defineItem<OrbitTask[]>('local:orbitTasks', {
  fallback: [],
})

// Tasks persisted before priority/categories existed are missing these fields.
function normalizeTask(task: OrbitTask): OrbitTask {
  return {
    ...task,
    isPriority: task.isPriority ?? false,
    categoryId: task.categoryId ?? DEFAULT_CATEGORY_ID,
  }
}

export function useOrbitTasks() {
  const [tasks, setTasks] = useState<OrbitTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orbitTasksStorage.getValue().then((value) => {
      setTasks(value.map(normalizeTask))
      setLoading(false)
    })

    const unwatch = orbitTasksStorage.watch((newVal) => {
      setTasks((newVal || []).map(normalizeTask))
    })

    return unwatch
  }, [])

  const persist = async (next: OrbitTask[]) => {
    setTasks(next)
    await orbitTasksStorage.setValue(next)
  }

  const createTask = async (
    input: { title: string; note?: string; color: string; categoryId?: string },
    metrics: CanvasMetrics
  ) => {
    const now = Date.now()
    const siblings = liveSlotInputs(tasks.filter((task) => !task.isFocus), now)
    const slot = findOrbitSlot(
      DEFAULT_TASK_RADIUS,
      Math.random() * Math.PI * 2,
      siblings,
      priorityRadiusBounds(false, metrics.ringRadius, metrics.maxRadius)
    )
    const newTask: OrbitTask = {
      id: crypto.randomUUID(),
      title: input.title,
      note: input.note,
      color: input.color,
      radius: slot.radius,
      angle: slot.angle,
      angleSetAt: now,
      isFocus: false,
      isPriority: false,
      categoryId: input.categoryId ?? DEFAULT_CATEGORY_ID,
      createdAt: now,
    }
    await persist([...tasks, newTask])
    return newTask
  }

  const updateTask = async (
    id: string,
    updates: Partial<Pick<OrbitTask, 'title' | 'note' | 'color' | 'categoryId'>>
  ) => {
    await persist(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteTask = async (id: string) => {
    await persist(tasks.filter((task) => task.id !== id))
  }

  const completeTask = async (id: string) => {
    await persist(tasks.filter((task) => task.id !== id))
  }

  const setFocus = async (id: string | null, metrics: CanvasMetrics) => {
    const now = Date.now()
    const siblings = liveSlotInputs(
      tasks.filter((task) => !task.isFocus && task.id !== id),
      now
    )
    await persist(
      tasks.map((task) => {
        if (task.id === id) {
          return { ...task, isFocus: true, radius: 0, angleSetAt: now }
        }
        if (task.isFocus) {
          const desiredRadius = task.isPriority ? DEFAULT_FOCUS_RELEASE_RADIUS : DEFAULT_TASK_RADIUS
          const slot = findOrbitSlot(
            desiredRadius,
            task.angle,
            siblings,
            priorityRadiusBounds(task.isPriority, metrics.ringRadius, metrics.maxRadius)
          )
          return {
            ...task,
            isFocus: false,
            radius: slot.radius,
            angle: slot.angle,
            angleSetAt: now,
          }
        }
        return task
      })
    )
  }

  // Toggling priority on a focused task only flips the flag — its band slot
  // is resolved later, when it's released from focus (see setFocus above).
  const setPriority = async (id: string, isPriority: boolean, metrics: CanvasMetrics) => {
    const now = Date.now()
    const target = tasks.find((task) => task.id === id)
    if (!target || target.isFocus) {
      await persist(tasks.map((task) => (task.id === id ? { ...task, isPriority } : task)))
      return
    }

    const siblings = liveSlotInputs(
      tasks.filter((task) => !task.isFocus && task.id !== id),
      now
    )
    const slot = findOrbitSlot(
      target.radius,
      target.angle,
      siblings,
      priorityRadiusBounds(isPriority, metrics.ringRadius, metrics.maxRadius)
    )
    await persist(
      tasks.map((task) =>
        task.id === id
          ? { ...task, isPriority, radius: slot.radius, angle: slot.angle, angleSetAt: now }
          : task
      )
    )
  }

  const repositionTask = async (id: string, radius: number, angle: number) => {
    const now = Date.now()
    await persist(
      tasks.map((task) =>
        task.id === id ? { ...task, radius, angle, angleSetAt: now } : task
      )
    )
  }

  const reassignCategory = async (fromCategoryId: string, toCategoryId: string) => {
    await persist(
      tasks.map((task) =>
        task.categoryId === fromCategoryId ? { ...task, categoryId: toCategoryId } : task
      )
    )
  }

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    setFocus,
    setPriority,
    repositionTask,
    reassignCategory,
  }
}
