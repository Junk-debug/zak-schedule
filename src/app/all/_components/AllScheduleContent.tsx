import type { ScheduleStore } from "@/lib/scraper/types";
import { buildTimeSlots, filterBySemester } from "@/lib/schedule";
import { formatDate } from "@/lib/format";
import { Header } from "@/components/ui/Header";
import { MetaBar } from "@/components/ui/MetaBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DayCard } from "@/components/ui/DayCard";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";

interface Props {
  schedule: ScheduleStore | null;
  semesters: number[];
  semester: number | null;
  date: string;
  filters?: React.ReactNode;
}

export function AllScheduleContent({
  schedule,
  semesters,
  semester,
  date,
  filters,
}: Props) {
  if (!schedule) {
    return (
      <main>
        <Header active="/all" semester={semester} />
        <EmptyState><p>Brak danych.</p></EmptyState>
      </main>
    );
  }

  const dateLessons = schedule.lessons.filter((l) => l.date === date);
  const semesterLessons = filterBySemester(dateLessons, semester);

  return (
    <main>
      <Header active="/all" semester={semester} />

      <MetaBar updatedAt={schedule.updatedAt} pdfUrl={schedule.pdfUrl} />

      {filters && (
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">{filters}</div>
      )}

      {semesterLessons.length === 0 && (
        <EmptyState>
          <p>Brak zajęć w dniu {formatDate(date)}.</p>
        </EmptyState>
      )}

      {semesterLessons.length > 0 && semester && (
        <DayCard date={date} label={`Semestr ${semester}`}>
          <ScheduleTable lessons={semesterLessons} />
        </DayCard>
      )}

      {semesterLessons.length > 0 && !semester && (
        <DayCard date={date} label="Wszystkie semestry">
          <ScheduleGrid slots={buildTimeSlots(dateLessons)} semesters={semesters} />
        </DayCard>
      )}
    </main>
  );
}
