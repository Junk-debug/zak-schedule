import type { Lesson } from "@/lib/scraper/types";

function toICSDateTime(date: string, time: string): string {
  const [y, m, d] = date.split("-");
  const [h, min] = time.split(":");
  return `${y}${m}${d}T${h}${min}00`;
}

function escapeText(text: string): string {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`);
}

function lessonToVEvent(lesson: Lesson): string {
  const summary = lesson.room
    ? `${lesson.subject} (${lesson.room})`
    : lesson.subject;

  return [
    "BEGIN:VEVENT",
    `DTSTART:${toICSDateTime(lesson.date, lesson.start)}`,
    `DTEND:${toICSDateTime(lesson.date, lesson.end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:Semestr ${lesson.semester}`,
    "END:VEVENT",
  ].join("\r\n");
}

export function generateICS(lessons: Lesson[]): string {
  const events = lessons.map(lessonToVEvent).join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ZAK Gdańsk//Plan zajęć//PL",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(lessons: Lesson[], filename = "schedule.ics") {
  const content = generateICS(lessons);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
