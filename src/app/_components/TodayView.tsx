"use client";

import type { ScheduleStore } from "@/lib/scraper/types";
import { filterBySemester } from "@/lib/schedule";
import { downloadICS } from "@/lib/ics";
import { getPolandDate } from "@/lib/poland-time";
import { useActiveLesson } from "@/hooks/useActiveLesson";
import { useScheduleFilters } from "@/hooks/useScheduleFilters";
import { Select } from "@/components/ui/Select";
import { ExportButton } from "@/components/schedule/ExportButton";
import { TodayContent } from "./TodayContent";

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
}

export function TodayView({ schedule, semesters }: Props) {
  const { semester, setSemester } = useScheduleFilters();
  const today = getPolandDate();
  const todayLessons = schedule?.lessons.filter((l) => l.date === today) ?? [];
  const activeLesson = useActiveLesson(todayLessons);

  return (
    <TodayContent
      schedule={schedule}
      semesters={semesters}
      semester={semester}
      today={today}
      activeLesson={activeLesson}
      filters={
        <>
          <Select
            value={semester?.toString() ?? ""}
            onChange={(val) => setSemester(val ? Number(val) : null)}
            options={[
              { value: "", label: "Wszystkie semestry" },
              ...semesters.map((s) => ({ value: s.toString(), label: `Semestr ${s}` })),
            ]}
          />
          {semester && schedule && (
            <ExportButton onClick={() => downloadICS(filterBySemester(schedule.lessons, semester))} />
          )}
        </>
      }
    />
  );
}
