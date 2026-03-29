"use client";

import type { ScheduleStore } from "@/lib/scraper/types";
import { filterBySemester } from "@/lib/schedule";
import { downloadICS } from "@/lib/ics";
import { useScheduleFilters } from "@/hooks/useScheduleFilters";
import { Select } from "@/components/ui/Select";
import { DateSelect } from "@/components/schedule/DateSelect";
import { ExportButton } from "@/components/schedule/ExportButton";
import { AllScheduleContent } from "./AllScheduleContent";

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
  allDates: string[];
}

export function AllScheduleView({ schedule, semesters, allDates }: Props) {
  const { semester, setSemester, date: urlDate, setDate } = useScheduleFilters();
  const date = urlDate || allDates[0] || "";

  return (
    <AllScheduleContent
      schedule={schedule}
      semesters={semesters}
      semester={semester}
      date={date}
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
          <DateSelect dates={allDates} value={date} onChange={(val) => setDate(val || null)} />
          {semester && schedule && (
            <ExportButton onClick={() => downloadICS(filterBySemester(schedule.lessons, semester))} />
          )}
        </>
      }
    />
  );
}
