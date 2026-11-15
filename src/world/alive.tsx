import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Sparkles, Stars, useCursor } from '@react-three/drei'
import type { Spot } from './Panel'
import Character from './Character'

/* ------------------------------------------------------------------ */
/* Time of day: follows the real time in Kerala unless overridden        */
/* ------------------------------------------------------------------ */
export type Phase = 'day' | 'dusk' | 'night'
export type TimeMode = 'auto' | Phase

export function phaseNow(): Phase {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()))
  if (h >= 7 && h < 17) return 'day'
  if ((h >= 17 && h < 19) || (h >= 5 && h < 7)) return 'dusk'
  return 'night'
}

export const SKY: Record<
  Phase,
  { bg: string; fog: string; hemiSky: string; hemiGround: string; hemi: number; sun: number; sunColor: string; lamp: number }
> = {
  day: { bg: '#8fc3ff', fog: '#cfe4ff', hemiSky: '#ffffff', hemiGround: '#7a9a6a', hemi: 1.05, sun: 2.4, sunColor: '#fff1d6', lamp: 0 },
  dusk: { bg: '#4b2f6b', fog: '#e8927a', hemiSky: '#ffc4a3', hemiGround: '#4a3550', hemi: 0.8, sun: 1.7, sunColor: '#ffad75', lamp: 1.4 },
  night: { bg: '#0b1026', fog: '#120f33', hemiSky: '#c6ceff', hemiGround: '#3a2f4a', hemi: 0.6, sun: 0.75, sunColor: '#b9c7ff', lamp: 2.6 },
}

/** Lights, sky colour and fog, blended smoothly when the phase changes. */
export function Atmosphere({ phase }: { phase: Phase }) {
  const { scene } = useThree()
  const hemi = useRef<THREE.HemisphereLight>(null)
  const sun = useRef<THREE.DirectionalLight>(null)
  const target = SKY[phase]
  const tmp = useMemo(
    () => ({ bg: new THREE.Color(), fog: new THREE.Color(), sky: new THREE.Color(), ground: new THREE.Color(), sun: new THREE.Color() }),
    [],
  )

  useEffect(() => {
    scene.background = new THREE.Color(SKY[phase].bg)
    scene.fog = new THREE.Fog(SKY[phase].fog, 22, 50)
    // run once for the initial phase only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.02, dt)
    if (scene.background instanceof THREE.Color) scene.background.lerp(tmp.bg.set(target.bg), k)
    if (scene.fog instanceof THREE.Fog) scene.fog.color.lerp(tmp.fog.set(target.fog), k)
    if (hemi.current) {
      hemi.current.color.lerp(tmp.sky.set(target.hemiSky), k)
      hemi.current.groundColor.lerp(tmp.ground.set(target.hemiGround), k)
      hemi.current.intensity = THREE.MathUtils.lerp(hemi.current.intensity, target.hemi, k)
    }
    if (sun.current) {
      sun.current.color.lerp(tmp.sun.set(target.sunColor), k)
      sun.current.intensity = THREE.MathUtils.lerp(sun.current.intensity, target.sun, k)
    }
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={[SKY[phase].hemiSky, SKY[phase].hemiGround, SKY[phase].hemi]} />
      <directionalLight
        ref={sun}
        position={[6, 12, 6]}
        intensity={SKY[phase].sun}
        color={SKY[phase].sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      {phase !== 'day' && <Stars radius={60} depth={30} count={phase === 'night' ? 2500 : 900} factor={3} saturation={0.4} fade speed={0.6} />}
    </>
  )
}

/** The sun by day, the moon otherwise. Click it 5 times for a secret. */
export function SkyBody({ phase, onSecret }: { phase: Phase; onSecret: () => void }) {
  const clicks = useRef(0)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const isSun = phase === 'day'
  return (
    <mesh
      position={isSun ? [12, 13, -18] : [-14, 11, -22]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation()
        clicks.current += 1
        if (clicks.current >= 5) {
          clicks.current = 0
          onSecret()
        }
      }}
    >
      <sphereGeometry args={[isSun ? 2.3 : 2, 32, 32]} />
      <meshBasicMaterial color={isSun ? '#ffe27a' : phase === 'dusk' ? '#ffd2a1' : '#fff1c9'} toneMapped={false} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Scenery that moves                                                    */
/* ------------------------------------------------------------------ */
function Cloud({ position, scale, phase }: { position: [number, number, number]; scale: number; phase: Phase }) {
  const color = phase === 'day' ? '#ffffff' : phase === 'dusk' ? '#ffc7b0' : '#4b4f7a'
  return (
    <group position={position} scale={scale}>
      {[
        [0, 0, 0, 1],
        [0.9, -0.15, 0.2, 0.75],
        [-0.85, -0.2, -0.1, 0.7],
        [0.3, 0.35, -0.2, 0.7],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={color} flatShading transparent opacity={phase === 'night' ? 0.55 : 0.92} />
        </mesh>
      ))}
    </group>
  )
}

export function Clouds({ phase }: { phase: Phase }) {
  const ring = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.y += dt * 0.02
  })
  return (
    <group ref={ring}>
      <Cloud position={[17, 12, 3]} scale={1.8} phase={phase} />
      <Cloud position={[-15, 13, -9]} scale={2.2} phase={phase} />
      <Cloud position={[-7, 14, 18]} scale={1.6} phase={phase} />
      <Cloud position={[9, 15, -16]} scale={2} phase={phase} />
      <Cloud position={[-19, 11, 8]} scale={1.5} phase={phase} />
    </group>
  )
}

