import React from "react";
import type { ScheduleStore } from "../types.js";
import { Layout } from "./Layout.js";
import { loadCSS } from "./css.js";

const styles = loadCSS(import.meta.url, "ArchivePage.css");
import {
  formatDate,
  weekdayShort,
  buildTimeSlots,
  SingleSemesterTable,
  GridTable,
  EmptyState,
  SemesterSelect,
  MetaBar,
} from "./components.js";

interface Props {
  archives: string[];
  selected: string | null;
  schedule: ScheduleStore | null;
  semesters: number[];
  semester: number | null;
}

function extractDateFromFilename(filename: string): string {
  return filename.replace("schedule-", "").replace(".json", "");
}

export function ArchivePage({
  archives,
  selected,
  schedule,
  semesters,
  semester,
}: Props) {
  return (
    <Layout title="Archiwum — ZAK Gdańsk" styles={styles}>
      <header>
        <h1>Archiwum planów zajęć</h1>
        <div className="header-actions">
          {selected && schedule && (
            <SemesterSelect semesters={semesters} value={semester} />
          )}
          <a className="btn btn-link" href="/">&larr; Dziś</a>
          <a className="btn btn-secondary" href="/all">Cały plan</a>
        </div>
      </header>

      {archives.length === 0 && (
        <EmptyState>
          <p>Brak archiwalnych planów.</p>
        </EmptyState>
      )}

      {archives.length > 0 && !selected && (
        <ArchiveList archives={archives} />
      )}

      {selected && schedule && (
        <ArchiveDetail
          filename={selected}
          schedule={schedule}
          semesters={semesters}
          semester={semester}
        />
      )}

      {selected && !schedule && (
        <EmptyState>
          <p>Nie znaleziono archiwum: {selected}</p>
        </EmptyState>
      )}

      <UrlSyncArchiveScript />
    </Layout>
  );
}

function ArchiveList({ archives }: { archives: string[] }) {
  return (
    <div className="archive-list">
      {archives.map((filename) => {
        const date = extractDateFromFilename(filename);
        return (
          <a
            key={filename}
            className="archive-item"
            href={`/archive?file=${filename}`}
          >
            <span className="archive-date">
              {weekdayShort(date)} {formatDate(date)}
            </span>
            <span className="archive-arrow">&rarr;</span>
          </a>
        );
      })}
    </div>
  );
}

function ArchiveDetail({
  filename,
  schedule,
  semesters,
  semester,
}: {
  filename: string;
  schedule: ScheduleStore;
  semesters: number[];
  semester: number | null;
}) {
  const date = extractDateFromFilename(filename);
  const allDates = [...new Set(schedule.lessons.map((l) => l.date))].sort();

  return (
    <>
      <MetaBar updatedAt={schedule.updatedAt} pdfUrl={schedule.pdfUrl} />

      <div className="nav-row">
        <a className="btn btn-link" href="/archive">&larr; Lista archiwów</a>
        <span className="archive-badge">
          Archiwum z {formatDate(date)}
        </span>
      </div>

      {allDates.map((d) => {
        const dayLessons = semester
          ? schedule.lessons.filter((l) => l.date === d && l.semester === semester)
          : schedule.lessons.filter((l) => l.date === d);

        if (dayLessons.length === 0) return null;

        return (
          <div className="day-card" key={d}>
            <div className="day-header">
              <span className="day-weekday">
                {weekdayShort(d)} {formatDate(d)}
              </span>
              <span className="day-date">
                {semester ? `Semestr ${semester}` : "Wszystkie semestry"}
              </span>
            </div>
            {semester ? (
              <SingleSemesterTable lessons={dayLessons} />
            ) : (
              <GridTable slots={buildTimeSlots(dayLessons)} semesters={semesters} />
            )}
          </div>
        );
      })}
    </>
  );
}

function UrlSyncArchiveScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
var sem = document.getElementById('sem');
if (sem) {
  sem.addEventListener('change', function() {
    var p = new URLSearchParams(location.search);
    if (this.value) p.set('semester', this.value); else p.delete('semester');
    location.search = p.toString();
  });
}
`,
      }}
    />
  );
}
