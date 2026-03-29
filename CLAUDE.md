# ZAK Schedule Scraper

Scrapes school schedule PDFs from gdansk.zak.edu.pl, parses them, and serves via REST API + SSR frontend.

## Commands

```bash
npm run dev      # tsx watch — hot-reload dev server (port from .env, default 8000)
npm run build    # tsc → dist/
npm start        # node dist/index.js (production)
```

## Architecture

```
src/
  index.ts          — Composition root: wires dependencies, starts Hono + cron
  routes.ts         — HTTP routes: SSR pages (/, /all) + JSON API (/schedule/*)
  scraper.ts        — ZakScraper class: fetches HTML, finds schedule article + PDF link
  parser.ts         — ScheduleParser class: downloads PDF, extracts lessons via pdfjs-dist
  scheduler.ts      — ScheduleRefresher class: orchestrates scraper → parser → store
  store.ts          — ScheduleFileStore class: reads/writes JSON to data/
  types.ts          — Shared interfaces (Lesson, ScheduleStore, Meta, etc.)
  utils/
    date.ts         — Date/time helpers (todayString, parseTimeToMinutes, etc.)
    ics.ts          — Lesson → iCal event converter
  views/
    Layout.tsx      — HTML shell with CSS
    TodayPage.tsx   — "/" — today's schedule
    SchedulePage.tsx — "/all" — full schedule with date picker
    components.tsx  — Shared React components (tables, selects, empty states, scripts)
data/
  schedule.json     — Parsed schedule (auto-generated, gitignored)
  meta.json         — Scrape metadata: lastPdfUrl, lastChecked, lastChanged
```

## Key design decisions

- **OOP + DI**: Classes for scraper, parser, store, refresher. Dependencies injected via constructors in index.ts.
- **SSR React**: Pages rendered with `renderToString()` on the server. No client-side React bundle. Client JS is minimal vanilla (dropdown handlers, refresh button).
- **All URL params in query string**: `?semester=5`, `?date=2026-03-15`. Dropdowns trigger page navigation, not client-side filtering.
- **semester is a number**: Stored as `number` in Lesson. Parsed from PDF labels like "semestr 5" → `5`.
- **Two table layouts**: Grid (all semesters as columns) when no semester filter; simple table with Sala column when single semester selected.

## PDF parsing details

The PDF from gdansk.zak.edu.pl has a specific structure that pdfjs-dist extracts as positioned text items with `transform[4]` (x) and `transform[5]` (y) coordinates.

**Critical rules:**
- Import `pdfjs-dist/legacy/build/pdf.mjs` — the standard import breaks in Node (worker issues)
- `groupByY` tolerance must be 3 — subject name and room info are on different Y-levels
- After matching a lesson row, consume trailing non-structural rows (room/address data lives on adjacent Y-levels)
- Each semester column has TWO text items side by side: `"0/7, ul. Wały Piastowskie 1"` (room+address) and `"Matematyka"` (subject). Process items individually, don't join them — joining then stripping address with regex destroys the subject name.
- Room+address items start with `\d+/\d+`, everything else is the subject name.

## Frontend

- **Language**: Polish with proper diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż). No transliteration.
- **Design**: Minimalist black & white. White background, dark text, gray borders. No bright colors.
- **Pages**: `/` (today, focused) and `/all` (full schedule with date picker). "Cały plan" links between them.
- Dates with lessons marked ● in date picker, empty dates marked ○.

## Cron

Every Sunday at 20:00 (`0 20 * * 0`): scrape → compare PDF URL → parse if changed → save.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | SSR today page (`?semester=N`) |
| GET | `/all` | SSR full schedule (`?semester=N&date=YYYY-MM-DD`) |
| GET | `/schedule` | JSON full schedule (`?date=YYYY-MM-DD`) |
| GET | `/schedule/today` | JSON today's lessons |
| GET | `/schedule/next` | JSON next upcoming lesson |
| GET | `/schedule/export.ics` | iCal export (`?semester=N`) |
| POST | `/schedule/refresh` | Trigger scrape+parse manually |

## Rules

- Do not use `pdf-parse` — it doesn't support ESM
- Do not hardcode article URLs — the school posts new articles monthly with changing IDs
- Do not add a database — JSON file storage is intentional
- Do not add a client-side React bundle or hydration — SSR-only is intentional
- `data/` directory is auto-created; don't commit schedule.json or meta.json
