'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Target, Zap, Navigation, Shield } from 'lucide-react'
import type { Asteroid } from '@/lib/nasa-api'

interface AsteroidListProps {
  asteroids: Asteroid[]
  loading: boolean
  onSelectAsteroid: (asteroid: Asteroid) => void
  selectedAsteroid: Asteroid | null
  viewMode: 'grid' | 'list'
}

export default function AsteroidList({
  asteroids,
  loading,
  onSelectAsteroid,
  selectedAsteroid,
  viewMode
}: AsteroidListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {asteroids.slice(0, 12).map((asteroid, index) => (
          <motion.div
            key={asteroid.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectAsteroid(asteroid)}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
              selectedAsteroid?.id === asteroid.id
                ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg truncate">{asteroid.name}</h3>
                <p className="text-sm text-gray-400">ID: {asteroid.id}</p>
              </div>
              {asteroid.is_potentially_hazardous_asteroid && (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Diameter:</span>
                <span className="font-medium">
                  {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)} - 
                  {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)} km
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Magnitude:</span>
                <span className="font-medium">{asteroid.absolute_magnitude_h}</span>
              </div>

              {asteroid.close_approach_data?.[0] && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Distance:</span>
                    <span className="font-medium">
                      {(parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(2)}M km
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Speed:</span>
                    <span className="font-medium">
                      {parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)} km/s
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 truncate">
                Next approach: {asteroid.close_approach_data?.[0]?.close_approach_date || 'Unknown'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="pb-3">Name</th>
            <th className="pb-3">Diameter (km)</th>
            <th className="pb-3">Hazard</th>
            <th className="pb-3">Distance (M km)</th>
            <th className="pb-3">Speed (km/s)</th>
            <th className="pb-3">Next Approach</th>
            <th className="pb-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {asteroids.slice(0, 10).map((asteroid) => (
            <motion.tr
              key={asteroid.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => onSelectAsteroid(asteroid)}
              className={`border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer transition-colors ${
                selectedAsteroid?.id === asteroid.id ? 'bg-blue-900/20' : ''
              }`}
            >
              <td className="py-4">
                <div className="flex items-center gap-2">
                  {asteroid.is_potentially_hazardous_asteroid && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium">{asteroid.name}</span>
                </div>
              </td>
              <td className="py-4">
                {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)}
              </td>
              <td className="py-4">
                {asteroid.is_potentially_hazardous_asteroid ? (
                  <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                    Hazardous
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                    Safe
                  </span>
                )}
              </td>
              <td className="py-4">
                {asteroid.close_approach_data?.[0] ? 
                  `${(parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(2)}` : 
                  'N/A'
                }
              </td>
              <td className="py-4">
                {asteroid.close_approach_data?.[0] ?
                  parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2) :
                  'N/A'
                }
              </td>
              <td className="py-4">
                {asteroid.close_approach_data?.[0]?.close_approach_date || 'Unknown'}
              </td>
              <td className="py-4">
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition">
                  View
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}