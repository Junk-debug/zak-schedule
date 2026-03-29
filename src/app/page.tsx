import { Suspense } from "react";
import { loadSchedule } from "@/lib/data";
import { extractSemesters } from "@/lib/schedule";
import { TodayContent } from "./_components/TodayContent";
import { TodayView } from "./_components/TodayView";

export default async function TodayPage() {
  const schedule = await loadSchedule();
  const semesters = schedule ? extractSemesters(schedule.lessons) : [];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Suspense
      fallback={
        <TodayContent schedule={schedule} semesters={semesters} semester={null} today={today} />
      }
    >
      <TodayView schedule={schedule} semesters={semesters} />
    </Suspense>
  );
}
