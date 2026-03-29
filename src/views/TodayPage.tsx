import React from "react";
import type { Lesson, ScheduleStore } from "../types.js";
import { Layout } from "./Layout.js";
import {
  formatDate,
  weekdayFull,
  buildTimeSlots,
  SingleSemesterTable,
  GridTable,
  EmptyState,
  MetaBar,
  SemesterSelect,
  RefreshScript,
  UrlSyncScript,
} from "./components.js";

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
  semester: number | null;
  today: string;
}

function buildIcsHref(semester: number | null): string {
  if (!semester) return "/schedule/export.ics";
  return `/schedule/export.ics?semester=${semester}`;
}

function buildAllHref(semester: number | null): string {
  if (!semester) return "/all";
  return `/all?semester=${semester}`;
}

function findNextDate(lessons: Lesson[], after: string): string | null {
  return lessons.find((l) => l.date > after)?.date ?? null;
}

export function TodayPage({ schedule, semesters, semester, today }: Props) {
  if (!schedule) {
    return (
      <Layout title="Dziś — ZAK Gdańsk">
        <Header today={today} semesters={semesters} semester={semester} />
        <EmptyState>
          <p>Brak danych.</p>
          <p>
            Kliknij <strong>Odśwież</strong>, aby pobrać plan zajęć.
          </p>
        </EmptyState>
        <RefreshScript />
        <UrlSyncScript params={["sem"]} />
      </Layout>
    );
  }

  const allLessons = schedule.lessons;
  const todayLessons = allLessons.filter((l) => l.date === today);

  const relevantLessons = semester
    ? todayLessons.filter((l) => l.semester === semester)
    : todayLessons;

  const nextDate = semester
    ? findNextDate(
        allLessons.filter((l) => l.semester === semester),
        today
      )
    : findNextDate(allLessons, today);

  const hasLessons = relevantLessons.length > 0;

  return (
    <Layout title="Dziś — ZAK Gdańsk">
      <Header today={today} semesters={semesters} semester={semester} />
      <MetaBar
        updatedAt={schedule.updatedAt}
        pdfUrl={schedule.pdfUrl}
        icsHref={buildIcsHref(semester)}
      />

      {!hasLessons && (
        <EmptyState>
          <p>Dziś nie ma zajęć.</p>
          {nextDate && (
            <p className="next-date">
              Najbliższe zajęcia:{" "}
              <a href={`/all?date=${nextDate}${semester ? `&semester=${semester}` : ""}`}>
                {weekdayFull(nextDate)}, {formatDate(nextDate)}
              </a>
            </p>
          )}
        </EmptyState>
      )}

      {hasLessons && semester && (
        <div className="day-card">
          <SingleSemesterTable lessons={relevantLessons} />
        </div>
      )}

      {hasLessons && !semester && (
        <div className="day-card">
          <GridTable slots={buildTimeSlots(todayLessons)} semesters={semesters} />
        </div>
      )}

      <RefreshScript />
      <UrlSyncScript params={["sem"]} />
    </Layout>
  );
}

function Header({
  today,
  semesters,
  semester,
}: {
  today: string;
  semesters: number[];
  semester: number | null;
}) {
  return (
    <header>
      <h1>
        {weekdayFull(today)}, {formatDate(today)}
      </h1>
      <div className="header-actions">
        <SemesterSelect semesters={semesters} value={semester} />
        <a className="btn btn-secondary" href={buildAllHref(semester)}>
          Cały plan
        </a>
        <a className="btn btn-link" href="/archive">
          Archiwum
        </a>
        <button className="btn btn-primary" id="refresh-btn">
          Odśwież
        </button>
      </div>
    </header>
  );
}
