export function getPolandMinutes(): number {
  const now = new Date();
  const poland = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Warsaw",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(now);
  const [h, m] = poland.split(":").map(Number);
  return h * 60 + m;
}

export function getPolandDate(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts; // YYYY-MM-DD
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
