"use client";

import Link from "next/link";
import type { ScheduleStore, Lesson } from "@/lib/scraper/types";
import { buildTimeSlots, filterBySemester } from "@/lib/schedule";
import { formatDate, weekdayFull } from "@/lib/format";
import { useSemesterParam } from "@/hooks/useSemesterParam";
import { Header, HeaderLink } from "@/components/ui/Header";
import { MetaBar } from "@/components/ui/MetaBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DayCard } from "@/components/ui/DayCard";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { SemesterSelect } from "@/components/schedule/SemesterSelect";
import { downloadICS } from "@/lib/ics";

function findNextDate(lessons: Lesson[], after: string): string | null {
  return lessons.find((l) => l.date > after)?.date ?? null;
}

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
}

export function TodayView({ schedule, semesters }: Props) {
  const semester = useSemesterParam();
  const today = new Date().toISOString().slice(0, 10);
  const title = `${weekdayFull(today)}, ${formatDate(today)}`;

  if (!schedule) {
    return (
      <main>
        <Header title={title}>
          <SemesterSelect semesters={semesters} value={semester} />
          <HeaderLink href="/all" variant="secondary">
            Cały plan
          </HeaderLink>
          <HeaderLink href="/archive">Archiwum</HeaderLink>
        </Header>
        <EmptyState>
          <p>Brak danych.</p>
        </EmptyState>
      </main>
    );
  }

  const todayLessons = schedule.lessons.filter((l) => l.date === today);
  const relevantLessons = filterBySemester(todayLessons, semester);
  const icsLessons = filterBySemester(schedule.lessons, semester);
  const nextDate = findNextDate(
    filterBySemester(schedule.lessons, semester),
    today,
  );

  return (
    <main>
      <Header title={title}>
        <SemesterSelect semesters={semesters} value={semester} />
        <HeaderLink href="/all" variant="secondary">
          Cały plan
        </HeaderLink>
        <HeaderLink href="/archive">Archiwum</HeaderLink>
      </Header>

      <MetaBar
        updatedAt={schedule.updatedAt}
        pdfUrl={schedule.pdfUrl}
        onExportICS={() => downloadICS(icsLessons)}
      />

      {relevantLessons.length === 0 && (
        <EmptyState>
          <p>Dziś nie ma zajęć.</p>
          {nextDate && (
            <p className="mt-4">
              Najbliższe zajęcia:{" "}
              <Link
                href={`/all?date=${nextDate}${semester ? `&semester=${semester}` : ""}`}
                className="text-gray-900 font-semibold underline underline-offset-2 hover:text-gray-500"
              >
                {weekdayFull(nextDate)}, {formatDate(nextDate)}
              </Link>
            </p>
          )}
        </EmptyState>
      )}

      {relevantLessons.length > 0 && semester && (
        <DayCard date={today}>
          <ScheduleTable lessons={relevantLessons} />
        </DayCard>
      )}

      {relevantLessons.length > 0 && !semester && (
        <DayCard date={today}>
          <ScheduleGrid
            slots={buildTimeSlots(todayLessons)}
            semesters={semesters}
          />
        </DayCard>
      )}
    </main>
  );
}
