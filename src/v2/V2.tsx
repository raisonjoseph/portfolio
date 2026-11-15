import { useLayoutEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ABOUT, ACHIEVEMENTS, CONTACT_EMAIL, EXPERIENCE, GITHUB_URL, LINKEDIN_URL, PHONE, PHONE_HREF, INTRO, PROJECTS, SKILLS } from '../data'
import './v2.css'

const ease = [0.22, 1, 0.36, 1] as const

/* ---------------- Hero canvas: draggable nodes joined by live edges ---------------- */

type NodeDef = {
  id: string
  tone?: 'start' | 'live'
  kicker: string
  title: string
  body?: string
  desk: [number, number]
  phone: [number, number]
}

const NODES: NodeDef[] = [
  {
    id: 'me',
    tone: 'start',
    kicker: 'Hello, I’m',
    title: 'Raison Joseph',
    body: 'Senior Front End Developer',
    desk: [0.03, 0.3],
    phone: [0.0, 0.03],
  },
  {
    id: 'stack',
    kicker: '7 years with',
    title: 'React and TypeScript',
    body: 'Next.js, Node.js and a bit of Django',
    desk: [0.39, 0.07],
    phone: [0.26, 0.28],
  },
  {
    id: 'now',
    tone: 'live',
    kicker: 'Right now',
    title: 'Poptin',
    body: 'Billing, the automation canvas and the email editor',
    desk: [0.71, 0.36],
    phone: [0.0, 0.53],
  },
  {
    id: 'side',
    kicker: 'On the side',
    title: '3 live practice sites',
    body: 'Typing, times tables and memory',
    desk: [0.39, 0.62],
    phone: [0.26, 0.78],
  },
]

const EDGES: [string, string][] = [
  ['me', 'stack'],
  ['me', 'side'],
  ['stack', 'now'],
]
const PHONE_EDGES: [string, string][] = [
  ['me', 'stack'],
  ['stack', 'now'],
  ['now', 'side'],
]

type NodeState = { x: MotionValue<number>; y: MotionValue<number>; w: MotionValue<number>; h: MotionValue<number> }

function Edge({ a, b, index, vertical }: { a: NodeState; b: NodeState; index: number; vertical: boolean }) {
  // Connect the source's output port to the target's input port, like a node editor.
  const d = useTransform([a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h], (v: number[]) => {
    const [ax, ay, aw, ah, bx, by, bw] = v
    if (vertical) {
      const x1 = ax + aw / 2
      const y1 = ay + ah
      const x2 = bx + bw / 2
      const y2 = by
      const k = Math.max(40, Math.abs(y2 - y1) / 2)
      return `M ${x1} ${y1} C ${x1} ${y1 + k}, ${x2} ${y2 - k}, ${x2} ${y2}`
    }
    const x1 = ax + aw
    const y1 = ay + ah / 2
    const x2 = bx
    const y2 = by + v[7] / 2
    const k = Math.max(50, Math.abs(x2 - x1) / 2)
    return `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`
  })
  return (
    <>
      <motion.path
        d={d}
        className="c-edge"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.9 + index * 0.25, duration: 0.7, ease: 'easeInOut' }}
      />
      <motion.path
        d={d}
        className="c-edge-flow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, strokeDashoffset: [0, -24] }}
        transition={{
          opacity: { delay: 1.7 + index * 0.25, duration: 0.4 },
          strokeDashoffset: { repeat: Infinity, duration: 1.4, ease: 'linear' },
        }}
      />
    </>
  )
}

function CanvasNode({
  def,
  state,
  index,
  bounds,
}: {
  def: NodeDef
  state: NodeState
  index: number
  bounds: React.RefObject<HTMLDivElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      state.w.set(el.offsetWidth)
      state.h.set(el.offsetHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [state])

  return (
    <motion.div
      ref={ref}
      className={'c-node' + (def.tone ? ` ${def.tone}` : '')}
      style={{ x: state.x, y: state.y }}
      drag
      dragConstraints={bounds}
      dragMomentum={false}
      dragElastic={0.08}
      whileDrag={{ scale: 1.03, boxShadow: '0 18px 40px rgba(20, 24, 33, 0.16)' }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.15, duration: 0.5, ease }}
    >
      <span className="c-port in" aria-hidden />
      <span className="c-port out" aria-hidden />
      <p className="c-kicker">
        {def.tone === 'live' && <span className="c-live" aria-hidden />}
        {def.kicker}
      </p>
      {index === 0 ? <h1 className="c-title big">{def.title}</h1> : <p className="c-title">{def.title}</p>}
      {def.body && <p className="c-body">{def.body}</p>}
    </motion.div>
  )
}

