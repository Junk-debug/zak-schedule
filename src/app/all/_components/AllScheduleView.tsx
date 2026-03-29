"use client";

import { useSearchParams } from "next/navigation";
import type { ScheduleStore } from "@/lib/scraper/types";
import { buildTimeSlots, filterBySemester } from "@/lib/schedule";
import { formatDate } from "@/lib/format";
import { useSemesterParam } from "@/hooks/useSemesterParam";
import { Header, HeaderLink } from "@/components/ui/Header";
import { MetaBar } from "@/components/ui/MetaBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DayCard } from "@/components/ui/DayCard";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { SemesterSelect } from "@/components/schedule/SemesterSelect";
import { DateSelect } from "@/components/schedule/DateSelect";
import { downloadICS } from "@/lib/ics";

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
  allDates: string[];
}

export function AllScheduleView({ schedule, semesters, allDates }: Props) {
  const semester = useSemesterParam();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || allDates[0] || "";

  if (!schedule) {
    return (
      <main>
        <Header title="Plan zajęć ZAK Gdańsk">
          <SemesterSelect semesters={semesters} value={semester} />
          <HeaderLink href="/">← Dziś</HeaderLink>
          <HeaderLink href="/archive">Archiwum</HeaderLink>
        </Header>
        <EmptyState>
          <p>Brak danych.</p>
        </EmptyState>
      </main>
    );
  }

  const dateLessons = schedule.lessons.filter((l) => l.date === date);
  const semesterLessons = filterBySemester(dateLessons, semester);
  const icsLessons = filterBySemester(schedule.lessons, semester);

  return (
    <main>
      <Header title="Plan zajęć ZAK Gdańsk">
        <SemesterSelect semesters={semesters} value={semester} />
        <HeaderLink href="/">← Dziś</HeaderLink>
        <HeaderLink href="/archive">Archiwum</HeaderLink>
      </Header>

      <MetaBar
        updatedAt={schedule.updatedAt}
        pdfUrl={schedule.pdfUrl}
        onExportICS={() => downloadICS(icsLessons)}
      />

      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <DateSelect dates={allDates} value={date} />
      </div>

      {semesterLessons.length === 0 && (
        <EmptyState>
          <p>Brak zajęć w dniu {formatDate(date)}.</p>
        </EmptyState>
      )}

      {semesterLessons.length > 0 && semester && (
        <DayCard date={date} label={`Semestr ${semester}`}>
          <ScheduleTable lessons={semesterLessons} />
        </DayCard>
      )}

      {semesterLessons.length > 0 && !semester && (
        <DayCard date={date} label="Wszystkie semestry">
          <ScheduleGrid
            slots={buildTimeSlots(dateLessons)}
            semesters={semesters}
          />
        </DayCard>
      )}
    </main>
  );
}
