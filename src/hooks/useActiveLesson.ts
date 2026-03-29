"use client";

import { useState, useEffect } from "react";
import { getPolandMinutes, timeToMinutes } from "@/lib/poland-time";
import type { Lesson } from "@/lib/scraper/types";

export function useActiveLesson(lessons: Lesson[]): number | null {
  const [active, setActive] = useState<number | null>(() => findActive(lessons));

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(findActive(lessons));
    }, 30_000);
    return () => clearInterval(interval);
  }, [lessons]);

  return active;
}

function findActive(lessons: Lesson[]): number | null {
  const now = getPolandMinutes();
  for (const l of lessons) {
    const start = timeToMinutes(l.start);
    const end = timeToMinutes(l.end);
    if (now >= start && now < end) return l.lesson;
  }
  return null;
}
