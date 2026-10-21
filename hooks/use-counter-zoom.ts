import { useEffect, useState } from 'react'

interface CounterZoom {
  /** CSS `zoom` value that cancels the browser zoom (1 / browser zoom factor) */
  scale: number
  /** Viewport size expressed in the zoomed element's own units */
  width: number
  height: number
  /** False until the real browser zoom is known, to avoid a flash at the wrong size */
  ready: boolean
}

const MIN_ZOOM = 0.25
const MAX_ZOOM = 5

const measure = (zoom: number, ready: boolean): CounterZoom => {
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
  const scale = 1 / clamped
  return {
    scale,
    width: window.innerWidth / scale,
    height: window.innerHeight / scale,
    ready,
  }
}

/**
 * Keeps the page looking like 100% regardless of the browser zoom level.
 * Reads the tab's zoom factor and returns the inverse scale plus the viewport
 * size to apply on the root wrapper. Falls back to no compensation if the
 * tabs API is unavailable.
 */
export function useCounterZoom(): CounterZoom {
  const [state, setState] = useState<CounterZoom>(() => measure(1, false))

  useEffect(() => {
    let tabId: number | undefined
    let active = true

    const update = async () => {
      let zoom = 1
      try {
        if (tabId === undefined) {
          tabId = (await browser.tabs.getCurrent())?.id
        }
        zoom = await browser.tabs.getZoom(tabId)
      } catch {
        // Zoom unavailable (e.g. opened outside a tab): render uncompensated
      }
      if (active) setState(measure(zoom, true))
    }

    update()

    // Browser zoom changes also resize the CSS viewport, so resize doubles as a trigger
    window.addEventListener('resize', update)
    const onZoomChange = (info: { tabId: number }) => {
      if (tabId === undefined || info.tabId === tabId) update()
    }
    browser.tabs.onZoomChange?.addListener(onZoomChange)

    return () => {
      active = false
      window.removeEventListener('resize', update)
      browser.tabs.onZoomChange?.removeListener(onZoomChange)
    }
  }, [])

  return state
}