function Bird({ radius, height, speed, offset }: { radius: number; height: number; speed: number; offset: number }) {
  const bird = useRef<THREE.Group>(null)
  const left = useRef<THREE.Mesh>(null)
  const right = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset
    if (bird.current) {
      bird.current.position.set(Math.cos(t) * radius, height + Math.sin(t * 2) * 0.4, Math.sin(t) * radius)
      bird.current.rotation.y = -t
    }
    const flap = Math.sin(clock.elapsedTime * 10 + offset) * 0.6
    if (left.current) left.current.rotation.z = flap
    if (right.current) right.current.rotation.z = -flap
  })
  return (
    <group ref={bird}>
      <mesh>
        <boxGeometry args={[0.18, 0.05, 0.06]} />
        <meshBasicMaterial color="#2b2b3a" />
      </mesh>
      <mesh ref={left} position={[0, 0, 0.25]}>
        <boxGeometry args={[0.04, 0.02, 0.5]} />
        <meshBasicMaterial color="#2b2b3a" />
      </mesh>
      <mesh ref={right} position={[0, 0, -0.25]}>
        <boxGeometry args={[0.04, 0.02, 0.5]} />
        <meshBasicMaterial color="#2b2b3a" />
      </mesh>
    </group>
  )
}

export function Birds({ phase }: { phase: Phase }) {
  if (phase === 'night') return null
  return (
    <>
      <Bird radius={9} height={6.5} speed={0.35} offset={0} />
      <Bird radius={9.6} height={6.8} speed={0.35} offset={0.25} />
      <Bird radius={8.5} height={6.2} speed={0.35} offset={0.5} />
    </>
  )
}

export function Fireflies({ phase }: { phase: Phase }) {
  if (phase === 'day') return null
  return (
    <>
      <Sparkles count={30} scale={[3, 2, 3]} position={[-4, 1.2, -2]} size={4} speed={0.5} color="#e8ff8a" />
      <Sparkles count={20} scale={[2.5, 1.5, 2.5]} position={[4.6, 1, -2.4]} size={4} speed={0.5} color="#e8ff8a" />
      <Sparkles count={20} scale={[3, 1.5, 3]} position={[-1.8, 1, 4.2]} size={4} speed={0.5} color="#e8ff8a" />
    </>
  )
}

