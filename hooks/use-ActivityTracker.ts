"use client"

import { useEffect } from "react"
import { recordVisit } from "@/lib/activityTracker"

export function useActivityTracker() {
  useEffect(() => {
    recordVisit(window.location.href)
  }, [])
}