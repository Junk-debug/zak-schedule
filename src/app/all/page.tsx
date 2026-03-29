import { Suspense } from "react";
import { loadSchedule } from "@/lib/data";
import { extractSemesters, extractDates } from "@/lib/schedule";
import { AllScheduleContent } from "./_components/AllScheduleContent";
import { AllScheduleView } from "./_components/AllScheduleView";

export default async function AllSchedulePage() {
  const schedule = await loadSchedule();
  const semesters = schedule ? extractSemesters(schedule.lessons) : [];
  const allDates = schedule ? extractDates(schedule.lessons) : [];

  return (
    <Suspense
      fallback={
        <AllScheduleContent
          schedule={schedule}
          semesters={semesters}
          semester={null}
          date={allDates[0] || ""}
        />
      }
    >
      <AllScheduleView schedule={schedule} semesters={semesters} allDates={allDates} />
    </Suspense>
  );
}
