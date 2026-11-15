import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Billboard, ContactShadows, OrbitControls, Text, useProgress } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import fontUrl from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff?url'
import Panel, { type Spot } from './Panel'
import {
  Atmosphere,
  Birds,
  Cat,
  Clouds,
  Fireflies,
  LANDMARKS,
  MeteorShower,
  SkyBody,
  Walker,
  WalkMarker,
  phaseNow,
  type Phase,
  type TimeMode,
} from './alive'
import { FortKochi, Ground, Houseboat, Infopark, MarineDrive, Palm, QueensWalkway } from './kochi'
import './world.css'

/* Camera stops for each place on the island */
const STOPS: Record<Spot | 'home', { pos: [number, number, number]; target: [number, number, number] }> = {
  home: { pos: [3, 9.5, 15], target: [0, 1, -0.5] },
  about: { pos: [0.6, 2.8, 5.6], target: [0, 1.6, 0] },
  work: { pos: [-3.6, 4.4, 3.4], target: [-2.3, 1.8, -3.2] },
  career: { pos: [8, 4.2, 2], target: [3.4, 1, -3.4] },
  projects: { pos: [-1, 3.6, 3.6], target: [-6.4, 0.8, 0] },
  contact: { pos: [1.2, 3.2, 8.4], target: [-2.4, 0.6, 3.5] },
}

function CameraRig({ spot, reduce }: { spot: Spot | null; reduce: boolean }) {
  const { camera, controls } = useThree() as { camera: THREE.PerspectiveCamera; controls: OrbitControlsImpl | null }
  const flying = useRef(true)
  const goal = useMemo(() => STOPS[spot ?? 'home'], [spot])

  useEffect(() => {
    flying.current = true
  }, [goal])

  useFrame((_, dt) => {
    if (!controls || !flying.current) return
    const k = reduce ? 1 : 1 - Math.pow(0.0015, dt)
    camera.position.lerp(new THREE.Vector3(...goal.pos), k)
    controls.target.lerp(new THREE.Vector3(...goal.target), k)
    controls.update()
    if (camera.position.distanceTo(new THREE.Vector3(...goal.pos)) < 0.05) flying.current = false
  })

  useEffect(() => {
    if (!controls) return
    const stop = () => (flying.current = false)
    controls.addEventListener('start', stop)
    return () => controls.removeEventListener('start', stop)
  }, [controls])

  return null
}

function Name({ phase }: { phase: Phase }) {
  const day = phase === 'day'
  return (
    <Billboard position={[0, 6.3, -1.5]}>
      <Text font={fontUrl} fontSize={0.78} color={day ? '#1b2340' : '#ffffff'} anchorX="center" anchorY="middle" outlineWidth={day ? 0 : 0.012} outlineColor="#1b1446">
        Raison Joseph
      </Text>
      <Text font={fontUrl} position={[0, -0.6, 0]} fontSize={0.26} color={day ? '#b4471f' : '#ffd27a'} anchorX="center" anchorY="middle">
        Senior Front End Developer, Kochi
      </Text>
    </Billboard>
  )
}

const PALMS: [number, number, number, number, number][] = [
  // x, z, height, lean, rotation
  [-4.8, 2.6, 2.3, 0.3, 2.8],
  [-5.4, -2.4, 2.1, 0.3, 3.4],
  [-4.2, -4.4, 2.4, 0.25, 3.9],
  [0.6, -5.8, 2.2, 0.35, -1.6],
  [3.6, 4.6, 2.1, 0.3, 0.9],
  [5.6, 2.6, 2.3, 0.3, 0.3],
  [2.2, 5.6, 1.9, 0.35, 1.3],
  [-0.8, 5.4, 2.0, 0.3, 1.8],
  [4.4, 1.0, 1.7, 0.2, 0.1],
  [-1.6, -1.6, 1.6, 0.2, 2.4],
]

function Scene({
  onSelect,
  phase,
  walkTarget,
  marker,
  onGround,
  onNear,
  meteors,
  onMeteorsDone,
  onSecret,
}: {
  onSelect: (s: Spot) => void
  reduce: boolean
  phase: Phase
  walkTarget: React.RefObject<THREE.Vector3>
  marker: THREE.Vector3 | null
  onGround: (p: THREE.Vector3) => void
  onNear: (id: Spot | null) => void
  meteors: boolean
  onMeteorsDone: () => void
  onSecret: () => void
}) {
  return (
    <>
      <Atmosphere phase={phase} />
      <SkyBody phase={phase} onSecret={onSecret} />
      <Clouds phase={phase} />
      <Birds phase={phase} />
      <MeteorShower active={meteors} onDone={onMeteorsDone} />

      <Ground phase={phase} onGround={onGround} />
      <Name phase={phase} />
      {/* pedestal in the middle of the island */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.05, 0.4, 24]} />
        <meshStandardMaterial color="#d9d3c4" flatShading />
      </mesh>
      <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 40]} />
        <meshStandardMaterial color="#f4c95d" emissive="#ffb84d" emissiveIntensity={0.35} />
      </mesh>
      <Walker target={walkTarget} onAbout={() => onSelect('about')} onNear={onNear} />
      <WalkMarker at={marker} />

      <Infopark onSelect={onSelect} phase={phase} />
      <MarineDrive onSelect={onSelect} phase={phase} />
      <FortKochi onSelect={onSelect} />
      <QueensWalkway onSelect={onSelect} phase={phase} />
      <Houseboat />
      <Cat position={[1.35, 0, 1.1]} />
      {PALMS.map(([x, z, h, lean, rot], i) => (
        <Palm key={i} position={[x, 0, z]} h={h} lean={lean} rot={rot} />
      ))}
      <Fireflies phase={phase} />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.3} scale={16} blur={2.4} far={4} />
    </>
  )
}

