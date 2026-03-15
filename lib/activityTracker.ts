const STORAGE_KEY = "recent_activity"

export function getActivities() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveActivity(activity: any) {
  const activities = getActivities()
  activities.unshift(activity)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.slice(0, 50)))
}

export function recordVisit(url: string) {
  const start = Date.now()

  window.addEventListener("beforeunload", () => {
    const end = Date.now()
    const duration = Math.floor((end - start) / 1000)

    saveActivity({
      url,
      domain: new URL(url).hostname,
      start,
      end,
      duration
    })
  })
}