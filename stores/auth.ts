import { storage } from '#imports'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string | null
  name: string | null
  avatarUrl: string | null
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresAt: number // epoch seconds
  user: AuthUser
}

const authSessionStorage = storage.defineItem<AuthSession | null>('local:authSession', {
  fallback: null,
})

export function toAuthSession(session: Session): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      name: (session.user.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
  }
}

export const getStoredSession = () => authSessionStorage.getValue()

export const setStoredSession = (session: AuthSession) => authSessionStorage.setValue(session)

export const clearStoredSession = () => authSessionStorage.setValue(null)

export const watchStoredSession = (callback: (session: AuthSession | null) => void) =>
  authSessionStorage.watch(callback)

// Refresh-on-401 (see lib/api.ts) rather than a timer: a service worker can be
// suspended between events, so a setInterval-based refresh would silently stop.
export async function refreshStoredSession(): Promise<AuthSession | null> {
  const current = await getStoredSession()
  if (!current) return null

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: current.refreshToken,
  })

  if (error || !data.session) {
    await clearStoredSession()
    return null
  }

  const next = toAuthSession(data.session)
  await setStoredSession(next)
  return next
}
