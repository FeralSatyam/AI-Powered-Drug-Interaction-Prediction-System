# Medication Interaction Analyzer — Frontend

A React application (Vite) that surfaces possible adverse reactions and
drug-interaction risks for clinical decision support. Doctors sign in, manage
their patients, and analyze each patient's medication list — visualized as a
radial interaction network. The interaction analysis runs in the browser; auth
and patient data are persisted via the Node/Express backend.

## Tech Stack

- **React 19** (client-side rendering only)
- **Vite** — dev server and build tool
- **React Router DOM** — declarative client-side routing + protected routes
- **Tailwind CSS v4** — styling (via `@tailwindcss/vite`)
- **shadcn/ui** — UI primitives (new-york) on Radix + lucide icons
- **sonner** — toast notifications
- **JavaScript (JSX)** — no TypeScript
- **jsPDF** — client-side PDF report generation

## Features

- **Doctor auth** — register / sign in with a JWT session cookie; the session is
  restored on load, so you stay signed in until you log out.
- **Patient management** — add, select, and remove patients; each patient keeps
  their own medication list and analysis history.
- **Interaction network** — selected medications are drawn as nodes with the most
  severe interacting pair anchored at the center and color-coded edges.

## Backend connection

API calls go to a same-origin `/api` path that the Vite dev server proxies to the
backend (default `http://localhost:5000`). Start the backend first, then the
frontend. Override the proxy target with `VITE_PROXY_TARGET`, or point at an
absolute API with `VITE_API_URL` (see `.env.example`).

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser.

The main entry point is `src/main.jsx`, routes are declared in `src/App.jsx`, and
the primary screen lives in `src/components/AnalyzerApp.jsx`.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Produce a production build in `dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

## Project Structure

```
index.html              # HTML entry (title, meta, Geist fonts)
vite.config.js          # Vite + React + Tailwind, "@" -> ./src alias
src/
  main.jsx              # React root + BrowserRouter
  App.jsx               # Route declarations
  globals.css           # Tailwind import, theme tokens, animations
  components/           # UI components
  hooks/                # Custom hooks
  lib/                  # Analysis engine, data catalogs, PDF generation
```

The `@/` import alias maps to `src/` (configured in both `vite.config.js` and
`jsconfig.json`).