function Loader() {
  const { progress, active } = useProgress()
  return (
    <AnimatePresence>
      {active && (
        <motion.div className="w-loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <p>Building the island</p>
          <div className="w-loader-bar">
            <span style={{ width: `${Math.round(progress)}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const NAV: { id: Spot; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Case studies' },
  { id: 'career', label: 'Career' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

const TIME_LABEL: Record<TimeMode, string> = { auto: 'Auto', day: 'Day', dusk: 'Dusk', night: 'Night' }
const TIME_ORDER: TimeMode[] = ['auto', 'day', 'dusk', 'night']

export default function World() {
  const [spot, setSpot] = useState<Spot | null>(null)
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [interacted, setInteracted] = useState(false)
  const [mode, setMode] = useState<TimeMode>('auto')
  const [autoPhase, setAutoPhase] = useState<Phase>(phaseNow)
  const phase: Phase = mode === 'auto' ? autoPhase : mode
  const [near, setNear] = useState<Spot | null>(null)
  const [marker, setMarker] = useState<THREE.Vector3 | null>(null)
  const [meteors, setMeteors] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const walkTarget = useRef(new THREE.Vector3(0, 0, 0))

  // keep the automatic phase in step with the clock
  useEffect(() => {
    const id = setInterval(() => setAutoPhase(phaseNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  const walkTo = useCallback((x: number, z: number) => {
    walkTarget.current.set(x, 0, z)
  }, [])

  // clicking a landmark opens it and walks the avatar over
  const select = useCallback(
    (s: Spot) => {
      setSpot(s)
      setInteracted(true)
      const l = LANDMARKS.find((m) => m.id === s)
      if (l) {
        const len = Math.hypot(l.pos[0], l.pos[1]) || 1
        walkTo(l.pos[0] - (l.pos[0] / len) * 1.1, l.pos[1] - (l.pos[1] / len) * 1.1)
      }
    },
    [walkTo],
  )

  const onGround = useCallback(
    (p: THREE.Vector3) => {
      setInteracted(true)
      setSpot(null)
      walkTo(p.x, p.z)
      setMarker(p)
    },
    [walkTo],
  )

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSpot(null)
      if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter') && near && !spot) setSpot(near)
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) setInteracted(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [near, spot])

  const nearLabel = LANDMARKS.find((l) => l.id === near)?.label

  return (
    <div className="w-root" data-phase={phase}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 46, 62], fov: 42 }}
        onPointerDown={() => setInteracted(true)}
        onPointerMissed={() => setSpot(null)}
      >
        <Suspense fallback={null}>
          <Scene
            onSelect={select}
            reduce={reduce}
            phase={phase}
            walkTarget={walkTarget}
            marker={marker}
            onGround={onGround}
            onNear={setNear}
            meteors={meteors}
            onMeteorsDone={() => setMeteors(false)}
            onSecret={() => {
              setMeteors(true)
              showToast('Secret found: meteor shower!')
            }}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={4}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.08}
          autoRotate={!spot && !interacted && !reduce}
          autoRotateSpeed={0.5}
          enableDamping
        />
        <CameraRig spot={spot} reduce={reduce} />
      </Canvas>

      <Loader />

      <header className="w-top">
        <div>
          <p className="w-name">Raison Joseph</p>
          <p className="w-role">Senior Front End Developer</p>
        </div>
        <div className="w-top-right">
          <button
            className="w-time"
            onClick={() => setMode(TIME_ORDER[(TIME_ORDER.indexOf(mode) + 1) % TIME_ORDER.length])}
            aria-label={`Time of day: ${TIME_LABEL[mode]}. Click to change.`}
          >
            <span className={`w-time-dot ${phase}`} aria-hidden />
            {TIME_LABEL[mode]}
            {mode === 'auto' ? <span className="w-time-sub">Kerala time</span> : null}
          </button>
          <a className="w-simple" href="/">
            Simple version
          </a>
        </div>
      </header>

      <AnimatePresence>
        {!interacted && !spot && (
          <motion.p
            className="w-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
          >
            Welcome to Kochi. Click the ground to walk, or use the arrow keys.
          </motion.p>
        )}
        {near && !spot && nearLabel && (
          <motion.button
            key="near"
            className="w-prompt"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            onClick={() => setSpot(near)}
          >
            <kbd>E</kbd> Open {nearLabel}
          </motion.button>
        )}
        {toast && (
          <motion.div
            key="toast"
            className="w-toast"
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="w-nav" aria-label="Places on the island">
        {NAV.map((n) => (
          <button key={n.id} className={'w-chip' + (spot === n.id ? ' active' : '')} onClick={() => select(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>

      <AnimatePresence>{spot && <Panel key={spot} spot={spot} onClose={() => setSpot(null)} />}</AnimatePresence>
    </div>
  )
}
