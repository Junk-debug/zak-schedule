"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ScheduleStore } from "@/lib/scraper/types";
import { filterBySemester } from "@/lib/schedule";
import { downloadICS } from "@/lib/ics";
import { Select } from "@/components/ui/Select";
import { ExportButton } from "@/components/schedule/ExportButton";
import { TodayContent } from "./TodayContent";

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
}

export function TodayView({ schedule, semesters }: Props) {
  const searchParams = useSearchParams();
  const initialSemester = searchParams.get("semester") ? Number(searchParams.get("semester")) : null;
  const [semester, setSemester] = useState<number | null>(initialSemester);
  const today = new Date().toISOString().slice(0, 10);

  function handleSemesterChange(val: string) {
    const s = val ? Number(val) : null;
    setSemester(s);
    const url = s ? `/?semester=${s}` : "/";
    window.history.replaceState(null, "", url);
  }

  return (
    <TodayContent
      schedule={schedule}
      semesters={semesters}
      semester={semester}
      today={today}
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
          {semester && schedule && (
            <ExportButton onClick={() => downloadICS(filterBySemester(schedule.lessons, semester))} />
          )}
        </>
      }
    />
  );
}
