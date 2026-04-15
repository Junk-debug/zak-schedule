"use client";

import { useState } from "react";
import type { ArchiveEntry } from "../page";
import {
  extractSemesters,
  extractDates,
  buildTimeSlots,
  filterBySemester,
} from "@/lib/schedule";
import { formatDate } from "@/lib/format";
import { Header } from "@/components/ui/Header";
import { MetaBar } from "@/components/ui/MetaBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DayCard } from "@/components/ui/DayCard";
import { Select } from "@/components/ui/Select";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";

function dateFromFilename(filename: string): string {
  return filename.replace("schedule-", "").replace(".json", "");
}

interface Props {
  entries: ArchiveEntry[];
}

export function ArchiveView({ entries }: Props) {
  const [semester, setSemester] = useState<number | null>(null);

  const allSemesters = [
    ...new Set(entries.flatMap((e) => extractSemesters(e.schedule.lessons))),
  ].sort((a, b) => a - b);

  if (entries.length === 0) {
    return (
      <main>
        <Header active="/archive" semester={semester} />
        <EmptyState><p>Brak archiwalnych planów.</p></EmptyState>
      </main>
    );
  }

  return (
    <main>
      <Header active="/archive" semester={semester} />

      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <Select
          value={semester?.toString() ?? ""}
          onChange={(val) => setSemester(val ? Number(val) : null)}
          options={[
            { value: "", label: "Wszystkie semestry" },
            ...allSemesters.map((s) => ({ value: s.toString(), label: `Semestr ${s}` })),
          ]}
        />
      </div>

      {entries.map(({ file, schedule }) => {
        const semesters = extractSemesters(schedule.lessons);
        const dates = extractDates(schedule.lessons);
        const filtered = filterBySemester(schedule.lessons, semester);
        if (filtered.length === 0) return null;

        return (
          <section key={file} className="mb-8">
            <h2 className="text-sm font-medium text-muted mb-2">
              Archiwum z {formatDate(dateFromFilename(file))}
            </h2>
            <MetaBar updatedAt={schedule.updatedAt} pdfUrl={schedule.pdfUrl} />

            {dates.map((d) => {
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
                    <ScheduleGrid slots={buildTimeSlots(dayLessons)} semesters={semesters} />
                  )}
                </DayCard>
              );
            })}
          </section>
        );
      })}
    </main>
  );
}
