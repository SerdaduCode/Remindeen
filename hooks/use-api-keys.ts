import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

const API_KEYS_URL = import.meta.env.VITE_API_AUTH_API_KEYS as string

export interface ApiKeySummary {
  id: number
  label: string | null
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string
}

export interface GeneratedApiKey extends ApiKeySummary {
  token: string
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<ApiKeySummary[]>(API_KEYS_URL)
      setKeys(data)
      setError(null)
    } catch {
      setError('failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // The plaintext token is returned to the caller and never stored in `keys`
  // state — only the summary fields persist for the duration of this hook.
  const generateKey = async (label?: string): Promise<GeneratedApiKey> => {
    const created = await apiFetch<GeneratedApiKey>(API_KEYS_URL, {
      method: 'POST',
      body: JSON.stringify({ label }),
    })
    const { token, ...summary } = created
    setKeys((prev) => [summary, ...prev])
    return created
  }

  const revokeKey = async (id: number) => {
    await apiFetch<void>(`${API_KEYS_URL}/${id}`, { method: 'DELETE' })
    setKeys((prev) => prev.filter((key) => key.id !== id))
  }

  return { keys, loading, error, refresh, generateKey, revokeKey }
}
