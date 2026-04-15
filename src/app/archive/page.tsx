import { Suspense } from "react";
import { listArchives, loadArchive } from "@/lib/data";
import type { ScheduleStore } from "@/lib/scraper/types";
import { Header } from "@/components/ui/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArchiveView } from "./_components/ArchiveView";

export interface ArchiveEntry {
  file: string;
  schedule: ScheduleStore;
}

export default async function ArchivePage() {
  const files = await listArchives();
  const entries: ArchiveEntry[] = [];
  for (const file of files) {
    const schedule = await loadArchive(file);
    if (schedule) entries.push({ file, schedule });
  }

  return (
    <Suspense
      fallback={
        <main>
          <Header active="/archive" />
          <EmptyState><p>Ładowanie archiwów...</p></EmptyState>
        </main>
      }
    >
      <ArchiveView entries={entries} />
    </Suspense>
  );
}
