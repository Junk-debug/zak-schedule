import type { TimeSlot } from "@/lib/schedule";

interface ScheduleGridProps {
  slots: TimeSlot[];
  semesters: number[];
  activeLesson?: number | null;
}

function SubjectCell({
  info,
  isActive,
}: {
  info?: { subject: string; room: string };
  isActive: boolean;
}) {
  if (!info) {
    return (
      <td
        className={`px-3.5 py-2.5 min-w-28 ${isActive ? "text-gray-500" : "text-gray-300"}`}
      >
        &mdash;
      </td>
    );
  }
  return (
    <td className="px-3.5 py-2.5 min-w-28 align-top">
      <span
        className={`block font-medium text-sm leading-snug ${isActive ? "text-white" : "text-gray-900"}`}
      >
        {info.subject}
      </span>
      {info.room && (
        <span
          className={`block text-[0.6875rem] mt-px ${isActive ? "text-gray-400" : "text-muted"}`}
        >
          {info.room}
        </span>
      )}
    </td>
  );
}

export function ScheduleGrid({
  slots,
  semesters,
  activeLesson,
}: ScheduleGridProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-100">
        <thead>
          <tr>
            <th className="px-3.5 py-2.5 w-8 text-center text-[0.6875rem] font-semibold text-muted uppercase tracking-wider">
              #
            </th>
            <th className="px-3.5 py-2.5 w-28 text-left text-[0.6875rem] font-semibold text-muted uppercase tracking-wider">
              Godzina
            </th>
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
          {slots.map((slot) => {
            const isActive = activeLesson === slot.lesson;
            return (
              <tr
                key={slot.lesson}
                className={`border-t border-border-light transition-colors ${
                  isActive ? "bg-gray-900 text-white" : "hover:bg-surface"
                }`}
              >
                <td
                  className={`px-3.5 py-2.5 text-center ${isActive ? "text-gray-400" : "text-muted"}`}
                >
                  {slot.lesson}
                </td>
                <td
                  className={`px-3.5 py-2.5 tabular-nums whitespace-nowrap text-sm ${isActive ? "text-gray-300" : "text-gray-500"}`}
                >
                  {slot.start}&ndash;{slot.end}
                </td>
                {semesters.map((s) => (
                  <SubjectCell
                    key={s}
                    info={slot.bySemester[s]}
                    isActive={isActive}
                  />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
