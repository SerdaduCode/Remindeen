import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/pusher-client'
import { getStoredSession } from '@/stores/auth'

const TASKS_URL = import.meta.env.VITE_API_TASKS as string

export interface TaskComment {
  id: number
  taskId: number
  body: string
  createdAt: string
  updatedAt: string
}

export function useTaskComments(taskId: number | null) {
  const [comments, setComments] = useState<TaskComment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (taskId === null) {
      setComments([])
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<TaskComment[]>(`${TASKS_URL}/${taskId}/comments`)
      setComments(data)
      setError(null)
    } catch {
      setError('failed')
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (taskId === null) return

    let active = true
    let channel: import('pusher-js').Channel | null = null
    let pusherClient: import('pusher-js').default | null = null
    let hasConnectedOnce = false

    const upsert = (comment: TaskComment) => {
      if (comment.taskId !== taskId) return
      setComments((prev) =>
        prev.some((c) => c.id === comment.id) ? prev.map((c) => (c.id === comment.id ? comment : c)) : [...prev, comment]
      )
    }
    const remove = (payload: { id: number; taskId: number }) => {
      if (payload.taskId !== taskId) return
      setComments((prev) => prev.filter((c) => c.id !== payload.id))
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
      channel.bind('comment.created', upsert)
      channel.bind('comment.updated', upsert)
      channel.bind('comment.deleted', remove)
      pusherClient.connection.bind('state_change', handleStateChange)
    })

    return () => {
      active = false
      if (channel) {
        channel.unbind('comment.created', upsert)
        channel.unbind('comment.updated', upsert)
        channel.unbind('comment.deleted', remove)
      }
      if (pusherClient) {
        pusherClient.connection.unbind('state_change', handleStateChange)
        releasePrivateChannel()
      }
    }
  }, [taskId, refresh])

  const addComment = async (body: string) => {
    const created = await apiFetch<TaskComment>(`${TASKS_URL}/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
    setComments((prev) => [...prev, created])
    return created
  }

  const editComment = async (id: number, body: string) => {
    const updated = await apiFetch<TaskComment>(`${TASKS_URL}/${taskId}/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    })
    setComments((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  const deleteComment = async (id: number) => {
    await apiFetch<void>(`${TASKS_URL}/${taskId}/comments/${id}`, { method: 'DELETE' })
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  return { comments, loading, error, addComment, editComment, deleteComment }
}
