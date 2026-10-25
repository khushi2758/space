'use client'

import { Target, Zap, Navigation, Shield, Activity, Globe } from 'lucide-react'
import type { Asteroid } from '@/lib/nasa-api'

interface AsteroidStatsProps {
  asteroid: Asteroid | null
}

export default function AsteroidStats({ asteroid }: AsteroidStatsProps) {
  if (!asteroid) {
    return (
      <div className="text-gray-500 text-center py-8">
        Select an asteroid to view details
      </div>
    )
  }

  const stats = [
    {
      icon: Target,
      label: 'Diameter Range',
      value: `${asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)} - ${asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)} km`,
      color: 'text-blue-400'
    },
    {
      icon: Zap,
      label: 'Absolute Magnitude',
      value: asteroid.absolute_magnitude_h.toFixed(2),
      color: 'text-yellow-400'
    },
    {
      icon: Navigation,
      label: 'Orbiting Body',
      value: asteroid.close_approach_data?.[0]?.orbiting_body || 'Earth',
      color: 'text-green-400'
    },
    {
      icon: Shield,
      label: 'Hazard Level',
      value: asteroid.is_potentially_hazardous_asteroid ? 'High Risk' : 'Low Risk',
      color: asteroid.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-green-400'
    },
    {
      icon: Activity,
      label: 'Eccentricity',
      value: asteroid.orbital_data?.eccentricity?.toFixed(3) || 'N/A',
      color: 'text-purple-400'
    },
    {
      icon: Globe,
      label: 'Orbital Period',
      value: asteroid.orbital_data?.orbital_period ? `${asteroid.orbital_data.orbital_period.toFixed(1)} days` : 'N/A',
      color: 'text-cyan-400'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-gray-400">{stat.label}</span>
          </div>
          <p className="font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}