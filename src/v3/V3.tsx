import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useInView, useScroll, useSpring } from 'framer-motion'
import { ABOUT, ACHIEVEMENTS, CONTACT_EMAIL, EXPERIENCE, GITHUB_URL, LINKEDIN_URL, PHONE, PHONE_HREF, PROJECTS, SKILLS, type Job } from '../data'
import './v3.css'

const ease = [0.22, 1, 0.36, 1] as const

const HEADLINE = ['I build the hard parts', 'of product front ends:', 'billing, editors, canvases.']

function Hero() {
  return (
    <section className="y-hero">
      <h1 className="y-headline" aria-label={HEADLINE.join(' ')}>
        {HEADLINE.map((line, i) => (
          <span className="y-mask" key={line} aria-hidden>
            <motion.span
              className="y-line"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.9, ease }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h1>
      <motion.div
        className="y-hero-foot"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease }}
      >
        <p className="y-intro">
          I’m Raison Joseph, a senior front end developer with seven years of React and TypeScript behind me.
        </p>
        <p className="y-now">
          <span className="y-pulse" aria-hidden />
          Currently at Poptin, working remotely
        </p>
        <div className="y-actions">
          <a className="y-btn" href="#career">
            See my career
          </a>
          <a className="y-btn ghost" href={`mailto:${CONTACT_EMAIL}`}>
            Email me
          </a>
        </div>
      </motion.div>
    </section>
  )
}

function JobEntry({ job, onActive }: { job: Job; onActive: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (inView) onActive()
  }, [inView, onActive])

  return (
    <article ref={ref} className="y-job">
      <p className="y-job-dates">{job.end ? `${job.start} – ${job.end}` : job.start}</p>
      <h3 className="y-job-company">{job.company}</h3>
      <p className="y-job-role">
        {job.role}
        {job.note ? `, ${job.note.toLowerCase()}` : ''}
        {job.place ? `. ${job.place}` : ''}
      </p>
      <ul className="y-job-points">
        {job.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </article>
  )
}

function Career() {
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start center', 'end center'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  const job = EXPERIENCE[active]
  const label = active === 0 ? 'Now' : String(job.startYear)

  return (
    <section className="y-career" id="career" ref={sectionRef}>
      <div className="y-rail">
        <div className="y-rail-inner">
          <p className="y-rail-title">Career</p>
          <div className="y-year" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={label}
                initial={{ y: '60%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-60%', opacity: 0 }}
                transition={{ duration: 0.45, ease }}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="y-rail-company">{job.company}</p>
        </div>
      </div>

      <div className="y-jobs">
        <div className="y-track" aria-hidden>
          <motion.div className="y-track-fill" style={{ scaleY: progress }} />
        </div>
        {EXPERIENCE.map((j, i) => (
          <JobEntry key={j.id} job={j} onActive={() => setActive(i)} />
        ))}
      </div>
    </section>
  )
}

export default function V3() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="y-page">
        <header className="y-nav">
          <span className="y-nav-name">Raison Joseph</span>
          <nav className="y-nav-links" aria-label="Sections">
            <a href="#career">Career</a>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <main>
          <Hero />
          <Career />

          <section className="y-section y-about" id="about">
            <h2 className="y-h2">About</h2>
            <div className="y-about-body">
              {ABOUT.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          </section>

          <section className="y-section" id="projects">
            <h2 className="y-h2">Side projects</h2>
            <p className="y-sub">Free practice sites I build and run on my own, from the code to SEO and ads.</p>
            <ul className="y-projects">
              {PROJECTS.map((p) => (
                <li key={p.id}>
                  <a href={p.url} target="_blank" rel="noreferrer" className="y-project">
                    <span className="y-project-name">{p.name}</span>
                    <span className="y-project-line">{p.line}</span>
                    <span className="y-project-domain">{p.domain}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="y-section y-facts">
            <div>
              <h2 className="y-h3">Tools I use daily</h2>
              <p>{SKILLS.join(', ')}</p>
            </div>
            <div>
              <h2 className="y-h3">Recognition</h2>
              <ul>
                {ACHIEVEMENTS.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="y-section y-contact" id="contact">
            <h2 className="y-h2">Let’s talk</h2>
            <a className="y-email" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            <p className="y-links">
              <a href={PHONE_HREF}>{PHONE}</a>
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </p>
          </section>
        </main>

        <footer className="y-footer">© {new Date().getFullYear()} Raison Joseph</footer>
      </div>
    </MotionConfig>
  )
}
