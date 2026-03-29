"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { formatDate, weekdayShort } from "@/lib/format";

interface DateSelectProps {
  dates: string[];
  value: string;
}

export function DateSelect({ dates, value }: DateSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("date", val);
    } else {
      params.delete("date");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={dates.map((d) => ({
        value: d,
        label: `${weekdayShort(d)} ${formatDate(d)}`,
      }))}
      className="min-w-50"
    />
  );
}
