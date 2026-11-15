import { useRef, useState } from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
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
import './editorial.css'

const ease = [0.22, 1, 0.36, 1] as const

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span className="e-word" style={{ opacity }}>
      {word}{' '}
    </motion.span>
  )
}

function Statement() {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = ABOUT_SHORT.split(' ')
  return (
    <p className="e-statement" ref={ref} aria-label={ABOUT_SHORT}>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </span>
    </p>
  )
}

function Marquee() {
  const items = ['React', 'Poptin', 'Vue', 'TypeScript', 'Buy Me a Coffee', 'Next.js', 'Entri', 'Storepecker', 'Node.js']
  const row = [...items, ...items]
  return (
    <div className="e-marquee" aria-hidden>
      <motion.div
        className="e-marquee-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
      >
        {row.map((t, i) => (
          <span key={i} className="e-marquee-item">
            {t}
            <span className="e-star">✳</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function WorkIndex() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <ul className="e-index" onMouseLeave={() => setOpen(null)}>
      {EXPERIENCE.map((j) => {
        const isOpen = open === j.id
        return (
          <li
            key={j.id}
            className={'e-row' + (isOpen ? ' open' : '') + (open && !isOpen ? ' dim' : '')}
            onMouseEnter={() => setOpen(j.id)}
          >
            <button className="e-row-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : j.id)}>
              <span className="e-row-year">{j.end ? j.start.split(' ')[1] ?? j.start : 'Freelance'}</span>
              <motion.span className="e-row-company" animate={{ x: isOpen ? 16 : 0 }} transition={{ duration: 0.35, ease }}>
                {j.company}
              </motion.span>
              <span className="e-row-role">{j.role}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="e-row-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <div className="e-row-inner">
                    <p className="e-row-dates">
                      {j.end ? `${j.start} – ${j.end}` : j.start}
                      {j.place ? `, ${j.place}` : ''}
                    </p>
                    <ul>
                      {j.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}

export default function Editorial() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="e-page">
        <header className="e-nav">
          <span>Raison Joseph</span>
          <nav aria-label="Sections">
            <a href="#about">About</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <main>
          <section className="e-hero">
            <h1 className="e-name" aria-label="Raison Joseph">
              {['Raison', 'Joseph'].map((w, i) => (
                <span className={'e-name-line' + (i === 1 ? ' right' : '')} key={w} aria-hidden>
                  <motion.span
                    className="e-name-inner"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.1 + i * 0.15, duration: 1, ease }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div
              className="e-meta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <p>{ROLE}</p>
              <p>Kerala, India</p>
              <p>Currently at Poptin</p>
            </motion.div>
          </section>

          <Marquee />

          <section className="e-section" id="about">
            <Statement />
            <div className="e-about-cols">
              {ABOUT.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="e-facts">
              <div>
                <h2 className="e-small-h">Tools</h2>
                <p>{SKILLS.join(', ')}</p>
              </div>
              <div>
                <h2 className="e-small-h">Recognition</h2>
                <ul>
                  {ACHIEVEMENTS.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="e-section" id="work">
            <h2 className="e-h2">Work</h2>
            <WorkIndex />
          </section>

          <section className="e-section">
            <h2 className="e-h2">Side projects</h2>
            <ul className="e-projects">
              {PROJECTS.map((p) => (
                <li key={p.id}>
                  <a href={p.url} target="_blank" rel="noreferrer" className="e-project">
                    <span className="e-project-name">{p.name}</span>
                    <span className="e-project-line">{p.line}</span>
                    <span className="e-project-domain">{p.domain}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="e-contact" id="contact">
            <p className="e-contact-kicker">Have a product that needs a careful front end?</p>
            <a className="e-contact-big" href={`mailto:${CONTACT_EMAIL}`}>
              Let’s talk
            </a>
            <div className="e-contact-grid">
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <a href={PHONE_HREF}>{PHONE}</a>
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </section>
        </main>

        <footer className="e-footer">© {new Date().getFullYear()} Raison Joseph</footer>
      </div>
    </MotionConfig>
  )
}
