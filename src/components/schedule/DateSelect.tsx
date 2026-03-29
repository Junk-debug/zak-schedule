"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { formatDate, weekdayShort } from "@/lib/format";

interface DateSelectProps {
  dates: string[];
  value: string;
}

export function DateSelect({ dates, value }: DateSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("date", val);
    } else {
      params.delete("date");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
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
