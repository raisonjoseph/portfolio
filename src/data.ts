// Edit these to change contact details.
export const CONTACT_EMAIL = 'raisonjosephau@gmail.com'
export const GITHUB_URL = 'https://github.com/raisonjoseph'
export const PHONE = '+91 94964 54658'
export const PHONE_HREF = 'tel:+919496454658'
export const CV_URL = '/Raison_Joseph_CV.pdf'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/raison-joseph/'

export type Project = {
  id: string
  name: string
  line: string
  live: boolean
  url?: string
  domain?: string
  detail: string
  tags: string
}

export const PROJECTS: Project[] = [
  {
    id: 'typing',
    name: 'The Typing Practice',
    line: 'Typing tests, lessons and games',
    live: true,
    url: 'https://www.thetypingpractice.com',
    domain: 'thetypingpractice.com',
    detail:
      'WPM tests with a breakdown of your mistakes, step-by-step touch typing lessons, live multiplayer races, and games like Typing Asteroids and Falling Words. Finish a test and get a free typing certificate. It gets substantial organic search traffic, and I handle development, SEO and ad monetisation end to end.',
    tags: 'Next.js, real-time multiplayer',
  },
  {
    id: 'learn-my-tables',
    name: 'Learn My Tables',
    line: 'Times tables practice for kids',
    live: true,
    url: 'https://www.learnmytables.com',
    domain: 'learnmytables.com',
    detail:
      'Short drills for every table from 1 to 12, a full grid to explore, and progress that remembers which facts still need work. Available in English, Spanish, German and Hebrew, with the Hebrew version laid out right to left.',
    tags: 'Next.js, four languages, RTL',
  },
  {
    id: 'react-recall',
    name: 'React & Recall',
    line: 'Reaction time and memory tests',
    live: true,
    url: 'https://www.reactandrecall.com',
    domain: 'reactandrecall.com',
    detail:
      'Quick tests for reaction time, number memory, sequence memory and more. Each one gives you a score to beat and takes under a minute to play.',
    tags: 'Next.js, browser games',
  },
]

export const ROLE = 'Senior Front End Developer'
export const INTRO =
  'Front end developer with 7 years of experience building websites and web apps, mostly with React and TypeScript. Currently Senior Frontend Developer at Poptin, working remotely with Vue, jQuery and PHP.'

export const SKILLS = ['React', 'TypeScript', 'Next.js', 'Vue', 'JavaScript', 'jQuery', 'HTML', 'CSS', 'Node.js', 'PHP', 'Django']

export type Job = {
  id: string
  company: string
  role: string
  start: string
  end: string
  startYear: number
  place?: string
  note?: string
  points: string[]
  tags: string[]
}

export const EXPERIENCE: Job[] = [
  {
    id: 'poptin',
    tags: ['Vue', 'jQuery', 'PHP', 'Billing', 'Shopify'],
    company: 'Poptin',
    role: 'Senior Frontend Developer',
    start: 'Apr 2024',
    end: 'Present',
    startYear: 2024,
    place: 'Remote, Israel-based SaaS',
    points: [
      'Led front end development of the billing system behind the new Growth plan, covering direct and Shopify purchases in one checkout.',
      'Built the automation canvas UI, where customers design flows by connecting triggers and actions.',
      'Co-built the email editor customers use to design the emails their automations send.',
      'Helped migrate the product to Poptin’s redesigned UI.',
    ],
  },
  {
    id: 'storepecker',
    tags: ['Next.js', 'React', 'Multi-tenant', 'AI', 'Chrome extension'],
    company: 'Storepecker',
    role: 'Founder & Frontend Lead',
    start: 'Jun 2024',
    end: 'Mar 2026',
    startYear: 2024,
    note: 'Side venture',
    points: [
      'Founded an AI-native multi-tenant e-commerce platform and led its front end; grew it to hundreds of paying users and joined the NVIDIA Inception Program.',
      'Architected a Next.js setup that serves many themed storefronts from a single codebase through a configuration-driven component library.',
      'Shipped AI-driven theme configuration, Shopify integrations and the Hive Quick Chrome extension.',
    ],
  },
  {
    id: 'bmc',
    tags: ['React', 'Landing pages', 'Dashboards'],
    company: 'Buy Me a Coffee',
    role: 'Senior Front End Developer',
    start: 'May 2023',
    end: 'Mar 2024',
    startYear: 2023,
    points: [
      'Built the new Buy Me a Coffee landing page from scratch.',
      'Led the complete overhaul of the supporters dashboard, improving user experience and engagement.',
      'Fixed a long-standing issue in the biolink product, improving its reliability.',
    ],
  },
  {
    id: 'entri',
    tags: ['React', 'TypeScript', 'DASH / HLS', 'SEO'],
    company: 'Entri.app',
    role: 'Senior Front End Developer',
    start: 'Jul 2019',
    end: 'Apr 2023',
    startYear: 2019,
    place: 'Kochi',
    points: [
      'Built a custom DASH and HLS video player in React, with its own controls, working across Apple devices and other platforms.',
      'Owned the architecture of a React and TypeScript project.',
      'Built the quiz rendering page for the Android app’s webview from scratch.',
      'Built optimised landing pages matching exact designs, with SEO and cross-browser support.',
    ],
  },
  {
    id: 'dasholidays',
    tags: ['HTML', 'CSS', 'UI design'],
    company: 'Dasholidays',
    role: 'Freelance Web Developer',
    start: 'Freelance',
    end: '',
    startYear: 2018,
    place: 'Kochi',
    points: ['Designed and built the complete website UI and landing pages.'],
  },
  {
    id: 'aviation',
    tags: ['Django', 'Python'],
    company: 'Ministry of Civil Aviation',
    role: 'Freelance Backend Developer',
    start: 'May 2018',
    end: 'Sep 2018',
    startYear: 2018,
    place: 'Delhi',
    points: ['Built the back end of a Fire & Safety Roster Management System in Django.'],
  },
]

