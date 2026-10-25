'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Asteroid } from '@/lib/nasa-api'

const MAX_SIM_DAYS = 365 * 50
const AUTO_SPEED = 24

interface Props {
  asteroids: Asteroid[]
  focusId?: string
}

type PlanetData = {
  name: string
  radius: number
  semiMajorAxisAU: number
  scaledSemiMajor: number
  eccentricity: number
  inclinationDeg: number
  ascendingNodeDeg: number
  periodDays: number
  texture: string
  color: string
  hasRings?: boolean
  axialTiltDeg: number
  rotationSpeed: number
}

const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    radius: 0.22,
    semiMajorAxisAU: 0.387,
    scaledSemiMajor: 1.85,
    eccentricity: 0.2056,
    inclinationDeg: 7.0,
    ascendingNodeDeg: 48.3,
    periodDays: 87.97,
    texture: '/textures/mercury.jpg',
    color: '#8c8c8c',
    axialTiltDeg: 0.03,
    rotationSpeed: 0.015,
  },
  {
    name: 'Venus',
    radius: 0.32,
    semiMajorAxisAU: 0.723,
    scaledSemiMajor: 2.65,
    eccentricity: 0.0068,
    inclinationDeg: 3.39,
    ascendingNodeDeg: 76.7,
    periodDays: 224.7,
    texture: '/textures/venus.jpg',
    color: '#d69e62',
    axialTiltDeg: 177.3,
    rotationSpeed: -0.01,
  },
  {
    name: 'Earth',
    radius: 0.36,
    semiMajorAxisAU: 1.0,
    scaledSemiMajor: 3.45,
    eccentricity: 0.0167,
    inclinationDeg: 0.0,
    ascendingNodeDeg: 0.0,
    periodDays: 365.25,
    texture: '/textures/earth.jpg',
    color: '#2b82c9',
    axialTiltDeg: 23.44,
    rotationSpeed: 0.45,
  },
  {
    name: 'Mars',
    radius: 0.28,
    semiMajorAxisAU: 1.524,
    scaledSemiMajor: 4.45,
    eccentricity: 0.0934,
    inclinationDeg: 1.85,
    ascendingNodeDeg: 49.6,
    periodDays: 686.98,
    texture: '/textures/mars.jpg',
    color: '#c1440e',
    axialTiltDeg: 25.19,
    rotationSpeed: 0.42,
  },
  {
    name: 'Jupiter',
    radius: 0.95,
    semiMajorAxisAU: 5.204,
    scaledSemiMajor: 6.6,
    eccentricity: 0.0485,
    inclinationDeg: 1.3,
    ascendingNodeDeg: 100.5,
    periodDays: 4332.59,
    texture: '/textures/jupiter.jpg',
    color: '#d39c7e',
    axialTiltDeg: 3.13,
    rotationSpeed: 0.9,
  },
  {
    name: 'Saturn',
    radius: 0.82,
    semiMajorAxisAU: 9.582,
    scaledSemiMajor: 8.4,
    eccentricity: 0.0555,
    inclinationDeg: 2.49,
    ascendingNodeDeg: 113.7,
    periodDays: 10759.22,
    texture: '/textures/saturn.jpg',
    color: '#e2bf7d',
    hasRings: true,
    axialTiltDeg: 26.73,
    rotationSpeed: 0.85,
  },
  {
    name: 'Uranus',
    radius: 0.58,
    semiMajorAxisAU: 19.2,
    scaledSemiMajor: 10.2,
    eccentricity: 0.0463,
    inclinationDeg: 0.77,
    ascendingNodeDeg: 74.0,
    periodDays: 30685.4,
    texture: '/textures/uranus.jpg',
    color: '#4b70dd',
    axialTiltDeg: 97.77,
    rotationSpeed: -0.6,
  },
  {
    name: 'Neptune',
    radius: 0.56,
    semiMajorAxisAU: 30.05,
    scaledSemiMajor: 12.0,
    eccentricity: 0.0095,
    inclinationDeg: 1.77,
    ascendingNodeDeg: 131.8,
    periodDays: 60189.0,
    texture: '/textures/neptune.jpg',
    color: '#274687',
    axialTiltDeg: 28.32,
    rotationSpeed: 0.65,
  },
]

const ASTEROID_TEXTURES = [
  '/textures/asteroid_stony.jpg',
  '/textures/asteroid_carbon.jpg',
  '/textures/asteroid_metal.jpg',
  '/textures/asteroid_icy.jpg',
]

function solveKepler(M: number, e: number): number {
  let E = M
  for (let i = 0; i < 4; i++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    E -= delta
    if (Math.abs(delta) < 1e-6) break
  }
  return E
}

