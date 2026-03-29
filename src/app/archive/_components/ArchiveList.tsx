import Link from "next/link";
import { formatDate, weekdayShort } from "@/lib/format";

function dateFromFilename(filename: string): string {
  return filename.replace("schedule-", "").replace(".json", "");
}

export function ArchiveList({ archives }: { archives: string[] }) {
  return (
    <div className="flex flex-col rounded-lg border border-border overflow-hidden">
      {archives.map((filename) => {
        const date = dateFromFilename(filename);
        return (
          <Link
            key={filename}
            href={`/archive?file=${filename}`}
            className="flex justify-between items-center px-4 py-3 bg-white text-gray-900 no-underline hover:bg-surface transition-colors border-t border-border first:border-t-0"
          >
            <span className="font-medium text-sm">
              {weekdayShort(date)} {formatDate(date)}
            </span>
            <span className="text-muted text-sm">→</span>
          </Link>
        );
      })}
    </div>
  );
}