export const ACHIEVEMENTS = [
  'Best Performer of the Month at Entri, October 2020',
  'Selected for post-development project work at Smart India Hackathon 2017, among hundreds of teams',
  'Took part in the first two seasons of Smart India Hackathon',
]

// Shared bio, used by every version's About section.
export const ABOUT_SHORT =
  'Senior front end developer with seven years of experience across React, Vue and TypeScript. I build product interfaces for SaaS teams, and I like owning a feature from the first sketch to the last edge case.'

export const ABOUT = [
  'I’m Raison Joseph, a senior front end developer from Kerala, India. For seven years I’ve built the parts of web products that people use every day, mostly with React, TypeScript and Next.js.',
  'Right now I work remotely for Poptin, an Israel-based SaaS company. I led the new billing system for the Growth plan, including Shopify purchases, built the UI for the automation canvas and helped build the email editor. Before that I built Buy Me a Coffee’s new landing page from scratch and rebuilt its supporters dashboard, and spent almost four years at Entri building a custom DASH and HLS video player, quiz pages for Android and fast landing pages.',
  'I also like building my own products. I founded Storepecker, an AI-native e-commerce platform that grew to hundreds of paying users and joined the NVIDIA Inception Program. I also run a few practice websites, including The Typing Practice, which gets substantial organic search traffic. Running them end to end, from code to SEO to ads, keeps me close to what users actually do.',
]

// Case studies. Facts come only from the CV; add results/screenshots here when available.
export type CaseStudy = {
  id: string
  title: string
  company: string
  year: string
  summary: string
  role: string
  context: string
  built: string[]
  stack: string[]
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'billing',
    title: 'A new billing system for the Growth plan',
    company: 'Poptin',
    year: '2024 – now',
    summary: 'Led the front end of Poptin’s new billing flow, including purchases made through Shopify.',
    role: 'Front end lead for billing',
    context:
      'Poptin launched a Growth plan and needed a billing system to sell it. Some customers buy directly on Poptin and others through the Shopify app, so both paths had to work.',
    built: [
      'Led front end development of the billing system behind the new Growth plan.',
      'Brought two purchase paths, direct on Poptin and through the Shopify app, into one consistent checkout.',
      'Shipped it as part of Poptin’s redesigned interface.',
    ],
    stack: ['Vue', 'jQuery', 'PHP', 'Shopify billing'],
  },
  {
    id: 'canvas',
    title: 'Automation canvas and email editor',
    company: 'Poptin',
    year: '2024 – now',
    summary: 'Built the UI for Poptin’s visual automation canvas and helped build its email editor.',
    role: 'Front end developer',
    context:
      'Poptin customers set up automations visually: they connect triggers and actions on a canvas, then write the emails those automations send.',
    built: [
      'Built the automation canvas UI, where customers design flows by connecting triggers and actions.',
      'Co-built the email editor customers use to design the emails their automations send.',
    ],
    stack: ['Vue', 'jQuery', 'PHP', 'Canvas UI', 'Editors'],
  },
  {
    id: 'storepecker',
    title: 'Storepecker: many storefronts from one codebase',
    company: 'Storepecker',
    year: '2024 – 2026',
    summary:
      'Founded an AI-native e-commerce platform that grew to hundreds of paying users and joined the NVIDIA Inception Program.',
    role: 'Founder and front end lead',
    context:
      'Storepecker is a multi-tenant e-commerce platform. Every shop needed its own look, but building a separate site for each one would not scale.',
    built: [
      'Founded the platform and led its front end, growing it to hundreds of paying users and a place in the NVIDIA Inception Program.',
      'Architected a Next.js setup that serves many themed storefronts from a single codebase.',
      'Designed a configuration-driven component library, so a new storefront look is a config change, not new code.',
      'Shipped AI-driven theme configuration, Shopify integrations and the Hive Quick Chrome extension.',
    ],
    stack: ['Next.js', 'React', 'Multi-tenant', 'AI', 'Chrome extension'],
  },
  {
    id: 'player',
    title: 'A custom video player for Apple and Android',
    company: 'Entri',
    year: '2019 – 2023',
    summary: 'Built a DASH and HLS video player with a custom React UI that plays on Apple and other devices.',
    role: 'Senior front end developer',
    context:
      'Entri is an e-learning app, so video is central to it. Apple devices and other devices use different streaming formats, and the player had to handle both with one interface.',
    built: [
      'Built a custom DASH and HLS video player in React, with its own controls and interface.',
      'Made one player work across Apple devices and other platforms.',
      'Built the quiz rendering page for the Android app’s webview from scratch.',
    ],
    stack: ['React', 'TypeScript', 'DASH', 'HLS'],
  },
]
