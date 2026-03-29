import Link from "next/link";
import type { ScheduleStore, Lesson } from "@/lib/scraper/types";
import { buildTimeSlots, filterBySemester } from "@/lib/schedule";
import { formatDate, weekdayFull } from "@/lib/format";
import { Header } from "@/components/ui/Header";
import { MetaBar } from "@/components/ui/MetaBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DayCard } from "@/components/ui/DayCard";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";

function findNextDate(lessons: Lesson[], after: string): string | null {
  return lessons.find((l) => l.date > after)?.date ?? null;
}

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
  semester: number | null;
  today: string;
  filters?: React.ReactNode;
}

export function TodayContent({
  schedule,
  semesters,
  semester,
  today,
  filters,
}: Props) {
  if (!schedule) {
    return (
      <main>
        <Header active="/" semester={semester} />
        <EmptyState><p>Brak danych.</p></EmptyState>
      </main>
    );
  }

  const todayLessons = schedule.lessons.filter((l) => l.date === today);
  const relevantLessons = filterBySemester(todayLessons, semester);
  const nextDate = findNextDate(filterBySemester(schedule.lessons, semester), today);

  return (
    <main>
      <Header active="/" semester={semester} />

      <MetaBar updatedAt={schedule.updatedAt} pdfUrl={schedule.pdfUrl} />

      {filters && (
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">{filters}</div>
      )}

      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {weekdayFull(today)}, {formatDate(today)}
      </h2>

      {relevantLessons.length === 0 && (
        <EmptyState>
          <p>Dziś nie ma zajęć.</p>
          {nextDate && (
            <p className="mt-4">
              Najbliższe zajęcia:{" "}
              <Link
                href={`/all?date=${nextDate}${semester ? `&semester=${semester}` : ""}`}
                className="text-gray-900 font-semibold underline underline-offset-2 hover:text-gray-500"
              >
                {weekdayFull(nextDate)}, {formatDate(nextDate)}
              </Link>
            </p>
          )}
        </EmptyState>
      )}

      {relevantLessons.length > 0 && semester && (
        <DayCard date={today}>
          <ScheduleTable lessons={relevantLessons} />
        </DayCard>
      )}

      {relevantLessons.length > 0 && !semester && (
        <DayCard date={today}>
          <ScheduleGrid slots={buildTimeSlots(todayLessons)} semesters={semesters} />
        </DayCard>
      )}
    </main>
  );
}
