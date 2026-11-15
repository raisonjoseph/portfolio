import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Billboard,
  ContactShadows,
  Float,
  Html,
  OrbitControls,
  Sparkles,
  Stars,
  Text,
  useCursor,
  useProgress,
  useTexture,
} from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import fontUrl from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff?url'
import Panel, { type Spot } from './Panel'
import './world.css'

/* ------------------------------------------------------------------ */
/* Camera stops for each landmark                                       */
/* ------------------------------------------------------------------ */
const STOPS: Record<Spot | 'home', { pos: [number, number, number]; target: [number, number, number] }> = {
  home: { pos: [10, 6.5, 12], target: [0, 1.4, 0] },
  about: { pos: [0.5, 2.6, 5.6], target: [0, 1.7, 0] },
  work: { pos: [-7.2, 3.2, 5.6], target: [-3.3, 1.2, 1.5] },
  career: { pos: [8.4, 3.6, 2.4], target: [3.6, 1.1, -0.6] },
  projects: { pos: [0.4, 3.4, 4.2], target: [0, 1.7, -3.6] },
  contact: { pos: [6.6, 2.8, 8], target: [3.3, 1, 3.3] },
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

/* ------------------------------------------------------------------ */
/* Clickable landmark: glows on hover, shows a floating label           */
/* ------------------------------------------------------------------ */
function Hotspot({
  id,
  label,
  position,
  labelY = 2.2,
  onSelect,
  children,
}: {
  id: Spot
  label?: string
  position: [number, number, number]
  labelY?: number
  onSelect: (s: Spot) => void
  children: (hover: boolean) => React.ReactNode
}) {
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const group = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!group.current) return
    const s = THREE.MathUtils.damp(group.current.scale.x, hover ? 1.08 : 1, 10, dt)
    group.current.scale.setScalar(s)
  })
  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
    >
      <group ref={group}>{children(hover)}</group>
      {label && (
        <Html position={[0, labelY, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <span className={'w-label' + (hover ? ' hover' : '')}>{label}</span>
        </Html>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Island and scenery                                                    */
/* ------------------------------------------------------------------ */
function Island() {
  return (
    <group>
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <cylinderGeometry args={[6.2, 6.5, 0.6, 40]} />
        <meshStandardMaterial color="#62b06d" flatShading />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[6.5, 6.3, 0.12, 40]} />
        <meshStandardMaterial color="#8a6a4b" flatShading />
      </mesh>
      <mesh position={[0, -2.75, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[6.3, 4.2, 16, 3]} />
        <meshStandardMaterial color="#6b5544" flatShading />
      </mesh>
      {/* stone path */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = -0.5 + i * 0.32
        return (
          <mesh key={i} position={[Math.cos(a) * 2.6, 0.02, Math.sin(a) * 2.6 + 0.4]} rotation={[0, a, 0]} receiveShadow>
            <cylinderGeometry args={[0.32, 0.36, 0.06, 7]} />
            <meshStandardMaterial color="#c9c2b4" flatShading />
          </mesh>
        )
      })}
    </group>
  )
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.8, 6]} />
        <meshStandardMaterial color="#6b4a33" flatShading />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <coneGeometry args={[0.55, 1.1, 7]} />
        <meshStandardMaterial color="#2f8f5b" flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.4, 0.8, 7]} />
        <meshStandardMaterial color="#38a868" flatShading />
      </mesh>
    </group>
  )
}

function Rock({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  return (
    <mesh position={position} scale={s} castShadow>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#8f8a99" flatShading />
    </mesh>
  )
}

function Lantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshStandardMaterial color="#3b3346" />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb84d" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.05, 0]} color="#ffbf66" intensity={2.2} distance={3.2} decay={2} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Landmarks                                                             */
/* ------------------------------------------------------------------ */
function Avatar({ onSelect }: { onSelect: (s: Spot) => void }) {
  const tex = useTexture('/avatar-3d.png')
  tex.colorSpace = THREE.SRGBColorSpace
  return (
    <Hotspot id="about" label="About me" position={[0, 0, 0]} labelY={0.75} onSelect={onSelect}>
      {(hover) => (
        <>
          <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.9, 1.05, 0.44, 24]} />
            <meshStandardMaterial color="#d9d3c4" flatShading />
          </mesh>
          <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.9, 40]} />
            <meshStandardMaterial color={hover ? '#ffe08a' : '#f4c95d'} emissive="#ffb84d" emissiveIntensity={hover ? 0.9 : 0.35} />
          </mesh>
          <Billboard position={[0, 1.95, 0]}>
            <mesh>
              <planeGeometry args={[3, 3]} />
              <meshBasicMaterial map={tex} transparent alphaTest={0.08} toneMapped={false} />
            </mesh>
          </Billboard>
        </>
      )}
    </Hotspot>
  )
}