function calculateKeplerPosition(
  semiMajor: number,
  eccentricity: number,
  inclinationDeg: number,
  ascendingNodeDeg: number,
  E: number
): [number, number, number] {
  const xOrb = semiMajor * (Math.cos(E) - eccentricity)
  const zOrb = semiMajor * Math.sqrt(Math.max(0, 1 - eccentricity * eccentricity)) * Math.sin(E)

  const inc = (inclinationDeg * Math.PI) / 180
  const node = (ascendingNodeDeg * Math.PI) / 180

  const xNode = xOrb * Math.cos(node) - zOrb * Math.sin(node) * Math.cos(inc)
  const yNode = zOrb * Math.sin(inc)
  const zNode = xOrb * Math.sin(node) + zOrb * Math.cos(node) * Math.cos(inc)

  return [xNode, yNode, zNode]
}

function createIrregularAsteroidGeometry(radius: number, seed: number) {
  const geometry = new THREE.IcosahedronGeometry(radius, 4)
  const pos = geometry.attributes.position

  const stretchX = 1 + 0.35 * Math.sin(seed * 2.13 + 1.2)
  const stretchY = 0.85 + 0.2 * Math.cos(seed * 3.41 + 2.5)
  const stretchZ = 0.72 + 0.3 * Math.sin(seed * 1.87 + 0.7)

  const crater1 = new THREE.Vector3(
    Math.sin(seed * 1.1),
    Math.cos(seed * 2.2),
    Math.sin(seed * 3.3)
  ).normalize().multiplyScalar(radius)

  const crater2 = new THREE.Vector3(
    -Math.sin(seed * 2.7),
    -Math.cos(seed * 1.4),
    Math.cos(seed * 0.9)
  ).normalize().multiplyScalar(radius)

  const v = new THREE.Vector3()

  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i))

    const nx = v.x / radius
    const ny = v.y / radius
    const nz = v.z / radius

    const waistFactor = 1 - 0.22 * Math.exp(-(v.x * v.x) / (radius * radius * 0.75)) * Math.abs(Math.sin(ny * 2.0))

    const macroNoise =
      0.18 * Math.sin(nx * 2.4 + seed) * Math.cos(ny * 2.4 + seed) +
      0.12 * Math.cos(nz * 3.1 + seed * 1.5) * Math.sin(nx * 1.7)

    const microNoise =
      0.045 * Math.sin(nx * 7.5 + seed * 3) * Math.cos(ny * 7.5) +
      0.03 * Math.sin(nz * 12.0)

    let craterDip = 0
    const dist1 = v.distanceTo(crater1)
    const cRadius1 = radius * 0.55
    if (dist1 < cRadius1) {
      const normDist = dist1 / cRadius1
      craterDip -= 0.16 * (1 - normDist * normDist)
    }

    const dist2 = v.distanceTo(crater2)
    const cRadius2 = radius * 0.4
    if (dist2 < cRadius2) {
      const normDist2 = dist2 / cRadius2
      craterDip -= 0.12 * (1 - normDist2 * normDist2)
    }

    const totalMod = Math.max(0.4, waistFactor + macroNoise + microNoise + craterDip)

    pos.setXYZ(
      i,
      v.x * stretchX * totalMod,
      v.y * stretchY * totalMod,
      v.z * stretchZ * totalMod
    )
  }

  geometry.computeVertexNormals()
  return geometry
}

function TimeController({
  auto,
  setSimTime,
}: {
  auto: boolean
  setSimTime: React.Dispatch<React.SetStateAction<number>>
}) {
  useFrame((_, delta) => {
    if (auto) {
      setSimTime(t => (t + delta * AUTO_SPEED) % MAX_SIM_DAYS)
    }
  })
  return null
}

function CameraRig({ active }: { active: boolean }) {
  const { camera } = useThree()
  const angle = useRef(0)

  useFrame((_, delta) => {
    if (!active) return
    angle.current += delta * 0.08
    camera.position.set(
      Math.cos(angle.current) * 11,
      6.5,
      Math.sin(angle.current) * 11
    )
    camera.lookAt(0, 0, 0)
  })

  return null
}

function SunMesh() {
  const texture = useTexture('/textures/sun.jpg')

  return (
    <mesh>
      <sphereGeometry args={[1.35, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        emissive="#ff9900"
        emissiveIntensity={2.0}
      />
    </mesh>
  )
}

function PlanetOrbitEllipse({ planet }: { planet: PlanetData }) {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    const STEPS = 120
    for (let i = 0; i <= STEPS; i++) {
      const E = (i / STEPS) * Math.PI * 2
      const pos = calculateKeplerPosition(
        planet.scaledSemiMajor,
        planet.eccentricity,
        planet.inclinationDeg,
        planet.ascendingNodeDeg,
        E
      )
      points.push(new THREE.Vector3(...pos))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [planet])

  return (
    <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
      color: planet.color,
      transparent: true,
      opacity: 0.32,
    }))} />
  )
}

