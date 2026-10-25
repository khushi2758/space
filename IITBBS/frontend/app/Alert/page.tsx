'use client'

import { useEffect, useState } from "react"
import Navbar from "../Homepage/navbar"
import EventCard from "./AlertCard"
import { nasaApi, type AlertItem } from "@/lib/nasa-api"

export default function Alert() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchAlerts = async () => {
      try {
        const data = await nasaApi.getAlerts()
        if (active) {
          setAlerts(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchAlerts()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-[#02020a] overflow-hidden text-amber-50">
      <Navbar />
      <div className="w-full max-w-5xl space-y-4 flex flex-col mx-auto mt-24 px-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold border-b-2 border-red-500 pb-1">
            Cosmic Close-Approach Alerts
          </h1>
          <span className="text-xs px-3 py-1 bg-red-950/60 border border-red-800 text-red-300 rounded-full font-mono">
            {alerts.length} Active Notice{alerts.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-cyan-400 animate-pulse">
            Scanning NEO tracking streams for close approaches...
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
            No critical close-encounter events currently detected for today.
          </div>
        ) : (
          alerts.map((alert) => (
            <EventCard
              key={alert.id}
              date={alert.date}
              time={alert.time}
              title={alert.title}
              description={alert.description}
              darkButton={alert.severity === "CRITICAL"}
            />
          ))
        )}
      </div>
    </div>
  )
}
