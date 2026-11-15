import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Text } from '@react-three/drei'
import fontUrl from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff?url'
import Hotspot from './Hotspot'
import type { Spot } from './Panel'
import type { Phase } from './alive'

/* Kochi, Kerala: Infopark, Marine Drive with the Rainbow Bridge, Fort Kochi beach with
   Chinese fishing nets, Queen's Walkway, coconut palms and a houseboat on the backwaters. */

const polar = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [Math.cos(a) * r, -Math.sin(a) * r]
}

/* ---------- window texture for buildings (lit at night) ---------- */
function useWindows(wall: string, glass: string, cols = 4, rows = 10) {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 160
    const g = c.getContext('2d')!
    g.fillStyle = wall
    g.fillRect(0, 0, 64, 160)
    const cw = 64 / cols
    const rh = 160 / rows
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        g.fillStyle = Math.random() > 0.25 ? glass : wall
        g.fillRect(x * cw + 3, y * rh + 4, cw - 6, rh - 7)
      }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.magFilter = THREE.NearestFilter
    return t
  }, [wall, glass, cols, rows])
}

function Building({
  position,
  size,
  wall,
  glass,
  lit,
  rows,
  roof = '#d9d3c4',
}: {
  position: [number, number, number]
  size: [number, number, number]
  wall: string
  glass: string
  lit: boolean
  rows?: number
  roof?: string
}) {
  const tex = useWindows(wall, glass, 4, rows ?? Math.round(size[1] * 4))
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive={lit ? '#ffd58a' : '#000000'} emissiveIntensity={lit ? 0.9 : 0} />
      </mesh>
      <mesh position={[0, size[1] + 0.04, 0]}>
        <boxGeometry args={[size[0] + 0.06, 0.08, size[2] + 0.06]} />
        <meshStandardMaterial color={roof} />
      </mesh>
    </group>
  )
}

/* ---------- coconut palm ---------- */
export function Palm({ position, h = 2.2, lean = 0.25, rot = 0 }: { position: [number, number, number]; h?: number; lean?: number; rot?: number }) {
  const fronds = useRef<THREE.Group>(null)
  const seed = useMemo(() => Math.random() * 10, [])
  useFrame(({ clock }) => {
    if (fronds.current) fronds.current.rotation.z = Math.sin(clock.elapsedTime * 1.2 + seed) * 0.05
  })
  const segs = 6
  return (
    <group position={position} rotation={[0, rot, 0]}>
      {Array.from({ length: segs }, (_, i) => {
        const t = i / segs
        return (
          <mesh key={i} position={[Math.pow(t, 1.6) * lean * h, t * h + h / segs / 2, 0]} rotation={[0, 0, -lean * 0.9 * t]} castShadow>
            <cylinderGeometry args={[0.07 - t * 0.02, 0.085 - t * 0.02, h / segs + 0.02, 6]} />
            <meshStandardMaterial color={i % 2 ? '#8a6a48' : '#9b7a55'} flatShading />
          </mesh>
        )
      })}
      <group ref={fronds} position={[lean * h, h + 0.05, 0]}>
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
            <mesh position={[0.5, -0.12, 0]} rotation={[0, 0, -0.45]} castShadow>
              <boxGeometry args={[1.05, 0.03, 0.26]} />
              <meshStandardMaterial color={i % 2 ? '#2e9a52' : '#3bb062'} flatShading />
            </mesh>
          </group>
        ))}
        {[0, 2.1, 4.2].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.1, -0.12, Math.sin(a) * 0.1]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#6b4a1f" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function StreetLamp({ position, on }: { position: [number, number, number]; on: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 1.1, 6]} />
        <meshStandardMaterial color="#2f3440" />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color={on ? '#ffe2a0' : '#e9e6dc'} emissive="#ffc861" emissiveIntensity={on ? 2.2 : 0} toneMapped={false} />
      </mesh>
      {on && <pointLight position={[0, 1.12, 0]} color="#ffc861" intensity={1.6} distance={2.6} />}
    </group>
  )
}

