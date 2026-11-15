# Raison Joseph – portfolio

Personal portfolio built with React, TypeScript, Vite and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

## Where things live

- `src/data.ts` – all content: experience, case studies, projects, About text, contact links.
- `src/v1/` – the main design (served at `/`). Other design explorations live at `/v2`–`/v7` and are hidden from search.
- `public/Raison_Joseph_CV.pdf` – the downloadable CV, generated from `cv/cv.html` (open it in Chrome and print to PDF).
- `public/og.png` – the link preview image, generated from `og/og.html`.

## Before deploying

Set `VITE_SITE_URL` in `.env` to the live address (for example `https://raisonjoseph.com`) so link previews can find the share image. `vercel.json` routes every path to the app.
