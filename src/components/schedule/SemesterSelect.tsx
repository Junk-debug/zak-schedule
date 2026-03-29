"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";

interface SemesterSelectProps {
  semesters: number[];
  value: number | null;
}

export function SemesterSelect({ semesters, value }: SemesterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("semester", val);
    } else {
      params.delete("semester");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <Select
      value={value?.toString() ?? ""}
      onChange={handleChange}
      options={[
        { value: "", label: "Wszystkie semestry" },
        ...semesters.map((s) => ({ value: s.toString(), label: `Semestr ${s}` })),
      ]}
    />
  );
}
