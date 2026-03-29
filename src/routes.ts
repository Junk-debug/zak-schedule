import { Hono } from "hono";
import { createEvents } from "ics";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import type { ScheduleFileStore } from "./store.js";
import type { ScheduleRefresher } from "./scheduler.js";
import type { Lesson } from "./types.js";
import {
  todayString,
  currentTimeInMinutes,
  parseTimeToMinutes,
} from "./utils/date.js";
import { lessonToEvent } from "./utils/ics.js";
import { TodayPage } from "./views/TodayPage.js";
import { SchedulePage } from "./views/SchedulePage.js";
import { ArchivePage } from "./views/ArchivePage.js";

function extractSemesters(lessons: Lesson[]): number[] {
  return [...new Set(lessons.map((l) => l.semester))].sort((a, b) => a - b);
}

function extractDates(lessons: Lesson[]): string[] {
  return [...new Set(lessons.map((l) => l.date))].sort();
}

function parseSemesterParam(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function createScheduleRoutes(
  store: ScheduleFileStore,
  refresher: ScheduleRefresher
): Hono {
  const app = new Hono();

  // --- SSR pages ---

  app.get("/", async (c) => {
    const schedule = await store.loadSchedule();
    const semesters = schedule ? extractSemesters(schedule.lessons) : [];
    const semester = parseSemesterParam(c.req.query("semester"));
    const today = todayString();

    const html = renderToString(
      createElement(TodayPage, { schedule, semesters, semester, today })
    );
    return c.html("<!DOCTYPE html>" + html);
  });

  app.get("/all", async (c) => {
    const schedule = await store.loadSchedule();
    const semesters = schedule ? extractSemesters(schedule.lessons) : [];
    const semester = parseSemesterParam(c.req.query("semester"));
    const allDates = schedule ? extractDates(schedule.lessons) : [];
    const date = c.req.query("date") || allDates[0] || todayString();

    const html = renderToString(
      createElement(SchedulePage, {
        schedule,
        semesters,
        semester,
        date,
        allDates,
      })
    );
    return c.html("<!DOCTYPE html>" + html);
  });

  app.get("/archive", async (c) => {
    const archives = await store.listArchives();
    const file = c.req.query("file");
    const semester = parseSemesterParam(c.req.query("semester"));

    let schedule = null;
    let semesters: number[] = [];

    if (file) {
      schedule = await store.loadArchive(file);
      if (schedule) {
        semesters = extractSemesters(schedule.lessons);
      }
    }

    const html = renderToString(
      createElement(ArchivePage, {
        archives,
        selected: file || null,
        schedule,
        semesters,
        semester,
      })
    );
    return c.html("<!DOCTYPE html>" + html);
  });

  // --- JSON API ---

  app.get("/schedule", async (c) => {
    const schedule = await store.loadSchedule();
    if (!schedule) return c.json({ error: "No schedule loaded yet" }, 503);

    const date = c.req.query("date");
    if (date) {
      const filtered = schedule.lessons.filter((l) => l.date === date);
      return c.json({ ...schedule, lessons: filtered });
    }

    return c.json(schedule);
  });

  app.get("/schedule/today", async (c) => {
    const schedule = await store.loadSchedule();
    if (!schedule) return c.json({ error: "No schedule loaded yet" }, 503);

    const today = todayString();
    const lessons = schedule.lessons.filter((l) => l.date === today);
    return c.json({ ...schedule, lessons });
  });

  app.get("/schedule/next", async (c) => {
    const schedule = await store.loadSchedule();
    if (!schedule) return c.json({ error: "No schedule loaded yet" }, 503);

    const today = todayString();
    const nowMins = currentTimeInMinutes();

    const next =
      schedule.lessons.find(
        (l) => l.date === today && parseTimeToMinutes(l.start) > nowMins
      ) ?? schedule.lessons.find((l) => l.date > today);

    if (!next) return c.json({ error: "No upcoming lessons" }, 404);
    return c.json(next);
  });

  app.get("/schedule/export.ics", async (c) => {
    const schedule = await store.loadSchedule();
    if (!schedule) return c.json({ error: "No schedule loaded yet" }, 503);

    const semester = parseSemesterParam(c.req.query("semester"));
    const lessons = semester
      ? schedule.lessons.filter((l) => l.semester === semester)
      : schedule.lessons;

    const events = lessons.map(lessonToEvent);
    const { error, value } = createEvents(events);

    if (error || !value) {
      return c.json({ error: "Failed to generate ICS" }, 500);
    }

    return c.body(value, 200, {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="schedule.ics"',
    });
  });

  app.post("/schedule/refresh", async (c) => {
    try {
      const result = await refresher.refresh();
      return c.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return c.json({ error: message }, 500);
    }
  });

  return app;
}
