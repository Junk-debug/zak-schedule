import type { Lesson } from "@/lib/scraper/types";

interface ScheduleTableProps {
  lessons: Lesson[];
}

export function ScheduleTable({ lessons }: ScheduleTableProps) {
  const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[400px]">
        <thead>
          <tr>
            <th className="px-3.5 py-2.5 w-8 text-center text-[0.6875rem] font-semibold text-muted uppercase tracking-wider">#</th>
            <th className="px-3.5 py-2.5 w-28 text-left text-[0.6875rem] font-semibold text-muted uppercase tracking-wider">Godzina</th>
            <th className="px-3.5 py-2.5 text-left text-[0.6875rem] font-semibold text-muted uppercase tracking-wider">Przedmiot</th>
            <th className="px-3.5 py-2.5 w-15 text-center text-[0.6875rem] font-semibold text-muted uppercase tracking-wider">Sala</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((l) => (
            <tr
              key={l.lesson}
              className="border-t border-border-light hover:bg-surface transition-colors"
            >
              <td className="px-3.5 py-2.5 text-center text-muted">{l.lesson}</td>
              <td className="px-3.5 py-2.5 tabular-nums whitespace-nowrap text-gray-500 text-sm">
                {l.start}&ndash;{l.end}
              </td>
              <td className="px-3.5 py-2.5 font-medium text-gray-900">{l.subject}</td>
              <td className="px-3.5 py-2.5 text-center text-muted text-sm">
                {l.room || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
