import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

const TASKS_URL = import.meta.env.VITE_API_TASKS as string

export type TaskPriority = 'Low' | 'Medium' | 'High'
export type TaskStatus = 'TODO' | 'DOING' | 'DONE'

export interface Task {
  id: number
  userId: string
  title: string
  description: string | null
  startDate: string | null
  dueDate: string | null
  priority: TaskPriority | null
  status: TaskStatus
  position: number
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description?: string
  startDate?: string
  dueDate?: string
  priority?: TaskPriority | null
}

export function useTasks(enabled: boolean) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setTasks([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<Task[]>(TASKS_URL)
      setTasks(data)
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

  const createTask = async (input: TaskInput) => {
    const created = await apiFetch<Task>(TASKS_URL, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    setTasks((prev) => [...prev, created])
    return created
  }

  const updateTask = async (
    id: number,
    updates: Partial<TaskInput> & { status?: TaskStatus }
  ) => {
    const updated = await apiFetch<Task>(`${TASKS_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)))
    return updated
  }

  const updateTaskPosition = async (
    id: number,
    neighbors: { beforeId?: number; afterId?: number }
  ) => {
    const updated = await apiFetch<Task>(`${TASKS_URL}/${id}/position`, {
      method: 'PATCH',
      body: JSON.stringify(neighbors),
    })
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)))
    return updated
  }

  const deleteTask = async (id: number) => {
    await apiFetch<void>(`${TASKS_URL}/${id}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  return { tasks, loading, error, refresh, createTask, updateTask, updateTaskPosition, deleteTask }
}
