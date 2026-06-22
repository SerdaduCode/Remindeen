import { getStoredSession, refreshStoredSession } from '@/stores/auth'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function send(url: string, options: RequestInit, accessToken: string | null) {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(url, { ...options, headers })
}

// Refresh-on-401 instead of a timer: see stores/auth.ts for why. A failed
// refresh already clears the stored session (so isSignedIn flips to false and
// the UI falls back to the sign-in prompt) — this just surfaces the original
// 401 as an ApiError so callers don't need to special-case it.
export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const session = await getStoredSession()
  let response = await send(url, options, session?.accessToken ?? null)

  if (response.status === 401 && session) {
    const refreshed = await refreshStoredSession()
    if (refreshed) {
      response = await send(url, options, refreshed.accessToken)
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.message ?? `Request failed with status ${response.status}`, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}
