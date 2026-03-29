"use client";

import { Select } from "@/components/ui/Select";
import { formatDate, weekdayShort } from "@/lib/format";

interface DateSelectProps {
  dates: string[];
  value: string;
  onChange: (value: string) => void;
}

export function DateSelect({ dates, value, onChange }: DateSelectProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={dates.map((d) => ({
        value: d,
        label: `${weekdayShort(d)} ${formatDate(d)}`,
      }))}
      className="min-w-50"
    />
  );
}
