const WEEKDAYS_FULL: Record<number, string> = {
  0: "Niedziela",
  1: "Poniedziałek",
  2: "Wtorek",
  3: "Środa",
  4: "Czwartek",
  5: "Piątek",
  6: "Sobota",
};

const WEEKDAYS_SHORT: Record<number, string> = {
  0: "Ndz",
  1: "Pon",
  2: "Wt",
  3: "Śr",
  4: "Czw",
  5: "Pt",
  6: "Sob",
};

export function formatDate(d: string): string {
  const [y, m, dd] = d.split("-");
  return `${dd}.${m}.${y}`;
}

export function weekdayFull(d: string): string {
  return WEEKDAYS_FULL[new Date(d).getDay()] ?? "";
}

export function weekdayShort(d: string): string {
  return WEEKDAYS_SHORT[new Date(d).getDay()] ?? "";
}