function Workshop({ onSelect }: { onSelect: (s: Spot) => void }) {
  return (
    <Hotspot id="work" label="Case studies" position={[-3.3, 0, 1.5]} labelY={2.3} onSelect={onSelect}>
      {(hover) => (
        <group rotation={[0, 0.7, 0]}>
          {/* desk */}
          <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 0.1, 1]} />
            <meshStandardMaterial color="#a8774f" flatShading />
          </mesh>
          {[-0.9, 0.9].map((x) =>
            [-0.4, 0.4].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 0.38, z]} castShadow>
                <boxGeometry args={[0.08, 0.76, 0.08]} />
                <meshStandardMaterial color="#7b5537" />
              </mesh>
            )),
          )}
          {/* monitor */}
          <mesh position={[0, 1.42, -0.2]} castShadow>
            <boxGeometry args={[1.35, 0.85, 0.07]} />
            <meshStandardMaterial color="#1d2130" />
          </mesh>
          <mesh position={[0, 1.42, -0.16]}>
            <planeGeometry args={[1.23, 0.73]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive={hover ? '#7cc0ff' : '#3b82f6'}
              emissiveIntensity={hover ? 2.2 : 1.3}
              toneMapped={false}
            />
          </mesh>
          {/* code lines on screen */}
          {[0.2, 0.08, -0.04, -0.16].map((y, i) => (
            <mesh key={y} position={[-0.25 + (i % 2) * 0.08, 1.42 + y, -0.15]}>
              <planeGeometry args={[0.6 - i * 0.08, 0.04]} />
              <meshBasicMaterial color="#e6f0ff" toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 0.92, -0.2]}>
            <boxGeometry args={[0.08, 0.2, 0.08]} />
            <meshStandardMaterial color="#1d2130" />
          </mesh>
          <mesh position={[0, 0.85, 0.2]}>
            <boxGeometry args={[0.8, 0.03, 0.28]} />
            <meshStandardMaterial color="#e8e6f0" />
          </mesh>
          {/* mug */}
          <mesh position={[0.75, 0.9, 0.15]}>
            <cylinderGeometry args={[0.07, 0.06, 0.15, 12]} />
            <meshStandardMaterial color="#e0574c" />
          </mesh>
          <pointLight position={[0, 1.4, 0.4]} color="#5fa8ff" intensity={hover ? 4 : 2} distance={3} />
        </group>
      )}
    </Hotspot>
  )
}

const POSTS = [
  { text: '2024  Poptin', x: 2.6, z: 1.4 },
  { text: '2024  Storepecker', x: 3.5, z: 0.2 },
  { text: '2023  Buy Me a Coffee', x: 3.9, z: -1.1 },
  { text: '2019  Entri', x: 3.6, z: -2.4 },
]
function CareerTrail({ onSelect }: { onSelect: (s: Spot) => void }) {
  return (
    <Hotspot id="career" position={[0, 0, 0]} onSelect={onSelect}>
      {(hover) => (
        <>
          {POSTS.map((p, i) => (
            <group key={p.text} position={[p.x, 0, p.z]} rotation={[0, -1.2 + i * 0.12, 0]}>
              <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.06, 1.2, 6]} />
                <meshStandardMaterial color="#7b5537" />
              </mesh>
              <mesh position={[0, 1.15, 0]} castShadow>
                <boxGeometry args={[1.7, 0.36, 0.06]} />
                <meshStandardMaterial
                  color={i === 0 ? '#f4c95d' : '#e9dcc0'}
                  emissive={hover ? '#ffb84d' : '#000000'}
                  emissiveIntensity={hover ? 0.35 : 0}
                />
              </mesh>
              <Text font={fontUrl} position={[0, 1.15, 0.035]} fontSize={0.15} color="#3a2a17" anchorX="center" anchorY="middle">
                {p.text}
              </Text>
              <Text
                font={fontUrl}
                position={[0, 1.15, -0.035]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.15}
                color="#3a2a17"
                anchorX="center"
                anchorY="middle"
              >
                {p.text}
              </Text>
            </group>
          ))}
          <Html position={[3.6, 2.1, -0.6]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <span className={'w-label' + (hover ? ' hover' : '')}>Career trail</span>
          </Html>
        </>
      )}
    </Hotspot>
  )
}

