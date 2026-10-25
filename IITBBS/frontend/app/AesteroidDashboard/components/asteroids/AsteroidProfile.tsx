'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { ArrowLeft } from 'lucide-react'
import AsteroidStats from './AesteroidStats'
import type { Asteroid } from '@/lib/nasa-api'

type Props = {
  asteroids: Asteroid[]
  focusId?: string
}

const OrbitTracker = dynamic(() => import('./OrbitTracker'), { ssr: false })
const Speedometer = dynamic(() => import('./Speedometer'), { ssr: false })
const Asteroid3DVisualizer = dynamic(
  () => import('./Aesteroid3DVisualizer'),
  { ssr: false }
)

export default function AsteroidProfile({
  asteroid,
  onBack,
}: {
  asteroid: Asteroid
  onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-black text-white p-6 space-y-8"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      <h1 className="text-4xl font-mono font-bold text-cyan-400">
        {asteroid.name}
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-panel">
          <Asteroid3DVisualizer
            asteroids={[asteroid]}
            focusId={asteroid.id}
          />
        </div>

        <div className="space-y-6">
          <div className="glass-panel">
            <Speedometer asteroid={asteroid} />
          </div>
          <div className="glass-panel">
            <OrbitTracker asteroid={asteroid} />
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <AsteroidStats asteroid={asteroid} />
      </div>
    </motion.div>
  )
}