import { Suspense } from "react";
import { loadSchedule } from "@/lib/data";
import { extractSemesters, extractDates } from "@/lib/schedule";
import { AllScheduleView } from "./_components/AllScheduleView";

export default async function AllSchedulePage() {
  const schedule = await loadSchedule();
  const semesters = schedule ? extractSemesters(schedule.lessons) : [];
  const allDates = schedule ? extractDates(schedule.lessons) : [];

  return (
    <Suspense>
      <AllScheduleView
        schedule={schedule}
        semesters={semesters}
        allDates={allDates}
      />
    </Suspense>
  );
}