/** Pond on the island with water spilling over the edge. */
export function Waterfall() {
  const count = 60
  const mesh = useRef<THREE.InstancedMesh>(null)
  const drops = useMemo(
    () => Array.from({ length: count }, () => ({ y: Math.random() * -6, x: (Math.random() - 0.5) * 0.7, z: Math.random() * 0.2, v: 2 + Math.random() * 1.5 })),
    [],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame((_, dt) => {
    if (!mesh.current) return
    drops.forEach((d, i) => {
      d.y -= d.v * dt
      if (d.y < -6) d.y = 0
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.setScalar(1 - Math.min(1, -d.y / 7))
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  // pond sits at the left-back edge; the fall drops from the rim
  const angle = 2.55
  const edge = 6.25
  return (
    <group>
      <mesh position={[Math.cos(angle) * 4.9, 0.015, -Math.sin(angle) * 4.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 24]} />
        <meshStandardMaterial color="#4fb6e8" emissive="#2a8fd0" emissiveIntensity={0.3} />
      </mesh>
      <group position={[Math.cos(angle) * edge, -0.1, -Math.sin(angle) * edge]} rotation={[0, angle - Math.PI / 2, 0]}>
        <mesh position={[0, -1.6, 0.05]}>
          <planeGeometry args={[0.8, 3.2]} />
          <meshStandardMaterial color="#7fd0ff" transparent opacity={0.55} side={THREE.DoubleSide} emissive="#4fb6e8" emissiveIntensity={0.4} />
        </mesh>
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial color="#d6f1ff" />
        </instancedMesh>
      </group>
    </group>
  )
}

/** A sleeping cat. Click it to say hello. */
export function Cat({ position }: { position: [number, number, number] }) {
  const body = useRef<THREE.Group>(null)
  const [meow, setMeow] = useState(false)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const spin = useRef(0)
  useFrame(({ clock }, dt) => {
    if (!body.current) return
    const breathe = 1 + Math.sin(clock.elapsedTime * 2) * 0.04
    body.current.scale.set(1, breathe, 1)
    if (spin.current > 0) {
      const step = Math.min(spin.current, dt * 10)
      body.current.rotation.y += step
      spin.current -= step
    }
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
        spin.current = Math.PI * 2
        setMeow(true)
        setTimeout(() => setMeow(false), 1600)
      }}
    >
      <group ref={body}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 12]} />
          <meshStandardMaterial color="#f0a35e" flatShading />
        </mesh>
        <mesh position={[0.2, 0.22, 0.05]} castShadow>
          <sphereGeometry args={[0.13, 14, 10]} />
          <meshStandardMaterial color="#f0a35e" flatShading />
        </mesh>
        {[-0.06, 0.06].map((z) => (
          <mesh key={z} position={[0.24, 0.34, 0.05 + z]}>
            <coneGeometry args={[0.04, 0.09, 4]} />
            <meshStandardMaterial color="#e08a42" flatShading />
          </mesh>
        ))}
        <mesh position={[-0.2, 0.06, 0.1]} rotation={[0, 0.6, Math.PI / 2.2]}>
          <capsuleGeometry args={[0.04, 0.3, 4, 8]} />
          <meshStandardMaterial color="#e08a42" />
        </mesh>
      </group>
      {meow && (
        <Html position={[0.2, 0.75, 0]} center>
          <span className="w-bubble">meow</span>
        </Html>
      )}
      {!meow && (
        <Html position={[0.25, 0.55, 0]} center style={{ pointerEvents: 'none' }}>
          <span className="w-zzz">z z</span>
        </Html>
      )}
    </group>
  )
}

/** Meteor shower easter egg. */
export function MeteorShower({ active, onDone }: { active: boolean; onDone: () => void }) {
  const group = useRef<THREE.Group>(null)
  const meteors = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        start: new THREE.Vector3(-20 + Math.random() * 40, 16 + Math.random() * 8, -20 + Math.random() * 10),
        delay: Math.random() * 3,
      })),
    [],
  )
  const t0 = useRef(0)
  useEffect(() => {
    if (active) t0.current = performance.now()
  }, [active])
  useFrame(() => {
    if (!active || !group.current) return
    const t = (performance.now() - t0.current) / 1000
    group.current.children.forEach((m, i) => {
      const lt = t - meteors[i].delay
      const p = meteors[i].start
      m.visible = lt > 0 && lt < 1.4
      m.position.set(p.x + lt * 14, p.y - lt * 12, p.z)
    })
    if (t > 5) onDone()
  })
  if (!active) return null
  return (
    <group ref={group}>
      {meteors.map((_, i) => (
        <mesh key={i} rotation={[0, 0, Math.PI / 4.4]} visible={false}>
          <cylinderGeometry args={[0.02, 0.07, 2.4, 6]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Walking avatar                                                        */
/* ------------------------------------------------------------------ */
export const LANDMARKS: { id: Spot; pos: [number, number]; label: string }[] = [
  { id: 'work', pos: [-1.8, -1.6], label: 'Infopark: case studies' },
  { id: 'career', pos: [2.9, -2.9], label: 'Marine Drive: career' },
  { id: 'projects', pos: [-5.4, 0], label: 'Fort Kochi: live projects' },
  { id: 'contact', pos: [-1.9, 3.0], label: "Queen's Walkway: contact" },
]

const ISLAND_RADIUS = 6.6

export function Walker({
  target,
  onAbout,
  onNear,
}: {
  target: React.RefObject<THREE.Vector3>
  onAbout: () => void
  onNear: (id: Spot | null) => void
}) {
  const root = useRef<THREE.Group>(null)
  const turn = useRef<THREE.Group>(null)
  const pos = useRef(new THREE.Vector3(0, 0, 0))
  const keys = useRef<Set<string>>(new Set())
  const near = useRef<Spot | null>(null)
  const walking = useRef(false)
  const waveAt = useRef(-10)
  const yaw = useRef(0)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const { camera, clock } = useThree()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        keys.current.add(k)
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase())
    const clear = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  useFrame((_, dt) => {
    if (!root.current || !turn.current || !target.current) return
    const k = keys.current
    if (k.size) {
      // move relative to where the camera is looking
      const fwd = new THREE.Vector3()
      camera.getWorldDirection(fwd)
      fwd.y = 0
      fwd.normalize()
      const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0))
      const dir = new THREE.Vector3()
      if (k.has('w') || k.has('arrowup')) dir.add(fwd)
      if (k.has('s') || k.has('arrowdown')) dir.sub(fwd)
      if (k.has('d') || k.has('arrowright')) dir.add(right)
      if (k.has('a') || k.has('arrowleft')) dir.sub(right)
      if (dir.lengthSq() > 0) target.current.copy(pos.current).addScaledVector(dir.normalize(), 0.5)
    }
    // keep on the island
    const t = target.current
    const r = Math.hypot(t.x, t.z)
    if (r > ISLAND_RADIUS) t.multiplyScalar(ISLAND_RADIUS / r)

    const delta = new THREE.Vector3(t.x - pos.current.x, 0, t.z - pos.current.z)
    const dist = delta.length()
    const moving = dist > 0.05
    walking.current = moving
    if (moving) {
      const step = Math.min(dist, 2.4 * dt)
      pos.current.addScaledVector(delta.clone().normalize(), step)
      yaw.current = Math.atan2(delta.x, delta.z)
    } else {
      // idle: turn to face the camera
      yaw.current = Math.atan2(camera.position.x - pos.current.x, camera.position.z - pos.current.z)
    }
    const onPedestal = Math.hypot(pos.current.x, pos.current.z) < 0.95
    const baseY = onPedestal ? 0.45 : 0
    root.current.position.set(pos.current.x, THREE.MathUtils.damp(root.current.position.y, baseY, 12, dt), pos.current.z)
    // shortest-path turn
    let diff = yaw.current - turn.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    turn.current.rotation.y += diff * Math.min(1, dt * (moving ? 12 : 4))

    // which landmark are we standing next to?
    let found: Spot | null = null
    for (const l of LANDMARKS) {
      if (Math.hypot(pos.current.x - l.pos[0], pos.current.z - l.pos[1]) < 1.7) found = l.id
    }
    if (found !== near.current) {
      near.current = found
      onNear(found)
    }
  })

  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
      <group
        ref={turn}
        scale={1.5}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => {
          e.stopPropagation()
          waveAt.current = clock.elapsedTime
          onAbout()
        }}
      >
        <Character walking={walking} waveAt={waveAt} />
      </group>
      <Html position={[0, 3.15, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <span className={'w-label' + (hover ? ' hover' : '')}>About me</span>
      </Html>
    </group>
  )
}

/** Small ring that shows where you clicked to walk. */
export function WalkMarker({ at }: { at: THREE.Vector3 | null }) {
  const ring = useRef<THREE.Mesh>(null)
  const born = useRef(0)
  useEffect(() => {
    born.current = performance.now()
  }, [at])
  useFrame(() => {
    if (!ring.current || !at) return
    const t = (performance.now() - born.current) / 600
    ring.current.visible = t < 1
    ring.current.scale.setScalar(0.4 + t * 0.8)
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 1 - t
  })
  if (!at) return null
  return (
    <mesh ref={ring} position={[at.x, 0.03, at.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.35, 0.45, 32]} />
      <meshBasicMaterial color="#ffd27a" transparent />
    </mesh>
  )
}
