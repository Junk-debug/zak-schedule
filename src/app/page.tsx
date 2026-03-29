import { Suspense } from "react";
import { loadSchedule } from "@/lib/data";
import { extractSemesters } from "@/lib/schedule";
import { TodayView } from "./_components/TodayView";

export default async function TodayPage() {
  const schedule = await loadSchedule();
  const semesters = schedule ? extractSemesters(schedule.lessons) : [];

  return (
    <Suspense>
      <TodayView schedule={schedule} semesters={semesters} />
    </Suspense>
  );
}
