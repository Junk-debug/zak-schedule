import { formatDate, weekdayShort } from "@/lib/format";

interface DayCardProps {
  date: string;
  label?: string;
  children: React.ReactNode;
}

export function DayCard({ date, label, children }: DayCardProps) {
  return (
    <div className="bg-white rounded-lg mb-5 overflow-hidden border border-border">
      {(date || label) && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-surface">
          <span className="font-semibold text-sm text-gray-900">
            {weekdayShort(date)} {formatDate(date)}
          </span>
          {label && <span className="text-sm text-muted">{label}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
