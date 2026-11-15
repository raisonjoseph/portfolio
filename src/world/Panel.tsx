import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ABOUT,
  ACHIEVEMENTS,
  CASE_STUDIES,
  CONTACT_EMAIL,
  CV_URL,
  EXPERIENCE,
  GITHUB_URL,
  LINKEDIN_URL,
  PHONE,
  PHONE_HREF,
  PROJECTS,
  SKILLS,
} from '../data'
import { track } from '../analytics'

export type Spot = 'about' | 'work' | 'career' | 'projects' | 'contact'

const ease = [0.22, 1, 0.36, 1] as const

const TITLES: Record<Spot, string> = {
  about: 'About me',
  work: 'Case studies',
  career: 'Career trail',
  projects: 'Live projects',
  contact: 'Contact',
}

function Work() {
  const [open, setOpen] = useState<string | null>(CASE_STUDIES[0].id)
  return (
    <ul className="w-list">
      {CASE_STUDIES.map((c) => {
        const isOpen = open === c.id
        return (
          <li key={c.id} className="w-item">
            <button className="w-item-head" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen}>
              <span className="w-meta">
                {c.company}, {c.year}
              </span>
              <span className="w-item-title">{c.title}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="w-item-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <p>{c.context}</p>
                  <ul>
                    {c.built.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <p className="w-meta">{c.stack.join(', ')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}

function Career() {
  return (
    <ol className="w-trail">
      {EXPERIENCE.map((j, i) => (
        <motion.li
          key={j.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease }}
        >
          <span className="w-meta">{j.end ? `${j.start} – ${j.end}` : j.start}</span>
          <span className="w-item-title">{j.company}</span>
          <span className="w-role-line">
            {j.role}
            {j.note ? `, ${j.note.toLowerCase()}` : ''}
          </span>
          <ul>
            {j.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </motion.li>
      ))}
    </ol>
  )
}

function Projects() {
  return (
    <ul className="w-projects">
      {PROJECTS.map((p, i) => (
        <motion.li
          key={p.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease }}
        >
          <a href={p.url} target="_blank" rel="noreferrer" className={`w-project p${i}`}>
            <span className="w-item-title">{p.name}</span>
            <span className="w-role-line">{p.line}</span>
            <span className="w-domain">{p.domain}</span>
          </a>
        </motion.li>
      ))}
    </ul>
  )
}

function About() {
  return (
    <div className="w-about">
      {ABOUT.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <ul className="w-tags">
        {SKILLS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <ul className="w-ach">
        {ACHIEVEMENTS.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </div>
  )
}

function Contact() {
  return (
    <div className="w-contact">
      <a className="w-email" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>
      <div className="w-contact-links">
        <a href={PHONE_HREF}>{PHONE}</a>
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
      <a className="w-cv" href={CV_URL} download onClick={() => track('cv_download', { cv_location: 'world' })}>
        Download CV
      </a>
    </div>
  )
}

export default function Panel({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])
  return (
    <motion.aside
      className="w-panel"
      role="dialog"
      aria-label={TITLES[spot]}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.45, ease }}
    >
      <div className="w-panel-head">
        <h2>{TITLES[spot]}</h2>
        <button ref={closeRef} className="w-close" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </div>
      <div className="w-panel-body">
        {spot === 'about' && <About />}
        {spot === 'work' && <Work />}
        {spot === 'career' && <Career />}
        {spot === 'projects' && <Projects />}
        {spot === 'contact' && <Contact />}
      </div>
    </motion.aside>
  )
}
