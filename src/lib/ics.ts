import type { Lesson } from "@/lib/scraper/types";

const TZID = "Europe/Warsaw";

function toICSDateTime(date: string, time: string): string {
  const [y, m, d] = date.split("-");
  const [h, min] = time.split(":");
  return `${y}${m}${d}T${h}${min}00`;
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

function lessonToVEvent(lesson: Lesson): string {
  const summary = lesson.room
    ? `${lesson.subject} (${lesson.room})`
    : lesson.subject;

  return [
    "BEGIN:VEVENT",
    `DTSTART;TZID=${TZID}:${toICSDateTime(lesson.date, lesson.start)}`,
    `DTEND;TZID=${TZID}:${toICSDateTime(lesson.date, lesson.end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:Semestr ${lesson.semester}`,
    "END:VEVENT",
  ].join("\r\n");
}

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:STANDARD",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "END:STANDARD",
  "BEGIN:DAYLIGHT",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "END:DAYLIGHT",
  "END:VTIMEZONE",
].join("\r\n");

export function generateICS(lessons: Lesson[]): string {
  const events = lessons.map(lessonToVEvent).join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ZAK Gdańsk//Plan zajęć//PL",
    "CALSCALE:GREGORIAN",
    VTIMEZONE,
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