function HeroCanvas() {
  const boardRef = useRef<HTMLDivElement>(null)
  const states = useRef<Record<string, NodeState>>({})
  // Hooks must run in a fixed order, so create every node's motion values up front.
  const mv = NODES.map(() => ({
    x: useMotionValue(0),
    y: useMotionValue(0),
    w: useMotionValue(240),
    h: useMotionValue(110),
  }))
  NODES.forEach((n, i) => (states.current[n.id] = mv[i]))

  const [phoneLayout, setPhoneLayout] = useState(false)

  useLayoutEffect(() => {
    const el = boardRef.current
    if (!el) return
    const place = () => {
      const phone = el.offsetWidth < 680
      setPhoneLayout(phone)
      NODES.forEach((n) => {
        const s = states.current[n.id]
        const [fx, fy] = phone ? n.phone : n.desk
        s.x.set(Math.min(fx * el.offsetWidth, el.offsetWidth - s.w.get()))
        s.y.set(Math.min(fy * el.offsetHeight, el.offsetHeight - s.h.get()))
      })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  return (
    <div className={'c-board' + (phoneLayout ? ' phone' : '')} ref={boardRef}>
      <svg className="c-edges" aria-hidden>
        {(phoneLayout ? PHONE_EDGES : EDGES).map(([a, b], i) => (
          <Edge
            key={a + b + phoneLayout}
            a={states.current[a]}
            b={states.current[b]}
            index={i}
            vertical={phoneLayout}
          />
        ))}
      </svg>
      {NODES.map((n, i) => (
        <CanvasNode key={n.id} def={n} state={states.current[n.id]} index={i} bounds={boardRef} />
      ))}
      <motion.p
        className="c-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      >
        Drag the cards around
      </motion.p>
    </div>
  )
}

/* ---------------- Experience timeline ---------------- */

function Timeline() {
  const [openId, setOpenId] = useState<string | null>(EXPERIENCE[0].id)
  return (
    <ol className="t-list">
      {EXPERIENCE.map((j, i) => {
        const open = openId === j.id
        return (
          <li key={j.id} className={'t-item' + (i === 0 ? ' current' : '')}>
            <span className="t-dot" aria-hidden />
            <button
              className="t-head"
              aria-expanded={open}
              aria-controls={`t-${j.id}`}
              onClick={() => setOpenId(open ? null : j.id)}
            >
              <span className="t-dates">{j.end ? `${j.start} – ${j.end}` : j.start}</span>
              <span className="t-company">{j.company}</span>
              <span className="t-role">
                {j.role}
                {j.note ? `, ${j.note.toLowerCase()}` : ''}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={`t-${j.id}`}
                  className="t-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <ul>
                    {j.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ol>
  )
}

/* ---------------- Side projects ---------------- */

function Preview({ id }: { id: string }) {
  if (id === 'typing')
    return (
      <div className="p-prev p-keys" aria-hidden>
        {'asdfjkl;'.split('').map((c, i) => (
          <span key={i} className={i === 3 || i === 4 ? 'home' : ''}>
            {c}
          </span>
        ))}
      </div>
    )
  if (id === 'learn-my-tables')
    return (
      <div className="p-prev p-grid" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => {
          const r = Math.floor(i / 4) + 1
          const c = (i % 4) + 1
          return (
            <span key={i} className={r === c ? 'diag' : ''}>
              {r * c}
            </span>
          )
        })}
      </div>
    )
  return (
    <div className="p-prev p-time" aria-hidden>
      <span>231</span>
      <small>ms</small>
    </div>
  )
}

export default function V2() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="c-page">
        <header className="c-nav">
          <span className="c-nav-name">Raison Joseph</span>
          <nav className="c-nav-links" aria-label="Sections">
            <a href="#experience">Experience</a>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <main>
          <section className="c-hero">
            <HeroCanvas />
          </section>

          <section className="c-section c-split" id="experience">
            <div className="c-side">
              <h2 className="c-h2">Experience</h2>
              <p className="c-lead">{INTRO}</p>
              <ul className="c-skills" aria-label="Skills">
                {SKILLS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <Timeline />
          </section>

          <section className="c-section c-split" id="about">
            <div className="c-side">
              <h2 className="c-h2">About</h2>
            </div>
            <div className="c-about">
              {ABOUT.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          </section>

          <section className="c-section" id="projects">
            <h2 className="c-h2">Side projects</h2>
            <p className="c-lead narrow">Free practice sites I design, build and run myself, from code to SEO to ads.</p>
            <div className="p-cards">
              {PROJECTS.map((p) => (
                <a key={p.id} className="p-card" href={p.url} target="_blank" rel="noreferrer">
                  <Preview id={p.id} />
                  <span className="p-name">{p.name}</span>
                  <span className="p-line">{p.line}</span>
                  <span className="p-domain">{p.domain}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="c-section c-split" id="contact">
            <div className="c-side">
              <h2 className="c-h2">Say hello</h2>
              <p className="c-lead">Email is the quickest way to reach me.</p>
            </div>
            <div>
              <a className="c-email" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              <p className="c-links">
                <a href={PHONE_HREF}>{PHONE}</a>
                <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </p>
              <ul className="c-ach">
                {ACHIEVEMENTS.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        <footer className="c-footer">© {new Date().getFullYear()} Raison Joseph</footer>
      </div>
    </MotionConfig>
  )
}
