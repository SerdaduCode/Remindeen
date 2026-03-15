"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Activity } from "lucide-react"

const topSites = [
  { name: "akudankau.ddev.site", time: "25m", color: "bg-green-500" },
  { name: "ui.shadcn.com", time: "14m", color: "bg-green-500" },
  { name: "google.com", time: "6m", color: "bg-orange-400" },
  { name: "startuparchive.io", time: "4m", color: "bg-green-500" },
  { name: "producthunt.com", time: "4m", color: "bg-green-500" },
  { name: "github.com", time: "3m", color: "bg-green-500" },
  { name: "vercel.com", time: "3m", color: "bg-green-500" },
  { name: "openai.com", time: "2m", color: "bg-green-500" },
]

const INITIAL_VISIBLE = 5

function SiteIcon({ domain }: { domain: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return <span className="w-4 h-4 rounded-full bg-zinc-500 inline-block" />
  }

  return (
    <img
      src={`https://${domain}/favicon.ico`}
      className="w-4 h-4"
      onError={() => setError(true)}
      alt=""
    />
  )
}

export default function ActivityWidget() {
  const [expanded, setExpanded] = useState(false)

  const visibleSites = expanded ? topSites : topSites.slice(0, INITIAL_VISIBLE)

  return (
    <div className="space-y-4 w-[320px]">
      {/* Top Sites */}
      <Card className="bg-zinc-900 text-white border-zinc-800">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Globe size={16} />
          <CardTitle className="text-sm font-medium">Today's Top Sites</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {visibleSites.map((site, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <SiteIcon domain={site.name} />
                {site.name}
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${site.color}`} />
                <span className="text-zinc-400">{site.time}</span>
              </div>
            </div>
          ))}

          {topSites.length > INITIAL_VISIBLE && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-zinc-500 pt-2 hover:text-zinc-300">
              {expanded ? "Show less" : `Show all (${topSites.length})`}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-zinc-900 text-white border-zinc-800">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity size={16} />
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-zinc-300">
          <div className="flex justify-between">
            <span>now</span>
            <span>radix-ui.com</span>
            <span className="text-zinc-400 text-xs">1s</span>
          </div>
          <div className="flex justify-between">
            <span>11:13PM</span>
            <span>radix-ui.com x2</span>
            <span className="text-zinc-400 text-xs">2m</span>
          </div>
          <div className="flex justify-between">
            <span>11:10PM</span>
            <span>ui.shadcn.com x5</span>
            <span className="text-zinc-400 text-xs">2m</span>
          </div>
          <div className="flex justify-between">
            <span>11:09PM</span>
            <span>tableau.com</span>
            <span className="text-zinc-400 text-xs">1m</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
