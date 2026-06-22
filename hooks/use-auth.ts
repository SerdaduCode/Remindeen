import { browser } from '#imports'
import { useEffect, useState } from 'react'
import {
  clearStoredSession,
  getStoredSession,
  watchStoredSession,
  type AuthSession,
} from '@/stores/auth'

type SignInResult = { ok: true } | { ok: false; error: string }

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getStoredSession().then((value) => {
      setSession(value)
      setLoading(false)
    })

    const unwatch = watchStoredSession((newVal) => {
      setSession(newVal)
    })

    return unwatch
  }, [])

  const signIn = async () => {
    setSigningIn(true)
    setError(null)
    try {
      const result: SignInResult = await browser.runtime.sendMessage({ type: 'auth:signIn' })
      if (!result.ok) {
        setError(result.error)
      }
    } catch {
      setError('Sign-in failed')
    } finally {
      setSigningIn(false)
    }
  }

  const signOut = async () => {
    await clearStoredSession()
  }

  return {
    session,
    isSignedIn: session !== null,
    loading,
    signingIn,
    error,
    signIn,
    signOut,
  }
}
