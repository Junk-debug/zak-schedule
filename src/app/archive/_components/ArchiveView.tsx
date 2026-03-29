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
import { formatDate } from "@/lib/format";
import { Header } from "@/components/ui/Header";
import { MetaBar } from "@/components/ui/MetaBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DayCard } from "@/components/ui/DayCard";
import { Select } from "@/components/ui/Select";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { ArchiveList } from "./ArchiveList";

function dateFromFilename(filename: string): string {
  return filename.replace("schedule-", "").replace(".json", "");
}

interface Props {
  archives: string[];
}

export function ArchiveView({ archives }: Props) {
  const searchParams = useSearchParams();
  const selected = searchParams.get("file");
  const initialSemester = searchParams.get("semester") ? Number(searchParams.get("semester")) : null;
  const [semester, setSemester] = useState<number | null>(initialSemester);

  const [schedule, setSchedule] = useState<ScheduleStore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selected) {
      setSchedule(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/data/archive/${selected}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSchedule(data))
      .catch((err) => { if (!controller.signal.aborted) setSchedule(null); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [selected]);

  const semesters = schedule ? extractSemesters(schedule.lessons) : [];

  function handleSemesterChange(val: string) {
    setSemester(val ? Number(val) : null);
  }

  if (!selected) {
    return (
      <main>
        <Header active="/archive" semester={semester} />
        {archives.length === 0 ? (
          <EmptyState><p>Brak archiwalnych planów.</p></EmptyState>
        ) : (
          <ArchiveList archives={archives} />
        )}
      </main>
    );
  }

  return (
    <main>
      <Header active="/archive" semester={semester} />

      {loading && <EmptyState><p>Ładowanie...</p></EmptyState>}

      {!loading && schedule && (
        <>
          <MetaBar updatedAt={schedule.updatedAt} pdfUrl={schedule.pdfUrl} />

          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <Link href="/archive" className="text-sm text-muted hover:text-gray-900 transition-colors">
              ← Lista archiwów
            </Link>
            <span className="text-sm text-muted px-2.5 py-1 border border-border rounded-md bg-surface">
              Archiwum z {formatDate(dateFromFilename(selected))}
            </span>
            <Select
              value={semester?.toString() ?? ""}
              onChange={handleSemesterChange}
              options={[
                { value: "", label: "Wszystkie semestry" },
                ...semesters.map((s) => ({ value: s.toString(), label: `Semestr ${s}` })),
              ]}
            />
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
                  <ScheduleGrid slots={buildTimeSlots(dayLessons)} semesters={semesters} />
                )}
              </DayCard>
            );
          })}
        </>
      )}

      {!loading && !schedule && (
        <EmptyState><p>Nie znaleziono archiwum: {selected}</p></EmptyState>
      )}
    </main>
  );
}