function Portal({ color, x, rot }: { color: string; x: number; rot: number }) {
  const ring = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.z += dt * rot
    if (core.current) core.current.rotation.z -= dt * rot * 1.6
  })
  return (
    <group position={[x, 1.55, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[0.62, 0.07, 12, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh ref={core}>
        <circleGeometry args={[0.56, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.32, 0.4, 0.5, 8]} />
        <meshStandardMaterial color="#8f8a99" flatShading />
      </mesh>
      <pointLight color={color} intensity={3} distance={3} />
    </group>
  )
}
function Portals({ onSelect }: { onSelect: (s: Spot) => void }) {
  return (
    <Hotspot id="projects" label="Live projects" position={[0, 0, -3.6]} labelY={3.05} onSelect={onSelect}>
      {() => (
        <>
          <Portal color="#8f7dff" x={-1.7} rot={0.8} />
          <Portal color="#45c4ff" x={0} rot={-0.6} />
          <Portal color="#5ef2a8" x={1.7} rot={0.7} />
          <Sparkles count={40} scale={[5, 2.5, 1.5]} position={[0, 1.6, 0]} size={3} speed={0.4} color="#d6ccff" />
        </>
      )}
    </Hotspot>
  )
}

function Mailbox({ onSelect }: { onSelect: (s: Spot) => void }) {
  const flag = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (flag.current) flag.current.rotation.z = -0.3 + Math.sin(clock.elapsedTime * 2) * 0.25
  })
  return (
    <Hotspot id="contact" label="Contact" position={[3.3, 0, 3.3]} labelY={1.9} onSelect={onSelect}>
      {(hover) => (
        <group rotation={[0, -0.6, 0]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#7b5537" />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow>
            <boxGeometry args={[0.7, 0.42, 0.42]} />
            <meshStandardMaterial color="#e0574c" emissive="#ff6b5b" emissiveIntensity={hover ? 0.6 : 0.1} flatShading />
          </mesh>
          <mesh position={[0, 1.26, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.21, 0.21, 0.7, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#e0574c" emissive="#ff6b5b" emissiveIntensity={hover ? 0.6 : 0.1} flatShading />
          </mesh>
          <group ref={flag} position={[0.37, 1.1, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.03, 0.4, 0.03]} />
              <meshStandardMaterial color="#f4c95d" />
            </mesh>
            <mesh position={[0.08, 0.35, 0]}>
              <boxGeometry args={[0.16, 0.12, 0.02]} />
              <meshStandardMaterial color="#f4c95d" />
            </mesh>
          </group>
          {/* letter peeking out */}
          <mesh position={[-0.36, 1.1, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.02, 0.22, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={hover ? 0.6 : 0} />
          </mesh>
        </group>
      )}
    </Hotspot>
  )
}

function Name() {
  return (
    <Billboard position={[0, 4.75, -0.6]}>
      <Text font={fontUrl} fontSize={0.78} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#1b1446">
        Raison Joseph
      </Text>
      <Text font={fontUrl} position={[0, -0.6, 0]} fontSize={0.26} color="#ffd27a" anchorX="center" anchorY="middle">
        Senior Front End Developer
      </Text>
    </Billboard>
  )
}

function Scene({ onSelect, reduce }: { onSelect: (s: Spot) => void; reduce: boolean }) {
  return (
    <>
      <color attach="background" args={['#0b1026']} />
      <fog attach="fog" args={['#120f33', 22, 48]} />
      <hemisphereLight args={['#c6ceff', '#3a2f4a', 0.75]} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.6}
        color="#ffe7c2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <Stars radius={60} depth={30} count={2500} factor={3} saturation={0.4} fade speed={reduce ? 0 : 0.6} />
      <mesh position={[-14, 11, -22]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#fff1c9" toneMapped={false} />
      </mesh>

      <Float speed={reduce ? 0 : 1.1} rotationIntensity={0.06} floatIntensity={0.35} floatingRange={[-0.08, 0.08]}>
        <Island />
        <Name />
        <Avatar onSelect={onSelect} />
        <Workshop onSelect={onSelect} />
        <CareerTrail onSelect={onSelect} />
        <Portals onSelect={onSelect} />
        <Mailbox onSelect={onSelect} />
        <Tree position={[-4.6, 0, -1.6]} scale={1.2} />
        <Tree position={[-3.4, 0, -3.4]} />
        <Tree position={[-1.6, 0, 4.6]} scale={0.9} />
        <Tree position={[4.8, 0, -2.6]} scale={0.8} />
        <Tree position={[-5.2, 0, 1.4]} scale={0.8} />
        <Rock position={[1.6, 0.1, 4.6]} s={1.3} />
        <Rock position={[-2.2, 0.1, -4.6]} />
        <Rock position={[5.2, 0.08, 1.2]} s={0.8} />
        <Lantern position={[-1.6, 0, 2.6]} />
        <Lantern position={[1.9, 0, 2.2]} />
        <Lantern position={[-2.4, 0, -2.6]} />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={14} blur={2.4} far={4} />
      </Float>
      <Sparkles count={70} scale={[22, 10, 22]} position={[0, 3, 0]} size={2} speed={0.2} color="#ffe6a8" />
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

export default function World() {
  const [spot, setSpot] = useState<Spot | null>(null)
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSpot(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="w-root">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [16, 10, 18], fov: 42 }}
        onPointerDown={() => setInteracted(true)}
        onPointerMissed={() => setSpot(null)}
      >
        <Suspense fallback={null}>
          <Scene onSelect={setSpot} reduce={reduce} />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={4}
          maxDistance={24}
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
        <a className="w-simple" href="/">
          Simple version
        </a>
      </header>

      <AnimatePresence>
        {!interacted && !spot && (
          <motion.p
            className="w-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            Drag to look around. Click anything that glows.
          </motion.p>
        )}
      </AnimatePresence>

      <nav className="w-nav" aria-label="Places on the island">
        {NAV.map((n) => (
          <button key={n.id} className={'w-chip' + (spot === n.id ? ' active' : '')} onClick={() => setSpot(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>

      <AnimatePresence>{spot && <Panel key={spot} spot={spot} onClose={() => setSpot(null)} />}</AnimatePresence>
    </div>
  )
}