function SaturnRings() {
  const ringTexture = useTexture('/textures/saturn_ring.png')

  return (
    <mesh rotation={[Math.PI / 2.2, 0, 0]}>
      <ringGeometry args={[1.05, 1.85, 64]} />
      <meshStandardMaterial
        map={ringTexture}
        transparent
        side={THREE.DoubleSide}
        opacity={0.88}
      />
    </mesh>
  )
}

function PlanetMesh({
  planet,
  simTime,
  onHover,
}: {
  planet: PlanetData
  simTime: number
  onHover: (label: string | null, e?: PointerEvent) => void
}) {
  const texture = useTexture(planet.texture)
  const meshRef = useRef<THREE.Mesh>(null)

  const position = useMemo(() => {
    const M = ((2 * Math.PI * simTime) / planet.periodDays) % (2 * Math.PI)
    const E = solveKepler(M, planet.eccentricity)
    return calculateKeplerPosition(
      planet.scaledSemiMajor,
      planet.eccentricity,
      planet.inclinationDeg,
      planet.ascendingNodeDeg,
      E
    )
  }, [planet, simTime])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed
    }
  })

  const axialTiltRad = (planet.axialTiltDeg * Math.PI) / 180

  return (
    <group
      position={position}
      onPointerOver={e => {
        e.stopPropagation()
        onHover(planet.name, e.nativeEvent)
      }}
      onPointerOut={() => onHover(null)}
    >
      <group rotation={[0, 0, axialTiltRad]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[planet.radius, 48, 48]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.7}
            metalness={0.05}
            emissive={planet.name === 'Earth' ? '#0033bb' : undefined}
            emissiveIntensity={planet.name === 'Earth' ? 0.3 : 0}
          />
        </mesh>

        {planet.hasRings && <SaturnRings />}
      </group>
    </group>
  )
}

function AsteroidMesh({
  asteroid,
  index,
  simTime,
  selected,
  isSingleFocus,
  onHover,
  onSelect,
}: {
  asteroid: Asteroid
  index: number
  simTime: number
  selected: boolean
  isSingleFocus: boolean
  onHover: (label: string | null, e?: PointerEvent) => void
  onSelect: (a: Asteroid) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const textureIndex = useMemo(() => {
    if (asteroid.prediction?.isNewEarthCandidate) return 3
    if (asteroid.is_potentially_hazardous_asteroid) return 1
    return index % ASTEROID_TEXTURES.length
  }, [asteroid, index])

  const surfaceTexture = useTexture(ASTEROID_TEXTURES[textureIndex])
  const bumpTexture = useTexture('/textures/asteroid_bump.jpg')

  const orbitParams = useMemo(() => {
    if (isSingleFocus) {
      return { semiMajor: 0, eccentricity: 0, incDeg: 0, nodeDeg: 0, periodDays: 365 }
    }

    const missKm = parseFloat(asteroid.close_approach_data?.[0]?.miss_distance?.kilometers || '15000000')
    const scaledSemi = Math.min(Math.max((missKm / 8000000) + 3.0, 2.8), 8.8)
    const ecc = Math.min(Math.max(asteroid.orbital_data?.eccentricity ? Number(asteroid.orbital_data.eccentricity) : 0.12 + (index % 5) * 0.05, 0.04), 0.42)
    const inc = asteroid.orbital_data?.inclination ? Number(asteroid.orbital_data.inclination) : (index % 9 - 4) * 2.2
    const node = (index * 47) % 360
    const period = asteroid.orbital_data?.orbital_period ? Number(asteroid.orbital_data.orbital_period) : 320 + (index % 8) * 110

    return {
      semiMajor: scaledSemi,
      eccentricity: ecc,
      incDeg: inc,
      nodeDeg: node,
      periodDays: period,
    }
  }, [asteroid, index, isSingleFocus])

  const size = useMemo(() => {
    if (isSingleFocus) return 1.35
    const km =
      (asteroid.estimated_diameter?.kilometers?.estimated_diameter_min +
        asteroid.estimated_diameter?.kilometers?.estimated_diameter_max) / 2 || 0.45
    return Math.min(Math.max(km / 8, 0.2), 0.6)
  }, [asteroid, isSingleFocus])

  const geometry = useMemo(
    () => createIrregularAsteroidGeometry(size, index + 37),
    [size, index]
  )

  const position = useMemo(() => {
    if (isSingleFocus) return [0, 0, 0] as [number, number, number]
    const M = ((2 * Math.PI * simTime) / orbitParams.periodDays + index * 0.73) % (2 * Math.PI)
    const E = solveKepler(M, orbitParams.eccentricity)
    return calculateKeplerPosition(
      orbitParams.semiMajor,
      orbitParams.eccentricity,
      orbitParams.incDeg,
      orbitParams.nodeDeg,
      E
    )
  }, [orbitParams, simTime, index, isSingleFocus])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35
      meshRef.current.rotation.x += delta * 0.18
      meshRef.current.rotation.z += delta * 0.12
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      onPointerOver={e => {
        e.stopPropagation()
        onHover(`${asteroid.name} (${asteroid.id})`, e.nativeEvent)
      }}
      onPointerOut={() => onHover(null)}
      onClick={e => {
        e.stopPropagation()
        onSelect(asteroid)
      }}
    >
      <meshStandardMaterial
        map={surfaceTexture}
        bumpMap={bumpTexture}
        bumpScale={0.09}
        roughness={0.92}
        metalness={textureIndex === 2 ? 0.35 : 0.05}
        color={selected ? '#40e0d0' : undefined}
        emissive={selected ? '#00e5ff' : asteroid.is_potentially_hazardous_asteroid ? '#551100' : '#080808'}
        emissiveIntensity={selected ? 0.8 : 0.18}
      />
    </mesh>
  )
}