/* ---------- ground: island, beach ring and sea ---------- */
export function Ground({ phase, onGround }: { phase: Phase; onGround: (p: THREE.Vector3) => void }) {
  const sea = phase === 'day' ? '#2a9fd0' : phase === 'dusk' ? '#5b5a9e' : '#0f2350'
  const walk = (e: { delta: number; stopPropagation: () => void; point: THREE.Vector3 }) => {
    if (e.delta > 6) return
    e.stopPropagation()
    onGround(e.point.clone())
  }
  return (
    <group>
      {/* sea */}
      <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[70, 64]} />
        <meshStandardMaterial color={sea} roughness={0.25} metalness={0.15} />
      </mesh>
      <Sparkles count={80} scale={[30, 0.2, 30]} position={[0, -0.25, 0]} size={2.5} speed={0.3} color="#ffffff" opacity={0.6} />
      {/* beach ring */}
      <mesh position={[0, -0.18, 0]} receiveShadow onClick={walk}>
        <cylinderGeometry args={[7, 7.4, 0.28, 48]} />
        <meshStandardMaterial color="#ead39a" flatShading />
      </mesh>
      {/* land */}
      <mesh position={[0, -0.05, 0]} receiveShadow onClick={walk}>
        <cylinderGeometry args={[6.1, 6.3, 0.14, 48]} />
        <meshStandardMaterial color="#5fae5f" flatShading />
      </mesh>
    </group>
  )
}

