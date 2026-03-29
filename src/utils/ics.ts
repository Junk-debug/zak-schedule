import type { EventAttributes } from "ics";
import type { Lesson } from "../types.js";
import { parseDateParts, parseTimeParts } from "./date.js";

export function lessonToEvent(lesson: Lesson): EventAttributes {
  const [year, month, day] = parseDateParts(lesson.date);
  const [startH, startM] = parseTimeParts(lesson.start);
  const [endH, endM] = parseTimeParts(lesson.end);

  const title = lesson.room
    ? `${lesson.subject} (${lesson.room})`
    : lesson.subject;

  return {
    title,
    start: [year, month, day, startH, startM],
    end: [year, month, day, endH, endM],
  };
}
