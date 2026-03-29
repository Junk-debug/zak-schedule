export function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function currentTimeInMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function parseDateParts(date: string): [number, number, number] {
  const [year, month, day] = date.split("-").map(Number);
  return [year, month, day];
}

export function parseTimeParts(time: string): [number, number] {
  const [h, m] = time.split(":").map(Number);
  return [h, m];
}
