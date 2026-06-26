import Pusher, { type Channel, type ChannelAuthorizationHandler } from 'pusher-js'
import { getStoredSession, refreshStoredSession } from '@/stores/auth'

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY as string
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER as string
const PUSHER_AUTH_ENDPOINT = import.meta.env.VITE_PUSHER_AUTH_ENDPOINT as string

async function postPusherAuth(socketId: string, channelName: string, accessToken: string | null) {
  return fetch(PUSHER_AUTH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
  })
}

// Refresh-on-401/403 instead of static headers, mirroring lib/api.ts's apiFetch.
const authorizeChannel: ChannelAuthorizationHandler = (params, callback) => {
  ;(async () => {
    const session = await getStoredSession()
    let response = await postPusherAuth(params.socketId, params.channelName, session?.accessToken ?? null)

    if ((response.status === 401 || response.status === 403) && session) {
      const refreshed = await refreshStoredSession()
      if (refreshed) {
        response = await postPusherAuth(params.socketId, params.channelName, refreshed.accessToken)
      }
    }

    if (!response.ok) {
      throw new Error(`Pusher channel authorization failed with status ${response.status}`)
    }
    return response.json()
  })().then(
    (authData) => callback(null, authData),
    (error: unknown) => callback(error instanceof Error ? error : new Error(String(error)), null)
  )
}

let client: Pusher | null = null
let subscribedUserId: string | null = null
let refCount = 0

// pusher-js's web build can only run where `window`/`document` exist (a real
// page, not the MV3 service worker) — see this change's design.md. Each hook
// that needs the channel calls acquirePrivateChannel/releasePrivateChannel so
// the two hooks that always mount together on ProductivityPage share one
// connection instead of opening two.
export function acquirePrivateChannel(userId: string): { client: Pusher; channel: Channel } {
  if (client && subscribedUserId !== userId) {
    client.disconnect()
    client = null
    refCount = 0
  }

  if (!client) {
    client = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      channelAuthorization: { customHandler: authorizeChannel },
    })
    subscribedUserId = userId
  }

  refCount += 1
  return { client, channel: client.subscribe(`private-user-${userId}`) }
}

export function releasePrivateChannel(): void {
  refCount = Math.max(0, refCount - 1)
  if (refCount === 0 && client) {
    client.disconnect()
    client = null
    subscribedUserId = null
  }
}
