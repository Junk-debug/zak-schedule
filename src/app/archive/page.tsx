import { Suspense } from "react";
import { listArchives } from "@/lib/data";
import { Header, HeaderLink } from "@/components/ui/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArchiveList } from "./_components/ArchiveList";
import { ArchiveView } from "./_components/ArchiveView";

export default async function ArchivePage() {
  const archives = await listArchives();

  return (
    <Suspense
      fallback={
        <main>
          <Header title="Archiwum planów zajęć">
            <HeaderLink href="/">← Dziś</HeaderLink>
            <HeaderLink href="/all" variant="secondary">Cały plan</HeaderLink>
          </Header>
          {archives.length === 0 ? (
            <EmptyState><p>Brak archiwalnych planów.</p></EmptyState>
          ) : (
            <ArchiveList archives={archives} />
          )}
        </main>
      }
    >
      <ArchiveView archives={archives} />
    </Suspense>
  );
}
