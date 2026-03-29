"use client";

import type { ScheduleStore } from "@/lib/scraper/types";
import { filterBySemester } from "@/lib/schedule";
import { useSemesterParam } from "@/hooks/useSemesterParam";
import { downloadICS } from "@/lib/ics";
import { SemesterSelect } from "@/components/schedule/SemesterSelect";
import { TodayContent } from "./TodayContent";

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
}

export function TodayView({ schedule, semesters }: Props) {
  const semester = useSemesterParam();
  const today = new Date().toISOString().slice(0, 10);
  const icsLessons = schedule ? filterBySemester(schedule.lessons, semester) : [];

  return (
    <TodayContent
      schedule={schedule}
      semesters={semesters}
      semester={semester}
      today={today}
      onExportICS={() => downloadICS(icsLessons)}
      interactive={<SemesterSelect semesters={semesters} value={semester} />}
    />
  );
}
