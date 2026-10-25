'use client'

import { motion } from 'framer-motion'
import type { Asteroid } from '@/lib/nasa-api'

interface SpeedometerProps {
  asteroid: Asteroid | null
}

export default function Speedometer({ asteroid }: SpeedometerProps) {
  const speed = asteroid?.close_approach_data?.[0] ? 
    parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second) : 0

  const maxSpeed = 50 
  const percentage = Math.min((speed / maxSpeed) * 100, 100)
  
  const getColor = (value: number) => {
    if (value < 33) return '#10b981' 
    if (value < 66) return '#f59e0b' 
    return '#ef4444' 
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="relative w-48 h-48">

        <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
        

        <motion.div
          className="absolute inset-0 rounded-full border-8 border-transparent"
          style={{
            borderTopColor: getColor(percentage),
            borderRightColor: getColor(percentage),
            transform: 'rotate(45deg)'
          }}
          initial={{ borderTopColor: '#10b981', borderRightColor: '#10b981' }}
          animate={{ 
            borderTopColor: getColor(percentage),
            borderRightColor: getColor(percentage),
            rotate: `${45 + (percentage * 1.8)}deg`
          }}
          transition={{ duration: 1 }}
        ></motion.div>
        

        <div className="absolute inset-8 rounded-full bg-gray-800"></div>
        

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold"
          >
            {speed.toFixed(1)}
          </motion.div>
          <div className="text-sm text-gray-400 mt-1">km/s</div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <div className="text-lg font-semibold">
          {speed < 10 ? 'Slow Approach' : speed < 20 ? 'Moderate Speed' : 'High Velocity'}
        </div>
        <div className="text-sm text-gray-400">
          Relative to Earth
        </div>
      </div>
    </div>
  )
}