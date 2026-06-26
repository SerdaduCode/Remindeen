import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/pusher-client'
import { getStoredSession } from '@/stores/auth'

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

  useEffect(() => {
    if (!enabled) return

    let active = true
    let channel: import('pusher-js').Channel | null = null
    let pusherClient: import('pusher-js').default | null = null
    let hasConnectedOnce = false

    const upsert = (task: Task) =>
      setTasks((prev) =>
        prev.some((t) => t.id === task.id) ? prev.map((t) => (t.id === task.id ? task : t)) : [...prev, task]
      )
    const remove = ({ id }: { id: number }) => setTasks((prev) => prev.filter((t) => t.id !== id))
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
      channel.bind('task.created', upsert)
      channel.bind('task.updated', upsert)
      channel.bind('task.deleted', remove)
      pusherClient.connection.bind('state_change', handleStateChange)
    })

    return () => {
      active = false
      if (channel) {
        channel.unbind('task.created', upsert)
        channel.unbind('task.updated', upsert)
        channel.unbind('task.deleted', remove)
      }
      if (pusherClient) {
        pusherClient.connection.unbind('state_change', handleStateChange)
        releasePrivateChannel()
      }
    }
  }, [enabled, refresh])

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
