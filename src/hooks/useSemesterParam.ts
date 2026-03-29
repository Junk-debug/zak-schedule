import { useSearchParams } from "next/navigation";

export function useSemesterParam(): number | null {
  const searchParams = useSearchParams();
  const raw = searchParams.get("semester");
  return raw ? Number(raw) : null;
}
