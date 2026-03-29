import { Suspense } from "react";
import { listArchives } from "@/lib/data";
import { ArchiveView } from "./_components/ArchiveView";

export default async function ArchivePage() {
  const archives = await listArchives();

  return (
    <Suspense>
      <ArchiveView archives={archives} />
    </Suspense>
  );
}
