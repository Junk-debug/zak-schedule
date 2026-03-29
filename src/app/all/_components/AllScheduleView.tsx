"use client";

import { useSearchParams } from "next/navigation";
import type { ScheduleStore } from "@/lib/scraper/types";
import { filterBySemester } from "@/lib/schedule";
import { useSemesterParam } from "@/hooks/useSemesterParam";
import { downloadICS } from "@/lib/ics";
import { SemesterSelect } from "@/components/schedule/SemesterSelect";
import { DateSelect } from "@/components/schedule/DateSelect";
import { AllScheduleContent } from "./AllScheduleContent";

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
  allDates: string[];
}

export function AllScheduleView({ schedule, semesters, allDates }: Props) {
  const semester = useSemesterParam();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || allDates[0] || "";
  const icsLessons = schedule ? filterBySemester(schedule.lessons, semester) : [];

  return (
    <AllScheduleContent
      schedule={schedule}
      semesters={semesters}
      semester={semester}
      date={date}
      onExportICS={() => downloadICS(icsLessons)}
      headerControls={<SemesterSelect semesters={semesters} value={semester} />}
      dateControl={<DateSelect dates={allDates} value={date} />}
    />
  );
}
