import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useAnimationControls } from 'framer-motion'
import { ABOUT, ACHIEVEMENTS, CONTACT_EMAIL, EXPERIENCE, GITHUB_URL, LINKEDIN_URL, CV_URL, PHONE, PHONE_HREF, PROJECTS, SKILLS } from '../data'
import CaseStudies from './CaseStudies'
import './v1.css'


type Question = { prompt: string; answer: string; wide?: boolean; memory?: boolean; right: string; site: string }

const MEMORY_MS = 3000

const WORDS = ['keyboard', 'type', 'speed', 'letters', 'fingers', 'practice', 'tables', 'memory', 'recall', 'quick']

const MATH_RIGHT = [
  'Right. Learn My Tables has 143 more.',
  'Correct, and quick too.',
  'Spot on. Try the whole grid next.',
  'Correct. That one trips a lot of people up.',
]
const WORD_RIGHT = [
  'Nice. Now type it at 80 words a minute.',
  'Right. The Typing Practice has lessons for the rest.',
  'Correct. Your fingers know it already.',
]

const MEMORY_RIGHT = [
  'Good memory. React & Recall has longer ones.',
  'Right. Now try it with your reaction time.',
  'Spot on. Most people drop a digit there.',
]

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

function scramble(word: string) {
  let out = word
  while (out === word) {
    out = word
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('')
  }
  return out
}

function makeQuestion(prev?: Question): Question {
  // Rotate: times table, then a typing word, then a memory number.
  const kind = !prev
    ? Math.random() < 0.6 ? 'math' : 'word'
    : prev.site === 'learn-my-tables' ? 'word' : prev.site === 'typing' ? 'memory' : 'math'

  if (kind === 'math') {
    let a = rand(2, 12)
    let b = rand(2, 12)
    while (prev && prev.prompt === `${a} × ${b} =`) [a, b] = [rand(2, 12), rand(2, 12)]
    return { prompt: `${a} × ${b} =`, answer: String(a * b), right: pick(MATH_RIGHT), site: 'learn-my-tables' }
  }
  if (kind === 'memory') {
    const digits = String(rand(1, 9)) + Array.from({ length: 4 }, () => rand(0, 9)).join('')
    return { prompt: 'Number →', answer: digits, wide: true, memory: true, right: pick(MEMORY_RIGHT), site: 'react-recall' }
  }
  let word = pick(WORDS)
  while (prev && prev.answer === word) word = pick(WORDS)
  return { prompt: `${scramble(word)} →`, answer: word, wide: true, right: pick(WORD_RIGHT), site: 'typing' }
}


const ease = [0.22, 1, 0.36, 1] as const

