"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { ScheduleStore } from "@/lib/scraper/types";
import {
  extractSemesters,
  extractDates,
  buildTimeSlots,
  filterBySemester,
} from "@/lib/schedule";
import { formatDate, weekdayShort } from "@/lib/format";
import { useSemesterParam } from "@/hooks/useSemesterParam";
import { Header, HeaderLink } from "@/components/ui/Header";
import { MetaBar } from "@/components/ui/MetaBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DayCard } from "@/components/ui/DayCard";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { SemesterSelect } from "@/components/schedule/SemesterSelect";

function dateFromFilename(filename: string): string {
  return filename.replace("schedule-", "").replace(".json", "");
}

interface Props {
  archives: string[];
}

export function ArchiveView({ archives }: Props) {
  const searchParams = useSearchParams();
  const selected = searchParams.get("file");
  const semester = useSemesterParam();

  const [schedule, setSchedule] = useState<ScheduleStore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) {
      setSchedule(null);
      return;
    }
    setLoading(true);
    fetch(`/data/archive/${selected}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSchedule(data))
      .catch(() => setSchedule(null))
      .finally(() => setLoading(false));
  }, [selected]);

  const semesters = schedule ? extractSemesters(schedule.lessons) : [];

  return (
    <main>
      <Header title="Archiwum planów zajęć">
        {selected && schedule && (
          <SemesterSelect semesters={semesters} value={semester} />
        )}
        <HeaderLink href="/">← Dziś</HeaderLink>
        <HeaderLink href="/all" variant="secondary">
          Cały plan
        </HeaderLink>
      </Header>

      {archives.length === 0 && !selected && (
        <EmptyState>
          <p>Brak archiwalnych planów.</p>
        </EmptyState>
      )}

      {archives.length > 0 && !selected && (
        <div className="flex flex-col rounded-lg border border-border overflow-hidden">
          {archives.map((filename) => {
            const date = dateFromFilename(filename);
            return (
              <Link
                key={filename}
                href={`/archive?file=${filename}`}
                className="flex justify-between items-center px-4 py-3 bg-white text-gray-900 no-underline hover:bg-surface transition-colors border-t border-border first:border-t-0"
              >
                <span className="font-medium text-sm">
                  {weekdayShort(date)} {formatDate(date)}
                </span>
                <span className="text-muted text-sm">→</span>
              </Link>
            );
          })}
        </div>
      )}

      {selected && loading && (
        <EmptyState>
          <p>Ładowanie...</p>
        </EmptyState>
      )}

      {selected && !loading && schedule && (
        <>
          <MetaBar updatedAt={schedule.updatedAt} pdfUrl={schedule.pdfUrl} />

          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <Link
              href="/archive"
              className="text-sm text-muted hover:text-gray-900 transition-colors"
            >
              ← Lista archiwów
            </Link>
            <span className="text-sm text-muted px-2.5 py-1 border border-border rounded-md bg-surface">
              Archiwum z {formatDate(dateFromFilename(selected))}
            </span>
          </div>

          {extractDates(schedule.lessons).map((d) => {
            const dayLessons = filterBySemester(
              schedule.lessons.filter((l) => l.date === d),
              semester,
            );
            if (dayLessons.length === 0) return null;

            return (
              <DayCard
                key={d}
                date={d}
                label={semester ? `Semestr ${semester}` : "Wszystkie semestry"}
              >
                {semester ? (
                  <ScheduleTable lessons={dayLessons} />
                ) : (
                  <ScheduleGrid
                    slots={buildTimeSlots(dayLessons)}
                    semesters={semesters}
                  />
                )}
              </DayCard>
            );
          })}
        </>
      )}

      {selected && !loading && !schedule && (
        <EmptyState>
          <p>Nie znaleziono archiwum: {selected}</p>
        </EmptyState>
      )}
    </main>
  );
}
