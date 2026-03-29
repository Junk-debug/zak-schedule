import React from "react";
import type { Lesson, ScheduleStore } from "../types.js";
import { Layout } from "./Layout.js";
import { loadCSS } from "./css.js";

const styles = loadCSS(import.meta.url, "SchedulePage.css");
import {
  formatDate,
  weekdayShort,
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
  date: string;
  allDates: string[];
}

function buildTodayHref(semester: number | null): string {
  if (!semester) return "/";
  return `/?semester=${semester}`;
}

function buildIcsHref(semester: number | null): string {
  if (!semester) return "/schedule/export.ics";
  return `/schedule/export.ics?semester=${semester}`;
}

export function SchedulePage({
  schedule,
  semesters,
  semester,
  date,
  allDates,
}: Props) {
  if (!schedule) {
    return (
      <Layout title="Plan zajęć — ZAK Gdańsk" styles={styles}>
        <Header semesters={semesters} semester={semester} />
        <EmptyState>
          <p>Brak danych.</p>
          <p>
            Kliknij <strong>Odśwież</strong>, aby pobrać plan zajęć.
          </p>
        </EmptyState>
        <RefreshScript />
      </Layout>
    );
  }

  const dateLessons = schedule.lessons.filter((l) => l.date === date);

  const semesterLessons = semester
    ? dateLessons.filter((l) => l.semester === semester)
    : dateLessons;

  const hasLessons = semesterLessons.length > 0;

  return (
    <Layout title="Plan zajęć — ZAK Gdańsk" styles={styles}>
      <Header semesters={semesters} semester={semester} />
      <MetaBar
        updatedAt={schedule.updatedAt}
        pdfUrl={schedule.pdfUrl}
        icsHref={buildIcsHref(semester)}
      />

      <div className="nav-row">
        <DatePicker
          dates={allDates}
          selected={date}
        />
      </div>

      {!hasLessons && (
        <EmptyState>
          <p>Brak zajęć w dniu {formatDate(date)}.</p>
        </EmptyState>
      )}

      {hasLessons && semester && (
        <div className="day-card">
          <DayHeader date={date} label={`Semestr ${semester}`} />
          <SingleSemesterTable lessons={semesterLessons} />
        </div>
      )}

      {hasLessons && !semester && (
        <div className="day-card">
          <DayHeader date={date} label="Wszystkie semestry" />
          <GridTable
            slots={buildTimeSlots(dateLessons)}
            semesters={semesters}
          />
        </div>
      )}

      <RefreshScript />
      <UrlSyncScript params={["sem", "date-picker"]} />
    </Layout>
  );
}

// --- Page-specific components ---

function Header({
  semesters,
  semester,
}: {
  semesters: number[];
  semester: number | null;
}) {
  return (
    <header>
      <h1>Plan zajęć ZAK Gdańsk</h1>
      <div className="header-actions">
        <SemesterSelect semesters={semesters} value={semester} />
        <a className="btn btn-link" href={buildTodayHref(semester)}>
          &larr; Dziś
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

function DayHeader({ date, label }: { date: string; label: string }) {
  return (
    <div className="day-header">
      <span className="day-weekday">
        {weekdayShort(date)} {formatDate(date)}
      </span>
      <span className="day-date">{label}</span>
    </div>
  );
}

function DatePicker({
  dates,
  selected,
}: {
  dates: string[];
  selected: string;
}) {
  return (
    <select id="date-picker" className="date-select" defaultValue={selected}>
      {dates.map((d) => (
        <option key={d} value={d}>
          {weekdayShort(d)} {formatDate(d)}
        </option>
      ))}
    </select>
  );
}