/* ---------- Infopark: case studies ---------- */
export function Infopark({ onSelect, phase }: { onSelect: (s: Spot) => void; phase: Phase }) {
  const lit = phase !== 'day'
  return (
    <Hotspot id="work" label="Infopark: case studies" position={[-2.3, 0, -3.2]} labelPos={[0, 4, 0]} onSelect={onSelect}>
      {(hover) => (
        <>
          <Building position={[0, 0, 0]} size={[1.1, 3.2, 1.1]} wall="#1f4f6e" glass={hover ? '#bfe7ff' : '#79c5ec'} lit={lit} />
          <Building position={[-1.1, 0, 0.9]} size={[0.9, 2.3, 0.9]} wall="#2a5f7f" glass="#8fd3f2" lit={lit} />
          <Building position={[0.9, 0, 1.1]} size={[0.8, 1.6, 0.8]} wall="#3b6f8e" glass="#a6dcf4" lit={lit} />
          {/* plaza */}
          <mesh position={[0, 0.03, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[1.9, 24]} />
            <meshStandardMaterial color="#cfd5db" />
          </mesh>
          <Text font={fontUrl} position={[0, 3.45, 0.56]} fontSize={0.2} color={lit ? '#ffe2a0' : '#ffffff'} anchorX="center">
            Infopark
          </Text>
        </>
      )}
    </Hotspot>
  )
}

/* ---------- Marine Drive: promenade, apartments, Rainbow Bridge, career posts ---------- */
const CAREER = ['2024  Poptin', '2024  Storepecker', '2023  Buy Me a Coffee', '2019  Entri']

function RainbowBridge() {
  const colors = ['#e94b3c', '#f39c32', '#f6d14b', '#49b86b', '#3d8fd6', '#7a5ad8']
  return (
    <group>
      {colors.map((c, i) => (
        <mesh key={c} position={[0, 0.06, 0]}>
          <torusGeometry args={[1.25 - i * 0.07, 0.035, 6, 32, Math.PI]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[2.7, 0.08, 0.5]} />
        <meshStandardMaterial color="#e3ddd0" />
      </mesh>
      {[-1.25, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.3, 0]}>
          <boxGeometry args={[0.1, 0.6, 0.5]} />
          <meshStandardMaterial color="#d6cfc0" />
        </mesh>
      ))}
    </group>
  )
}

export function MarineDrive({ onSelect, phase }: { onSelect: (s: Spot) => void; phase: Phase }) {
  const lit = phase !== 'day'
  // promenade runs along the east shore, from -45° to 50°
  const path = Array.from({ length: 15 }, (_, i) => 5 + i * 5.7)
  return (
    <Hotspot id="career" label="Marine Drive: career" position={[0, 0, 0]} labelPos={[3.6, 3.8, -3.6]} onSelect={onSelect}>
      {(hover) => (
        <>
          {/* walkway tiles */}
          {path.map((deg) => {
            const [x, z] = polar(5.35, deg)
            return (
              <mesh key={deg} position={[x, 0.04, z]} rotation={[0, (deg * Math.PI) / 180, 0]} receiveShadow>
                <boxGeometry args={[0.9, 0.06, 0.62]} />
                <meshStandardMaterial color={hover ? '#f0e2c4' : '#d9cdb5'} />
              </mesh>
            )
          })}
          {/* railing posts on the water side */}
          {path.map((deg) => {
            const [x, z] = polar(5.85, deg)
            return (
              <mesh key={`r${deg}`} position={[x, 0.22, z]}>
                <cylinderGeometry args={[0.02, 0.02, 0.36, 4]} />
                <meshStandardMaterial color="#f2f2f2" />
              </mesh>
            )
          })}
          {/* lamps */}
          {[14, 37, 60, 82].map((deg) => {
            const [x, z] = polar(5.85, deg)
            return <StreetLamp key={deg} position={[x, 0, z]} on={lit} />
          })}
          {/* apartments behind the promenade */}
          {[
            [22, 3.9, 2.6, '#f1e4cf'],
            [40, 4.0, 3.3, '#e8d7c7'],
            [62, 3.9, 2.9, '#efe0d6'],
            [80, 3.7, 2.2, '#e2d6c2'],
          ].map(([deg, r, h, c]) => {
            const [x, z] = polar(r as number, deg as number)
            return <Building key={deg as number} position={[x, 0, z]} size={[0.85, h as number, 0.85]} wall={c as string} glass="#7aa8c6" lit={lit} />
          })}
          {/* Rainbow Bridge over the promenade */}
          <group position={[...(() => {
            const [x, z] = polar(5.35, 48)
            return [x, 0, z] as [number, number, number]
          })()]} rotation={[0, (48 * Math.PI) / 180 + Math.PI / 2, 0]}>
            <RainbowBridge />
          </group>
          {/* career signposts along the walk */}
          {CAREER.map((text, i) => {
            const deg = 10 + i * 22
            const [x, z] = polar(4.75, deg)
            return (
              <group key={text} position={[x, 0, z]} rotation={[0, (deg * Math.PI) / 180 - Math.PI / 2, 0]}>
                <mesh position={[0, 0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.04, 0.05, 1, 6]} />
                  <meshStandardMaterial color="#7b5537" />
                </mesh>
                <mesh position={[0, 1, 0]} castShadow>
                  <boxGeometry args={[1.5, 0.32, 0.05]} />
                  <meshStandardMaterial color={i === 0 ? '#f4c95d' : '#f3ead6'} emissive={hover ? '#ffb84d' : '#000'} emissiveIntensity={hover ? 0.3 : 0} />
                </mesh>
                {[1, -1].map((s) => (
                  <Text
                    key={s}
                    font={fontUrl}
                    position={[0, 1, 0.03 * s]}
                    rotation={[0, s === 1 ? 0 : Math.PI, 0]}
                    fontSize={0.13}
                    color="#3a2a17"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {text}
                  </Text>
                ))}
              </group>
            )
          })}
        </>
      )}
    </Hotspot>
  )
}

/* ---------- Fort Kochi beach: Chinese fishing nets = live projects ---------- */
function FishingNet({ deg, color, phaseOffset }: { deg: number; color: string; phaseOffset: number }) {
  const arm = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    // slow dip into the water and back up
    if (arm.current) arm.current.rotation.z = -0.55 + (Math.sin(clock.elapsedTime * 0.5 + phaseOffset) * 0.5 + 0.5) * 0.45
  })
  const [x, z] = polar(6.75, deg)
  return (
    <group position={[x, 0, z]} rotation={[0, (deg * Math.PI) / 180, 0]}>
      {/* wooden platform */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.7]} />
        <meshStandardMaterial color="#7b5537" />
      </mesh>
      {/* A-frame */}
      {[-0.22, 0.22].map((zz) => (
        <mesh key={zz} position={[0, 0.55, zz]} rotation={[zz > 0 ? -0.25 : 0.25, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 1, 6]} />
          <meshStandardMaterial color="#5d4127" />
        </mesh>
      ))}
      {/* cantilever arm pivoting at the top of the frame */}
      <group ref={arm} position={[0, 1.02, 0]}>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.035, 2.8, 6]} />
          <meshStandardMaterial color="#6b4a2c" />
        </mesh>
        {/* counterweights at the back */}
        {[0, 0.12, -0.12].map((zz, i) => (
          <mesh key={i} position={[-0.45, -0.25 - i * 0.06, zz]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#8f8a80" flatShading />
          </mesh>
        ))}
        {/* net frame and mesh at the front end */}
        <group position={[2.25, -0.2, 0]}>
          {[0.8, -0.8].map((r) => (
            <mesh key={r} rotation={[r, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 1.5, 4]} />
              <meshStandardMaterial color="#6b4a2c" />
            </mesh>
          ))}
          <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.05, 1.05, 6, 6]} />
            <meshStandardMaterial color={color} wireframe />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export function FortKochi({ onSelect }: { onSelect: (s: Spot) => void }) {
  return (
    <Hotspot id="projects" label="Fort Kochi: live projects" position={[0, 0, 0]} labelPos={[-6.4, 2.8, 0]} onSelect={onSelect}>
      {() => (
        <>
          {/* wide sandy beach on the west/north shore */}
          <mesh position={[-4.9, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[1.9, 24]} />
            <meshStandardMaterial color="#ead39a" />
          </mesh>
          <FishingNet deg={160} color="#c9b6ff" phaseOffset={0} />
          <FishingNet deg={180} color="#9ee4ff" phaseOffset={1.4} />
          <FishingNet deg={200} color="#a6ffcf" phaseOffset={2.8} />
        </>
      )}
    </Hotspot>
  )
}

/* ---------- Queen's Walkway: palms, benches, India Post box = contact ---------- */
export function QueensWalkway({ onSelect, phase }: { onSelect: (s: Spot) => void; phase: Phase }) {
  const lit = phase !== 'day'
  const tiles = Array.from({ length: 10 }, (_, i) => 215 + i * 5.5)
  return (
    <Hotspot id="contact" label="Queen's Walkway: contact" position={[0, 0, 0]} labelPos={[-2.1, 2.1, 3.7]} onSelect={onSelect}>
      {(hover) => (
        <>
          {tiles.map((deg) => {
            const [x, z] = polar(4.9, deg)
            return (
              <mesh key={deg} position={[x, 0.04, z]} rotation={[0, (deg * Math.PI) / 180, 0]} receiveShadow>
                <boxGeometry args={[0.7, 0.05, 0.5]} />
                <meshStandardMaterial color={deg % 11 < 5.5 ? '#c96b4a' : '#dca07e'} />
              </mesh>
            )
          })}
          {[218, 240, 262].map((deg) => {
            const [x, z] = polar(5.55, deg)
            return <StreetLamp key={deg} position={[x, 0, z]} on={lit} />
          })}
          {/* benches */}
          {[228, 252].map((deg) => {
            const [x, z] = polar(4.2, deg)
            return (
              <group key={deg} position={[x, 0, z]} rotation={[0, (deg * Math.PI) / 180 + Math.PI / 2, 0]}>
                <mesh position={[0, 0.25, 0]}>
                  <boxGeometry args={[0.7, 0.05, 0.22]} />
                  <meshStandardMaterial color="#8a5a36" />
                </mesh>
                <mesh position={[0, 0.4, -0.1]}>
                  <boxGeometry args={[0.7, 0.2, 0.04]} />
                  <meshStandardMaterial color="#8a5a36" />
                </mesh>
                {[-0.3, 0.3].map((xx) => (
                  <mesh key={xx} position={[xx, 0.12, 0]}>
                    <boxGeometry args={[0.04, 0.24, 0.2]} />
                    <meshStandardMaterial color="#3b3346" />
                  </mesh>
                ))}
              </group>
            )
          })}
          {/* India Post box */}
          <group position={[...(() => {
            const [x, z] = polar(4.25, 240)
            return [x, 0, z] as [number, number, number]
          })()]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.24, 0.9, 16]} />
              <meshStandardMaterial color="#d83a2e" emissive="#ff4a3a" emissiveIntensity={hover ? 0.5 : 0.05} />
            </mesh>
            <mesh position={[0, 0.94, 0]} castShadow>
              <sphereGeometry args={[0.235, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#d83a2e" emissive="#ff4a3a" emissiveIntensity={hover ? 0.5 : 0.05} />
            </mesh>
            <mesh position={[0, 0.66, 0.215]}>
              <boxGeometry args={[0.2, 0.03, 0.03]} />
              <meshStandardMaterial color="#1b1b1b" />
            </mesh>
            <mesh position={[0, 0.45, 0.23]}>
              <boxGeometry args={[0.16, 0.12, 0.01]} />
              <meshStandardMaterial color="#f4c95d" />
            </mesh>
          </group>
        </>
      )}
    </Hotspot>
  )
}

/* ---------- Kerala houseboat drifting on the backwaters ---------- */
export function Houseboat() {
  const boat = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.04
    if (!boat.current) return
    boat.current.position.set(Math.cos(t) * 10.5, -0.28 + Math.sin(clock.elapsedTime * 1.3) * 0.03, Math.sin(t) * 10.5)
    boat.current.rotation.y = -t
  })
  return (
    <group ref={boat}>
      {/* hull */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.22, 2.6]} />
        <meshStandardMaterial color="#5a3b22" />
      </mesh>
      {[1.4, -1.4].map((z) => (
        <mesh key={z} position={[0, 0.1, z]} rotation={[z > 0 ? -0.6 : 0.6, 0, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.5]} />
          <meshStandardMaterial color="#5a3b22" />
        </mesh>
      ))}
      {/* thatched roof */}
      <mesh position={[0, 0.32, -0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 1.9, 12, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#c9a26a" side={THREE.DoubleSide} flatShading />
      </mesh>
      <mesh position={[0, 0.22, -0.1]}>
        <boxGeometry args={[0.7, 0.18, 1.8]} />
        <meshStandardMaterial color="#e9dcc0" />
      </mesh>
    </group>
  )
}