function Tooltip({ text, pos }: { text: string; pos: { x: number; y: number } }) {
  return (
    <div
      className="fixed z-50 px-3 py-2 text-xs bg-black/85 text-white rounded pointer-events-none font-mono border border-cyan-800/60 shadow-lg shadow-cyan-950/40"
      style={{ left: pos.x + 14, top: pos.y + 14 }}
    >
      {text}
    </div>
  )
}

export default function Asteroid3DVisualizer({ asteroids, focusId }: Props) {
  const [simTime, setSimTime] = useState(0)
  const [auto, setAuto] = useState(true)
  const [hover, setHover] = useState<string | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState<Asteroid | null>(null)

  const isSingle = asteroids.length === 1

  return (
    <div className="relative w-full h-[52vh] bg-gradient-to-b from-[#02040b] via-[#050914] to-[#010206] rounded-xl overflow-hidden border border-cyan-950/40">
      {hover && <Tooltip text={hover} pos={mouse} />}

      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setAuto(a => !a)}
          className="px-3 py-1.5 text-xs font-mono bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-200 rounded-md cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-black"
        >
          <span className={`w-2 h-2 rounded-full ${auto ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {auto ? 'Live Orbiting' : 'Paused'}
        </button>

        {!isSingle && (
          <span className="text-[11px] font-mono text-cyan-400/80 px-2.5 py-1 bg-black/60 rounded-md border border-cyan-950">
            Day {Math.round(simTime)}
          </span>
        )}
      </div>

      <Canvas camera={{ position: isSingle ? [0, 0, 3.6] : [10, 6, 11], fov: 48 }}>
        <Suspense fallback={null}>
          <TimeController auto={auto} setSimTime={setSimTime} />
          {!isSingle && <CameraRig active={auto} />}

          <ambientLight intensity={isSingle ? 0.7 : 0.4} />
          <directionalLight position={[7, 7, 7]} intensity={1.5} />
          <directionalLight position={[-7, -4, -4]} intensity={0.4} />

          {!isSingle && <SunMesh />}

          <group scale={isSingle ? 1 : 1.4}>
            {!isSingle &&
              PLANETS.map(p => (
                <group key={p.name}>
                  <PlanetOrbitEllipse planet={p} />
                  <PlanetMesh
                    planet={p}
                    simTime={simTime}
                    onHover={(label, e) => {
                      if (e) setMouse({ x: e.clientX, y: e.clientY })
                      setHover(label)
                    }}
                  />
                </group>
              ))}

            {asteroids.map((a, i) => (
              <AsteroidMesh
                key={a.id}
                asteroid={a}
                index={i}
                simTime={simTime}
                selected={selected?.id === a.id || focusId === a.id}
                isSingleFocus={isSingle}
                onHover={(label, e) => {
                  if (e) setMouse({ x: e.clientX, y: e.clientY })
                  setHover(label)
                }}
                onSelect={setSelected}
              />
            ))}
          </group>

          <Stars radius={110} depth={60} count={2400} factor={3.5} fade />
          <OrbitControls enablePan={!isSingle} minDistance={isSingle ? 1.8 : 4} maxDistance={isSingle ? 8 : 40} />
        </Suspense>
      </Canvas>
    </div>
  )
}