function HeroName() {
  const words = ['Raison', 'Joseph']
  let i = 0
  return (
    <h1 className="hero-name" aria-label="Raison Joseph">
      {words.map((w) => (
        <span className="word" key={w} aria-hidden>
          {w.split('').map((c) => {
            const d = 0.25 + i++ * 0.035
            return (
              <motion.span
                className="char"
                key={c + d}
                initial={{ y: '0.5em', opacity: 0, rotate: 6 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: d, duration: 0.7, ease }}
              >
                {c}
              </motion.span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

function Tick() {
  return (
    <svg className="tick" viewBox="0 0 64 64" aria-hidden>
      <motion.path
        d="M10 34 C16 38 20 44 24 52 C32 34 42 20 58 8"
        fill="none"
        stroke="var(--margin)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </svg>
  )
}

function Strike() {
  return (
    <svg className="strike" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden>
      <motion.path
        d="M2 9 C30 4 60 11 98 5"
        fill="none"
        stroke="var(--margin)"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </svg>
  )
}

function PracticeSheet({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const [index, setIndex] = useState(0)
  const [q, setQ] = useState(() => makeQuestion())
  const [value, setValue] = useState('')
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [showing, setShowing] = useState(false)
  const [streak, setStreak] = useState(0)
  const shake = useAnimationControls()

  useEffect(() => {
    if (!q.memory) return
    const t = setTimeout(() => setShowing(false), MEMORY_MS)
    return () => clearTimeout(t)
  }, [q])

  const check = (e: React.FormEvent) => {
    e.preventDefault()
    if (showing || !value.trim() || result) return
    if (value.trim().toLowerCase() === q.answer) {
      setResult('right')
      setStreak((n) => n + 1)
    } else {
      setResult('wrong')
      setStreak(0)
      shake.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.4 } })
    }
  }

  const next = () => {
    setIndex((i) => i + 1)
    const n = makeQuestion(q)
    setQ(n)
    setShowing(!!n.memory)
    setValue('')
    setResult(null)
  }

  const project = PROJECTS.find((p) => p.id === q.site)!

  return (
    <motion.form
      className="sheet"
      onSubmit={check}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1, duration: 0.6 }}
    >
      <p className="sheet-note" aria-hidden>
        go on, try one
      </p>

      <div className="sheet-top">
        <AnimatePresence mode="wait">
          <motion.span
            key={q.site}
            className="sheet-source"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            from {PROJECTS.find((p) => p.id === q.site)?.name}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence>
          {streak >= 2 && (
            <motion.span
              key={streak}
              className="sheet-streak"
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              aria-live="polite"
            >
              {streak} in a row!
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index + (showing ? '-show' : '')}
          className="question"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease }}
        >
          {showing ? (
            <span className="memorise">
              <span className="prompt digits">{q.answer}</span>
              <motion.span
                className="memory-timer"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: MEMORY_MS / 1000, ease: 'linear' }}
              />
            </span>
          ) : (
            <>
            <label className={'prompt' + (q.wide ? ' word' : '')} htmlFor="answer">
              {q.prompt}
            </label>
            <motion.span className="answer-wrap" animate={shake}>
              <input
                id="answer"
                autoFocus={index > 0}
                className={'answer' + (q.wide ? ' wide' : '')}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                inputMode={q.wide && !q.memory ? 'text' : 'numeric'}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                readOnly={result !== null}
                placeholder="?"
                aria-describedby="feedback"
              />
              {result === 'right' && <Tick />}
              {result === 'wrong' && <Strike />}
            </motion.span>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="feedback" id="feedback" aria-live="polite">
        <AnimatePresence mode="wait">
          {showing && (
            <motion.span key="memorise" className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Remember this number. It disappears in 3 seconds.
            </motion.span>
          )}
          {!result && !showing && q.site === 'typing' && (
            <motion.span key={`unscramble-${index}`} className="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Unscramble the letters to make a word.
            </motion.span>
          )}
          {result && (
            <motion.span
              key={result + index}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              {result === 'right' ? q.right : q.memory
                  ? `Not quite, it was ${q.answer}.`
                  : `Not quite, it’s ${q.answer}. Happens to everyone.`}
            </motion.span>
          )}
        </AnimatePresence>
      </p>

      <div className="sheet-actions">
        {result ? (
          <>
            <button type="button" className="btn" onClick={next}>
              Next question
            </button>
            <button type="button" className="btn ghost" onClick={() => onOpenProject(project.id)}>
              See {project.name}
            </button>
          </>
        ) : (
          <>
            <button type="submit" className="btn" disabled={showing}>
              Check answer
            </button>
            <button type="button" className="btn ghost" onClick={next}>
              Skip
            </button>
          </>
        )}
      </div>
    </motion.form>
  )
}

function Plus({ open }: { open: boolean }) {
  return (
    <svg className="plus" viewBox="0 0 28 28" aria-hidden>
      <line x1="6" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <motion.line
        x1="14"
        y1="6"
        x2="14"
        y2="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ rotate: open ? 90 : 0, opacity: open ? 0 : 1 }}
        style={{ originX: '14px', originY: '14px' }}
        transition={{ duration: 0.25, ease }}
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8Z" fill="currentColor" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="dl-icon">
      <path d="M10 3v9m0 0-3.5-3.5M10 12l3.5-3.5M4 15.5h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AboutBlock() {
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className="about" transition={{ duration: 0.4, ease }}>
      <motion.p layout="position" className="about-lead">
        {ABOUT[0]}
      </motion.p>
      <motion.ul layout="position" className="skills" aria-label="Skills">
        {SKILLS.map((sk) => (
          <li key={sk}>{sk}</li>
        ))}
      </motion.ul>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="more"
            className="about-more"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            {ABOUT.slice(1).map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
            <ul className="achievements">
              {ACHIEVEMENTS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        layout="position"
        className="btn ghost about-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? 'Show less' : 'Read the full story'}
      </motion.button>
    </motion.div>
  )
}

function ExperienceList() {
  const [openId, setOpenId] = useState<string | null>(EXPERIENCE[0].id)
  return (
    <ul className="work">
      {EXPERIENCE.map((j) => {
        const open = openId === j.id
        return (
          <li className="work-item" key={j.id}>
            <button
              className="work-row"
              aria-expanded={open}
              aria-controls={`job-${j.id}`}
              onClick={() => setOpenId(open ? null : j.id)}
            >
              <span>
                <span className="work-name">{j.company}</span>
                <span className="work-line">
                  {j.role}
                  {j.note ? `, ${j.note.toLowerCase()}` : ''}
                </span>
                <span className="mobile-date">{j.end ? `${j.start} – ${j.end}` : j.start}</span>
              </span>
              <span className="status">{j.end ? `${j.start} – ${j.end}` : j.start}</span>
              <Plus open={open} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={`job-${j.id}`}
                  className="work-detail"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <div className="work-detail-inner">
                    <div>
                      <ul className="job-points">
                        {j.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                      {j.place && <p className="tags">{j.place}</p>}
                      <ul className="job-tags" aria-label="Technologies">
                        {j.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
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

function WorkList({ openId, setOpenId }: { openId: string | null; setOpenId: (id: string | null) => void }) {
  return (
    <ul className="work">
      {PROJECTS.map((p) => {
        const open = openId === p.id
        return (
          <li className="work-item" key={p.id} id={`work-${p.id}`}>
            <button
              className="work-row"
              aria-expanded={open}
              aria-controls={`detail-${p.id}`}
              onClick={() => setOpenId(open ? null : p.id)}
            >
              <span>
                <span className="work-name">{p.name}</span>
                <span className="work-line">{p.line}</span>
              </span>
              <span className={'status' + (p.live ? ' live' : '')}>
                <span className="dot" />
                {p.live ? 'Live' : 'In progress'}
              </span>
              <Plus open={open} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={`detail-${p.id}`}
                  className="work-detail"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <div className="work-detail-inner">
                    <div>
                      <p>{p.detail}</p>
                      <p className="tags">{p.tags}</p>
                    </div>
                    {p.url && (
                      <a className="visit" href={p.url} target="_blank" rel="noreferrer">
                        Visit {p.domain}
                      </a>
                    )}
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

export default function V1() {
  const [openId, setOpenId] = useState<string | null>(null)

  const openProject = (id: string) => {
    setOpenId(id)
    document.getElementById(`work-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('v1-theme') === 'dark'
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem('v1-theme', dark ? 'dark' : 'light')
    } catch {
      /* storage unavailable */
    }
  }, [dark])

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="margin-line"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, ease }}
        aria-hidden
      />
      <div className="page">
        <header className={'nav' + (scrolled ? ' scrolled' : '')}>
          <a className="nav-name" href="#top">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={scrolled ? 'full' : 'short'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {scrolled ? 'Raison Joseph' : 'RJ'}
              </motion.span>
            </AnimatePresence>
          </a>
          <div className="nav-right">
            <nav className="nav-links" aria-label="Sections">
              <a href="#case-studies">Work</a>
              <a href="#experience">Experience</a>
              <a href="#work">Projects</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
            <button
              className="theme-switch"
              role="switch"
              aria-checked={dark}
              aria-label="Dark mode"
              onClick={() => setDark((d) => !d)}
            >
              <span className="theme-track-icon sun" aria-hidden>
                <SunIcon />
              </span>
              <span className="theme-track-icon moon" aria-hidden>
                <MoonIcon />
              </span>
              <motion.span
                className="theme-knob"
                animate={{ x: dark ? 26 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={dark ? 'moon' : 'sun'}
                    className="theme-knob-icon"
                    initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    {dark ? <MoonIcon /> : <SunIcon />}
                  </motion.span>
                </AnimatePresence>
              </motion.span>
            </button>
          </div>
        </header>

        <main id="top">
          <section className="hero">
            <div className="hero-intro">
              <HeroName />
              <motion.p
              className="hero-lede"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease }}
            >
              Senior front end developer. Seven years of React and TypeScript, currently at Poptin. On the side I
                build practice websites.
              </motion.p>
              <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6, ease }}
              >
                <a className="btn cv-btn" href={CV_URL} download>
                  <DownloadIcon />
                  Download CV
                </a>
                <a className="btn ghost" href={`mailto:${CONTACT_EMAIL}`}>
                  Email me
                </a>
                <a className="btn ghost" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </motion.div>
            </div>
            <PracticeSheet onOpenProject={openProject} />
          </section>

          <section className="section" id="case-studies">
            <h2 className="section-title">Case studies</h2>
            <CaseStudies />
          </section>

          <section className="section" id="experience">
            <h2 className="section-title">Experience</h2>
            <ExperienceList />
          </section>

          <section className="section" id="work">
            <h2 className="section-title">Side projects</h2>
            <WorkList openId={openId} setOpenId={setOpenId} />
          </section>

          <section className="section" id="about">
            <h2 className="section-title">About</h2>
            <div className="about-wrap">
              <AboutBlock />
              <motion.figure
                className="photo"
                initial={{ opacity: 0, rotate: 9, y: 24 }}
                whileInView={{ opacity: 1, rotate: 3, y: 0 }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ type: 'spring', stiffness: 140, damping: 16 }}
              >
                <span className="photo-tape" aria-hidden />
                <img src="/raison.jpg" alt="Raison Joseph" width={400} height={400} loading="lazy" />
                <figcaption>that’s me</figcaption>
              </motion.figure>
            </div>
          </section>

          <section className="section" id="contact">
            <h2 className="section-title">Say hello</h2>
            <a className="contact-big" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            <div className="contact-links">
              <a href={PHONE_HREF}>{PHONE}</a>
              <a href={CV_URL} download>
                Download CV
              </a>
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </section>
        </main>

        <footer className="footer">© {new Date().getFullYear()} Raison Joseph</footer>
      </div>
    </MotionConfig>
  )
}
