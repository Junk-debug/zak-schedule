import type { TimeSlot } from "@/lib/schedule";

interface ScheduleGridProps {
  slots: TimeSlot[];
  semesters: number[];
}

function SubjectCell({ info }: { info?: { subject: string; room: string } }) {
  if (!info) {
    return <td className="px-3.5 py-2.5 min-w-28 text-gray-300">&mdash;</td>;
  }
  return (
    <td className="px-3.5 py-2.5 min-w-28 align-top">
      <span className="block font-medium text-gray-900 text-sm leading-snug">
        {info.subject}
      </span>
      {info.room && (
        <span className="block text-[0.6875rem] text-muted mt-px">
          {info.room}
        </span>
      )}
    </td>
  );
}

export function ScheduleGrid({ slots, semesters }: ScheduleGridProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[400px]">
        <thead>
          <tr>
            <th className="px-3.5 py-2.5 w-8 text-center text-[0.6875rem] font-semibold text-muted uppercase tracking-wider">#</th>
            <th className="px-3.5 py-2.5 w-28 text-left text-[0.6875rem] font-semibold text-muted uppercase tracking-wider">Godzina</th>
            {semesters.map((s) => (
              <th
                key={s}
                className="px-3.5 py-2.5 min-w-28 text-left text-[0.6875rem] font-semibold text-muted uppercase tracking-wider"
              >
                Sem. {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr
              key={slot.lesson}
              className="border-t border-border-light hover:bg-surface transition-colors"
            >
              <td className="px-3.5 py-2.5 text-center text-muted">{slot.lesson}</td>
              <td className="px-3.5 py-2.5 tabular-nums whitespace-nowrap text-gray-500 text-sm">
                {slot.start}&ndash;{slot.end}
              </td>
              {semesters.map((s) => (
                <SubjectCell key={s} info={slot.bySemester[s]} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
