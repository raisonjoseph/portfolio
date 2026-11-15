import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import {
  ABOUT,
  ABOUT_SHORT,
  ACHIEVEMENTS,
  CONTACT_EMAIL,
  EXPERIENCE,
  GITHUB_URL,
  LINKEDIN_URL,
  PHONE,
  PHONE_HREF,
  PROJECTS,
  ROLE,
  SKILLS,
} from '../data'
import './bento.css'

const ease = [0.22, 1, 0.36, 1] as const

function Tile({
  className,
  index,
  children,
  as = 'div',
}: {
  className: string
  index: number
  children: React.ReactNode
  as?: 'div' | 'section'
}) {
  const Comp = as === 'section' ? motion.section : motion.div
  return (
    <Comp
      className={'b-tile ' + className}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.6, ease }}
    >
      {children}
    </Comp>
  )
}

function yearRange(start: string, end: string) {
  if (!end) return start
  const a = start.split(' ')[1]
  const b = end === 'Present' ? 'now' : end.split(' ')[1]
  return a === b ? a : `${a} – ${b}`
}

function LocalTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const t = setInterval(() => setTime(fmt()), 15_000)
    return () => clearInterval(t)
  }, [])
  return <span className="b-time">{time}</span>
}

function AboutTile() {
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className="b-about-inner" transition={{ duration: 0.4, ease }}>
      <p className="b-label">About</p>
      <motion.p layout="position" className="b-about-lead">
        {ABOUT[0]}
      </motion.p>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="more"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease }}
            className="b-about-more"
          >
            {ABOUT.slice(1).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button layout="position" className="b-more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? 'Show less' : 'Read the full story'}
      </motion.button>
    </motion.div>
  )
}

export default function Bento() {
  const now = EXPERIENCE[0]
  const store = EXPERIENCE.find((j) => j.id === 'storepecker')!
  let i = 0

  return (
    <MotionConfig reducedMotion="user">
      <div className="b-page">
        <header className="b-nav">
          <span className="b-nav-name">Raison Joseph</span>
          <a className="b-nav-cta" href={`mailto:${CONTACT_EMAIL}`}>
            Get in touch
          </a>
        </header>

        <main className="b-grid">
          <Tile className="b-intro" index={i++}>
            <span className="b-avatar" aria-hidden>
              RJ
            </span>
            <h1 className="b-name">Raison Joseph</h1>
            <p className="b-role">{ROLE}</p>
            <p className="b-short">{ABOUT_SHORT}</p>
            <div className="b-actions">
              <a className="b-btn" href={`mailto:${CONTACT_EMAIL}`}>
                Email me
              </a>
              <a className="b-btn ghost" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </Tile>

          <Tile className="b-now dark" index={i++}>
            <p className="b-label">
              <span className="b-pulse" aria-hidden /> Currently
            </p>
            <p className="b-big">{now.company}</p>
            <p className="b-sub">{now.role}, remote</p>
            <ul className="b-mini">
              {now.points.slice(0, 3).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Tile>

          <Tile className="b-years accent" index={i++}>
            <p className="b-years-num">7</p>
            <p className="b-years-text">years building with React and TypeScript</p>
          </Tile>

          <Tile className="b-place" index={i++}>
            <p className="b-label">Based in</p>
            <p className="b-mid">Kerala, India</p>
            <p className="b-sub">
              Local time <LocalTime />
            </p>
          </Tile>

          <Tile className="b-career" index={i++}>
            <p className="b-label">Career</p>
            <ol className="b-career-list">
              {EXPERIENCE.map((j) => (
                <li key={j.id}>
                  <span className="b-career-co">{j.company}</span>
                  <span className="b-career-role">{j.role}</span>
                  <span className="b-career-date">{yearRange(j.start, j.end)}</span>
                </li>
              ))}
            </ol>
          </Tile>

          <Tile className="b-founder" index={i++}>
            <p className="b-label">Founded</p>
            <p className="b-mid">{store.company}</p>
            <p className="b-founder-text">{store.points[0]}</p>
          </Tile>

          <Tile className="b-stack" index={i++}>
            <p className="b-label">Stack</p>
            <p className="b-mid">React, TypeScript and Next.js, every day.</p>
            <div className="b-marquee" aria-label={SKILLS.join(', ')}>
              <motion.div
                className="b-marquee-track"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
                aria-hidden
              >
                {[...SKILLS, ...SKILLS].map((s, k) => (
                  <span key={k} className="b-chip">
                    {s}
                  </span>
                ))}
              </motion.div>
            </div>
          </Tile>

          <Tile className="b-about" index={i++} as="section">
            <AboutTile />
          </Tile>

          {PROJECTS.map((p, k) => (
            <Tile key={p.id} className={`b-project b-project-${k}`} index={i++}>
              <a href={p.url} target="_blank" rel="noreferrer" className="b-project-link">
                <p className="b-label">Side project</p>
                <p className="b-project-name">{p.name}</p>
                <p className="b-sub">{p.line}</p>
                <span className="b-project-domain">{p.domain}</span>
              </a>
            </Tile>
          ))}

          <Tile className="b-wins" index={i++}>
            <p className="b-label">Recognition</p>
            <ul className="b-mini">
              {ACHIEVEMENTS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Tile>

          <Tile className="b-contact dark" index={i++}>
            <p className="b-label">Contact</p>
            <a className="b-contact-email" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            <div className="b-contact-row">
              <a href={PHONE_HREF}>{PHONE}</a>
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </Tile>
        </main>

        <footer className="b-footer">© {new Date().getFullYear()} Raison Joseph</footer>
      </div>
    </MotionConfig>
  )
}
