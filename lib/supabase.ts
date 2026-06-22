import { createClient } from '@supabase/supabase-js'
import { browser } from '#imports'

// supabase-js still needs *some* storage for PKCE bookkeeping (the code
// verifier written by signInWithOAuth and read back by exchangeCodeForSession)
// even with persistSession off. Its default is `window.localStorage`, which
// doesn't exist in an MV3 service worker — so every context uses this
// chrome.storage-backed adapter instead. The actual user session is persisted
// separately via stores/auth.ts, shared across extension contexts.
const extensionStorageAdapter = {
  getItem: async (key: string) => {
    const result = await browser.storage.local.get(key)
    return (result[key] as string | undefined) ?? null
  },
  setItem: async (key: string, value: string) => {
    await browser.storage.local.set({ [key]: value })
  },
  removeItem: async (key: string) => {
    await browser.storage.local.remove(key)
  },
}

// Auto-refresh is disabled because its timer-based approach doesn't survive a
// suspended MV3 service worker — refresh is triggered on-demand instead, see
// stores/auth.ts's refreshStoredSession.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storage: extensionStorageAdapter,
    },
  }
)
