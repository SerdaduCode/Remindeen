import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { acquirePrivateChannel, releasePrivateChannel } from '@/lib/pusher-client'
import { getStoredSession } from '@/stores/auth'

const TODOLIST_URL = import.meta.env.VITE_API_TODOLIST as string

export interface TodoItem {
  id: number
  userId: string
  text: string
  done: boolean
  createdAt: string
}

export function useTodolist(enabled: boolean) {
  const [items, setItems] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<TodoItem[]>(TODOLIST_URL)
      setItems(data)
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

    const upsert = (item: TodoItem) =>
      setItems((prev) =>
        prev.some((i) => i.id === item.id) ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item]
      )
    const remove = ({ id }: { id: number }) => setItems((prev) => prev.filter((i) => i.id !== id))
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
      channel.bind('todoItem.created', upsert)
      channel.bind('todoItem.updated', upsert)
      channel.bind('todoItem.deleted', remove)
      pusherClient.connection.bind('state_change', handleStateChange)
    })

    return () => {
      active = false
      if (channel) {
        channel.unbind('todoItem.created', upsert)
        channel.unbind('todoItem.updated', upsert)
        channel.unbind('todoItem.deleted', remove)
      }
      if (pusherClient) {
        pusherClient.connection.unbind('state_change', handleStateChange)
        releasePrivateChannel()
      }
    }
  }, [enabled, refresh])

  const createItem = async (text: string) => {
    const created = await apiFetch<TodoItem>(TODOLIST_URL, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
    setItems((prev) => [...prev, created])
    return created
  }

  const toggleItem = async (id: number) => {
    const previous = items.find((i) => i.id === id)
    if (!previous) return
    const done = !previous.done

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)))

    try {
      const updated = await apiFetch<TodoItem>(`${TODOLIST_URL}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done }),
      })
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      return updated
    } catch (err) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: previous.done } : i)))
      throw err
    }
  }

  const deleteItem = async (id: number) => {
    await apiFetch<void>(`${TODOLIST_URL}/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return { items, loading, error, createItem, toggleItem, deleteItem }
}
