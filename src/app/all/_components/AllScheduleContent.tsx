import type { ScheduleStore } from "@/lib/scraper/types";
import { buildTimeSlots, filterBySemester } from "@/lib/schedule";
import { formatDate } from "@/lib/format";
import { Header, HeaderLink } from "@/components/ui/Header";
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
  onExportICS?: () => void;
  headerControls?: React.ReactNode;
  dateControl?: React.ReactNode;
}

export function AllScheduleContent({
  schedule,
  semesters,
  semester,
  date,
  onExportICS,
  headerControls,
  dateControl,
}: Props) {
  if (!schedule) {
    return (
      <main>
        <Header title="Plan zajęć ZAK Gdańsk">
          {headerControls}
          <HeaderLink href="/">← Dziś</HeaderLink>
          <HeaderLink href="/archive">Archiwum</HeaderLink>
        </Header>
        <EmptyState><p>Brak danych.</p></EmptyState>
      </main>
    );
  }

  const dateLessons = schedule.lessons.filter((l) => l.date === date);
  const semesterLessons = filterBySemester(dateLessons, semester);

  return (
    <main>
      <Header title="Plan zajęć ZAK Gdańsk">
        {headerControls}
        <HeaderLink href="/">← Dziś</HeaderLink>
        <HeaderLink href="/archive">Archiwum</HeaderLink>
      </Header>

      <MetaBar
        updatedAt={schedule.updatedAt}
        pdfUrl={schedule.pdfUrl}
        onExportICS={onExportICS}
      />

      {dateControl && (
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          {dateControl}
        </div>
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
