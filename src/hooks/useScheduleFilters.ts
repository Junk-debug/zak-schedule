import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

export function useScheduleFilters() {
  const [semester, setSemester] = useQueryState("semester", parseAsInteger);
  const [date, setDate] = useQueryState("date", parseAsString);

  return { semester, setSemester, date, setDate };
}
