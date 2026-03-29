import type { Lesson } from "@/lib/scraper/types";

export interface TimeSlot {
  lesson: number;
  start: string;
  end: string;
  bySemester: Record<number, { subject: string; room: string }>;
}

export function buildTimeSlots(lessons: Lesson[]): TimeSlot[] {
  const slotMap = new Map<number, TimeSlot>();

  for (const l of lessons) {
    let slot = slotMap.get(l.lesson);
    if (!slot) {
      slot = { lesson: l.lesson, start: l.start, end: l.end, bySemester: {} };
      slotMap.set(l.lesson, slot);
    }
    slot.bySemester[l.semester] = { subject: l.subject, room: l.room };
  }

  return Array.from(slotMap.values()).sort((a, b) => a.lesson - b.lesson);
}

export function extractSemesters(lessons: Lesson[]): number[] {
  return [...new Set(lessons.map((l) => l.semester))].sort((a, b) => a - b);
}

export function extractDates(lessons: Lesson[]): string[] {
  return [...new Set(lessons.map((l) => l.date))].sort();
}

export function filterBySemester(
  lessons: Lesson[],
  semester: number | null
): Lesson[] {
  return semester ? lessons.filter((l) => l.semester === semester) : lessons;
}
