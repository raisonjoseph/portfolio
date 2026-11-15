import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import type { Spot } from './Panel'

/** Clickable landmark: lifts slightly on hover and shows a floating label. */
export default function Hotspot({
  id,
  label,
  position,
  labelPos = [0, 2.2, 0],
  onSelect,
  children,
}: {
  id: Spot
  label?: string
  position: [number, number, number]
  labelPos?: [number, number, number]
  onSelect: (s: Spot) => void
  children: (hover: boolean) => React.ReactNode
}) {
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const group = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!group.current) return
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, hover ? 0.08 : 0, 10, dt)
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
        <Html position={labelPos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <span className={'w-label' + (hover ? ' hover' : '')}>{label}</span>
        </Html>
      )}
    </group>
  )
}
