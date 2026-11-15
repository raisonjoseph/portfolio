import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Billboard, useTexture } from '@react-three/drei'

/* Low-poly chibi version of Raison: curly dark hair, beard and moustache, grey tee, watch.
   Feet sit at y = 0, about 1.8 units tall. Drive it with the `walking` and `waveAt` refs. */

const SKIN = '#c98a5f'
const SHIRT = '#6e737d'
const JEANS = '#2f3a56'

function Std({ color, flat = true }: { color: string; flat?: boolean }) {
  return <meshStandardMaterial color={color} flatShading={flat} roughness={0.8} />
}

export default function Character({
  walking,
  waveAt,
}: {
  walking: React.RefObject<boolean>
  waveAt: React.RefObject<number>
}) {
  const body = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Mesh>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const faceTex = useTexture('/avatar-head.png')
  faceTex.colorSpace = THREE.SRGBColorSpace
  const walkPhase = useRef(0)
  const nextBlink = useRef(2)

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const isWalking = walking.current
    if (isWalking) walkPhase.current += dt * 9
    const swing = isWalking ? Math.sin(walkPhase.current) : 0
    const damp = (cur: number, to: number, l = 12) => THREE.MathUtils.damp(cur, to, l, dt)

    if (legL.current) legL.current.rotation.x = damp(legL.current.rotation.x, swing * 0.7)
    if (legR.current) legR.current.rotation.x = damp(legR.current.rotation.x, -swing * 0.7)

    // wave for 1.6s after a click
    const waving = t - waveAt.current < 1.6
    if (armL.current) {
      armL.current.rotation.x = damp(armL.current.rotation.x, -swing * 0.6)
      armL.current.rotation.z = damp(armL.current.rotation.z, 0.08)
    }
    if (armR.current) {
      armR.current.rotation.x = damp(armR.current.rotation.x, waving ? 0 : swing * 0.6)
      armR.current.rotation.z = damp(armR.current.rotation.z, waving ? -2.6 + Math.sin(t * 16) * 0.35 : -0.08, waving ? 20 : 12)
    }

    if (body.current) {
      const bob = isWalking ? Math.abs(Math.sin(walkPhase.current)) * 0.05 : 0
      body.current.position.y = damp(body.current.position.y, bob, 20)
      body.current.rotation.z = damp(body.current.rotation.z, isWalking ? Math.sin(walkPhase.current) * 0.04 : Math.sin(t * 0.8) * 0.015, 8)
    }
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 2.2) * 0.02
    if (head.current) head.current.rotation.x = damp(head.current.rotation.x, waving ? -0.12 : Math.sin(t * 1.1) * 0.03, 6)

    // bobblehead wobble: a little extra bounce when walking or waving
    if (eyes.current) {
      const wobble = isWalking ? Math.sin(walkPhase.current * 2) * 0.06 : waving ? Math.sin(t * 16) * 0.08 : Math.sin(t * 1.4) * 0.02
      eyes.current.rotation.z = damp(eyes.current.rotation.z, wobble, 14)
      if (t > nextBlink.current) nextBlink.current = t + 3
    }
  })

  return (
    <group ref={body}>
      {/* legs */}
      {[
        [legL, -0.1],
        [legR, 0.1],
      ].map(([ref, x]) => (
        <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.62, 0]}>
          <mesh position={[0, -0.27, 0]} castShadow>
            <capsuleGeometry args={[0.078, 0.36, 4, 8]} />
            <Std color={JEANS} />
          </mesh>
          <mesh position={[0, -0.57, 0.04]} castShadow>
            <boxGeometry args={[0.15, 0.09, 0.26]} />
            <Std color="#f1f1f1" />
          </mesh>
        </group>
      ))}

      {/* torso */}
      <mesh ref={torso} position={[0, 0.87, 0]} scale={[1, 1, 0.78]} castShadow>
        <capsuleGeometry args={[0.215, 0.28, 6, 12]} />
        <Std color={SHIRT} />
      </mesh>
      {/* v-neck */}
      <mesh position={[0, 1.04, 0.15]} rotation={[0.25, 0, Math.PI]}>
        <coneGeometry args={[0.07, 0.12, 3]} />
        <Std color={SKIN} />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.065, 0.075, 0.12, 10]} />
        <Std color={SKIN} />
      </mesh>

      {/* arms */}
      {[
        [armL, -0.27, true],
        [armR, 0.27, false],
      ].map(([ref, x, watch]) => (
        <group key={x as number} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 1.03, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.095, 12, 10]} />
            <Std color={SHIRT} />
          </mesh>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.058, 0.28, 4, 8]} />
            <Std color={SKIN} />
          </mesh>
          <mesh position={[0, -0.43, 0]} castShadow>
            <sphereGeometry args={[0.068, 10, 8]} />
            <Std color={SKIN} />
          </mesh>
          {watch && (
            <mesh position={[0, -0.34, 0]}>
              <cylinderGeometry args={[0.066, 0.066, 0.05, 12]} />
              <Std color="#16181d" flat={false} />
            </mesh>
          )}
        </group>
      ))}

      {/* head: Raison's real face from the 3D avatar, always facing the camera */}
      <group ref={head} position={[0, 1.56, 0]}>
        <Billboard>
          <group ref={eyes}>
            <mesh>
              <planeGeometry args={[0.8, 0.99]} />
              <meshBasicMaterial map={faceTex} transparent alphaTest={0.1} toneMapped={false} />
            </mesh>
          </group>
        </Billboard>
      </group>
    </group>
  )
}
