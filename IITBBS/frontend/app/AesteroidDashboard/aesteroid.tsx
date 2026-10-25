'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowBigLeftDash, ArrowBigRightDash } from 'lucide-react';
import {
  AlertTriangle,
  Radar,
  Globe,
  Satellite,
  Activity,
  Target,
  Zap,
  Database,
  Navigation,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { Orbitron } from 'next/font/google'

import AsteroidList from './components/asteroids/AsteroidList'
import AsteroidStats from './components/asteroids/AesteroidStats'
import AsteroidProfile from './components/asteroids/AsteroidProfile'
import { nasaApi, type Asteroid } from '@/lib/nasa-api'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

const Asteroid3DVisualizer = dynamic(
  () => import('./components/asteroids/Aesteroid3DVisualizer'),
  { ssr: false }
)

const OrbitTracker = dynamic(
  () => import('./components/asteroids/OrbitTracker'),
  { ssr: false }
)

const Speedometer = dynamic(
  () => import('./components/asteroids/Speedometer'),
  { ssr: false }
)

export default function AsteroidDashboard() {
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [asteroids, setAsteroids] = useState<Asteroid[]>([])
  const [focusedAsteroid, setFocusedAsteroid] = useState<Asteroid | null>(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [updated, setUpdated] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const data = await nasaApi.getAsteroidsFeed(date)
        if (!active) return
        setAsteroids(data)
        setUpdated(new Date().toLocaleTimeString())
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [date])

  const hazardousCount = useMemo(
    () => asteroids.filter(a => a.is_potentially_hazardous_asteroid).length,
    [asteroids]
  )

  const avgDiameter = useMemo(() => {
    if (!asteroids.length) return 0
    return (
      asteroids.reduce((sum, a) => {
        const d = a.estimated_diameter.kilometers
        return sum + (d.estimated_diameter_min + d.estimated_diameter_max) / 2
      }, 0) / asteroids.length
    )
  }, [asteroids])

  if (focusedAsteroid) {
    return (
      <AsteroidProfile
        asteroid={focusedAsteroid}
        onBack={() => setFocusedAsteroid(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#05080f] via-black to-[#05080f] text-white px-6 py-6 space-y-8">
      <header className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className={`${orbitron.className} text-4xl tracking-widest font-bold bg-linear-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-0`}>
            Near <span className={`${orbitron.className} text-4xl tracking-widest text-gray-400`}>Us</span>
          </h1>
          <p className="text-gray-400 text-sm font-mono tracking-widest mt-0">
            Near-Earth object monitoring & trajectory intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setDate(format(addDays(new Date(date), -1), 'yyyy-MM-dd'))
            }
            className="btn-muted cursor-pointer"
          >
            <ArrowBigLeftDash className="text-blue-400 text-shadow-blue-400 bg-transparent" />
          </button>

          <span className="text-sm text-neutral-400 font-mono tracking-wide">
            {format(new Date(date), 'MMM dd, yyyy')}
          </span>

          <button
            onClick={() =>
              setDate(format(addDays(new Date(date), 1), 'yyyy-MM-dd'))
            }
            className="btn-primary cursor-pointer"
          >
            <ArrowBigRightDash className="text-blue-400 text-shadow-blue-400 bg-transparent" />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat title="Tracked Objects" value={asteroids.length} icon={<Database />} />
        <Stat title="Hazardous" value={hazardousCount} danger icon={<AlertTriangle />} />
        <Stat title="Avg Diameter" value={`${avgDiameter.toFixed(2)} km`} icon={<Target />} />
        <Stat
          title="Closest Pass"
          value={
            asteroids[0]?.close_approach_data?.[0]?.miss_distance?.kilometers
              ? `${(
                  parseFloat(
                    asteroids[0].close_approach_data[0].miss_distance.kilometers
                  ) / 1e6
                ).toFixed(2)}M km`
              : 'N/A'
          }
          icon={<Navigation />}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Panel title="Solar System View" icon={<Globe />}>
            <Asteroid3DVisualizer asteroids={asteroids} />
          </Panel>

          <Panel title="Threat Analysis" icon={<Radar />}>
            <div className="grid grid-cols-2 gap-4">
              <Info label="Hazardous" value={hazardousCount} tone="red" />
              <Info label="Safe" value={asteroids.length - hazardousCount} tone="green" />
            </div>
          </Panel>
        </div>

        <div className="space-y-6 border-2 border-neutral-800 rounded-lg p-4">
          <Panel title="Velocity" icon={<Zap />}>
            {asteroids[0] && <Speedometer asteroid={asteroids[0]} />}
          </Panel>

          <Panel title="Orbit Path" icon={<Satellite />}>
            {asteroids[0] && <OrbitTracker asteroid={asteroids[0]} />}
          </Panel>

          <Panel title="Asteroid Metrics" icon={<Activity />}>
            {asteroids[0] && <AsteroidStats asteroid={asteroids[0]} />}
          </Panel>
        </div>
      </section>

      <Panel>
        <AsteroidList
          asteroids={asteroids}
          loading={loading}
          selectedAsteroid={null}
          onSelectAsteroid={setFocusedAsteroid}
          viewMode={viewMode}
        />
      </Panel>

      <footer className="text-center text-xs text-gray-500">
        NASA NEO Engine • Trajectory Feed Synchronized: {updated}
      </footer>
    </div>
  )
}

const Stat = ({ title, value, icon, danger }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card"
  >
    <div>
      <p className="text-xs text-gray-400">{title}</p>
      <p className={`text-2xl font-semibold ${danger ? 'text-red-400' : ''}`}>
        {value}
      </p>
    </div>
    <div className="opacity-60">{icon}</div>
  </motion.div>
)

const Panel = ({ title, icon, children }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel border-neutral-800"
  >
    {title && (
      <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold">
        {icon} {title}
      </h2>
    )}
    {children}
  </motion.div>
)

const Info = ({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'red' | 'green'
}) => (
  <div
    className={`rounded-xl p-4 ${
      tone === 'red'
        ? 'bg-red-900/20 text-red-400'
        : 'bg-green-900/20 text-green-400'
    }`}
  >
    <p className="text-xs">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
)
