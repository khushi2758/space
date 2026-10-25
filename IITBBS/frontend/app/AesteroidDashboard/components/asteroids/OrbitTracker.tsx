'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'

import type { Asteroid } from '@/lib/nasa-api'

interface OrbitTrackerProps {
  asteroid: Asteroid | null
}

type OrbitPoint = {
  angle: number
  distance: number
}

export default function OrbitTracker({ asteroid }: OrbitTrackerProps) {
  const orbitData = useMemo<OrbitPoint[] | null>(() => {
    const od = asteroid?.orbital_data
    if (!od) return null
console.log("Selected asteroid:", asteroid);
console.log("Orbital data:", asteroid?.orbital_data);
    const e = Number(od.eccentricity)
    const q = Number(od.perihelion_distance)
    const Q = Number(od.aphelion_distance)

    if (
  ![e, q, Q].every(Number.isFinite) ||
  e < 0 ||
  e >= 1 ||
  q <= 0 ||
  Q <= 0 ||
  q > Q
) {
  return null
}

    // Semi-major axis derived correctly
    const a = (q + Q) / 2

    const POINTS = 120

    return Array.from({ length: POINTS }, (_, i) => {
      const theta = (i / POINTS) * Math.PI * 2
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta))

      return {
        angle: Math.round((theta * 180) / Math.PI),
        distance: Number(r.toFixed(4)),
      }
    })
  }, [asteroid])

  if (!orbitData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        No orbital data available
      </div>
    )
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={orbitData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

          <XAxis
            dataKey="angle"
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Orbital Angle (°)',
              position: 'insideBottom',
              offset: -5,
              fill: '#9ca3af',
            }}
          />

          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Distance (AU)',
              angle: -90,
              position: 'insideLeft',
              fill: '#9ca3af',
            }}
            domain={['auto', 'auto']}
          />

          <Tooltip
            formatter={(value) =>
              typeof value === 'number'
                ? [`${value} AU`, 'Distance']
                : ['—', 'Distance']
            }
            labelFormatter={(label) =>
              typeof label === 'number' ? `Angle: ${label}°` : 'Angle'
            }
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: '#374151',
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />

          <Line
            type="monotone"
            dataKey="distance"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}