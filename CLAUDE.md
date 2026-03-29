# ZAK Schedule Scraper

Scrapes school schedule PDFs from gdansk.zak.edu.pl, parses them, and serves as a static Next.js site.

## Commands

```bash
npm run dev      # Next.js dev server with hot reload
npm run build    # Scrape + generate static site → out/
npm start        # Serve built site locally
```

## Architecture

```
src/
  app/
    layout.tsx                  — Root layout (html, body, Tailwind)
    globals.css                 — Tailwind imports + design tokens (@theme)
    page.tsx                    — / (today's schedule)
    _components/
      TodayView.tsx             — Client view for /
    all/
      page.tsx                  — /all (full schedule with date picker)
      _components/
        AllScheduleView.tsx     — Client view for /all
    archive/
      page.tsx                  — /archive (archived schedules)
      _components/
        ArchiveView.tsx         — Client view for /archive
  components/
    ui/                         — Shared UI primitives
      Header.tsx                — Page header with title + actions
      MetaBar.tsx               — Update time, PDF link, ICS export
      EmptyState.tsx            — Centered empty message
      DayCard.tsx               — Day card with header + content
      Select.tsx                — Styled select with custom arrow
    schedule/                   — Schedule-specific shared components
      ScheduleTable.tsx         — Single semester table
      ScheduleGrid.tsx          — All semesters grid
      SemesterSelect.tsx        — Semester filter (client)
      DateSelect.tsx            — Date filter (client)
  hooks/
    useSemesterParam.ts         — Read ?semester from URL
  lib/
    data.ts                     — Data loader: scrapes if needed, reads JSON
    format.ts                   — Date formatting (formatDate, weekdayFull, weekdayShort)
    schedule.ts                 — Schedule utils (buildTimeSlots, extractSemesters, filterBySemester)
    ics.ts                      — ICS generation + client-side download
    scraper/
      scraper.ts                — ZakScraper: fetches HTML, finds article + PDF link
      parser.ts                 — ScheduleParser: downloads PDF, extracts lessons via pdfjs-dist
      store.ts                  — ScheduleFileStore: reads/writes JSON to data/, handles archives
      types.ts                  — Shared types (Lesson, ScheduleStore, Meta, RawLesson)
data/
  schedule.json                 — Current schedule (auto-generated, gitignored)
  meta.json                     — Scrape metadata: lastPdfUrl, lastChecked, lastChanged
  archive/                      — Archived schedules (schedule-YYYY-MM-DD.json)
```

## Key design decisions

- **Static export**: `next build` scrapes → parses → generates static HTML in `out/`. No server at runtime.
- **Scraping at build time**: `lib/data.ts` checks if data exists and is fresh (<1 hour). If not, scrapes automatically during build.
- **Archiving**: Before saving a new schedule, the previous one is copied to `data/archive/schedule-{date}.json`.
- **Client-side filtering**: Pages are Server Components that load data, then pass it to `"use client"` views. Semester/date filters read `useSearchParams` and filter client-side.
- **ICS on client**: iCal files generated in the browser via `downloadICS()`, no server endpoint needed.
- **Tailwind v4**: Design tokens defined via `@theme` in `globals.css` (surface, muted, border, border-light). No tailwind.config.
- **semester is a number**: Stored as `number` in Lesson. Parsed from PDF labels like "semestr 5" → `5`.
- **Two table layouts**: Grid (all semesters as columns) when no semester filter; simple table with Sala column when single semester selected.
- **Page-specific components in `_components/`**: Components used only by one page live next to it. Shared components live in `src/components/`.

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
- **Design**: Minimalist black & white via Tailwind. Design tokens in `globals.css`.
- **Pages**: `/` (today), `/all` (full schedule with date picker), `/archive` (archived schedules).

## Deployment

- **GitHub Pages**: `next build` outputs to `out/`, deploy via GitHub Actions.
- **Cron via GitHub Actions**: Weekly workflow runs `npm run build` → deploy. No in-process cron.

## Rules

- Do not use `pdf-parse` — it doesn't support ESM
- Do not hardcode article URLs — the school posts new articles monthly with changing IDs
- Do not add a database — JSON file storage is intentional
- `data/` directory is auto-created; don't commit schedule.json or meta.json
- Path alias `@/*` maps to `./src/*`
