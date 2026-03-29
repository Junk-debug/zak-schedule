"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ScheduleStore } from "@/lib/scraper/types";
import { filterBySemester } from "@/lib/schedule";
import { downloadICS } from "@/lib/ics";
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
  const searchParams = useSearchParams();
  const initialSemester = searchParams.get("semester") ? Number(searchParams.get("semester")) : null;
  const [semester, setSemester] = useState<number | null>(initialSemester);
  const date = searchParams.get("date") || allDates[0] || "";

  function handleSemesterChange(val: string) {
    const s = val ? Number(val) : null;
    setSemester(s);
    const params = new URLSearchParams(searchParams.toString());
    if (s) params.set("semester", s.toString());
    else params.delete("semester");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/all?${query}` : "/all");
  }

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
            onChange={handleSemesterChange}
            options={[
              { value: "", label: "Wszystkie semestry" },
              ...semesters.map((s) => ({ value: s.toString(), label: `Semestr ${s}` })),
            ]}
          />
          <DateSelect dates={allDates} value={date} />
          {semester && schedule && (
            <ExportButton onClick={() => downloadICS(filterBySemester(schedule.lessons, semester))} />
          )}
        </>
      }
    />
  );
}
