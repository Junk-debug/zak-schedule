import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api.js";
import type { Lesson, RawLesson } from "./types";
import { logger as baseLogger } from "./logger";

const log = baseLogger.child({ module: "parser" });


interface PdfTextItem {
  str: string;
  transform: number[];
}

interface TextRow {
  y: number;
  items: PdfTextItem[];
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;
const LESSON_PATTERN = /^(\d+)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/;
const ROOM_ADDRESS_PATTERN = /^(\d+\/\d+)/;
const SEMESTER_NUMBER_PATTERN = /semestr\s+(\d+)/i;
const Y_TOLERANCE = 3;
const MIN_SUBJECT_X = 90;

export class ScheduleParser {
  async parse(pdfUrl: string): Promise<Lesson[]> {
    log.info({ pdfUrl }, "Starting PDF parse");
    const rawLessons = await this.extractRawLessons(pdfUrl);
    log.debug({ rawLessons: rawLessons.length }, "Raw lessons extracted");
    const lessons = this.expandAllSemesters(rawLessons);
    log.info({ total: lessons.length }, "PDF parse complete");
    return lessons;
  }

  private async extractRawLessons(pdfUrl: string): Promise<RawLesson[]> {
    const buffer = await this.fetchPdfBuffer(pdfUrl);
    log.debug({ bytes: buffer.byteLength }, "PDF buffer loaded");
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    log.debug({ pages: pdf.numPages }, "PDF document opened");

    try {
      const result: RawLesson[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const pageLessons = await this.parsePage(pdf, p);
        log.debug({ page: p, lessons: pageLessons.length }, "Page parsed");
        result.push(...pageLessons);
      }
      return result;
    } finally {
      pdf.destroy();
    }
  }

  private async fetchPdfBuffer(url: string): Promise<ArrayBuffer> {
    log.debug({ url }, "Fetching PDF");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
    return res.arrayBuffer();
  }

  private async parsePage(
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNum: number
  ): Promise<RawLesson[]> {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items = content.items.filter(
      (item): item is TextItem => "str" in item
    ) as PdfTextItem[];
    const rows = this.groupByY(items);
    log.trace({ page: pageNum, textItems: items.length, rows: rows.length }, "Page text extracted");

    const result: RawLesson[] = [];
    let currentDate: string | null = null;
    let colBoundaries: number[] | null = null;
    let semesterLabels: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const sortedItems = row.items.sort(
        (a, b) => a.transform[4] - b.transform[4]
      );
      const joinedText = sortedItems.map((t) => t.str.trim()).join(" ");

      const dateMatch = joinedText.match(DATE_PATTERN);
      if (dateMatch) {
        currentDate = dateMatch[0];
        log.trace({ date: currentDate, page: pageNum }, "Found date row");
        continue;
      }

      if (joinedText.includes("semestr") && joinedText.includes("Godzina")) {
        const semesterItems = sortedItems.filter((t) =>
          t.str.includes("semestr")
        );
        colBoundaries = semesterItems.map((t) => t.transform[4]);
        semesterLabels = semesterItems.map((t) => t.str.trim());
        log.debug({ semesterLabels, colBoundaries, page: pageNum }, "Found semester header");
        continue;
      }

      const match = joinedText.match(LESSON_PATTERN);
      if (match?.[1] && match[2] && match[3] && currentDate && colBoundaries) {
        // Collect items from the lesson row AND any trailing data rows
        // (subject names and room info live on different Y-levels)
        const allItems = [...sortedItems];

        while (i + 1 < rows.length) {
          const nextRow = rows[i + 1];
          const nextSorted = nextRow.items.sort(
            (a, b) => a.transform[4] - b.transform[4]
          );
          const nextJoined = nextSorted.map((t) => t.str.trim()).join(" ");

          const isStructuralRow =
            DATE_PATTERN.test(nextJoined) ||
            (nextJoined.includes("semestr") && nextJoined.includes("Godzina")) ||
            LESSON_PATTERN.test(nextJoined);

          if (isStructuralRow) break;

          allItems.push(...nextSorted);
          i++;
        }

        const subjects = this.groupSubjectsByColumn(
          allItems,
          colBoundaries,
          semesterLabels
        );

        log.trace(
          { date: currentDate, lesson: +match[1], start: match[2], end: match[3], subjects, itemCount: allItems.length },
          "Parsed lesson row"
        );

        result.push({
          date: currentDate,
          lesson: +match[1],
          start: match[2],
          end: match[3],
          subjects,
        });
      }
    }

    return result;
  }

  private groupSubjectsByColumn(
    items: PdfTextItem[],
    colBoundaries: number[],
    semesterLabels: string[]
  ): Record<string, string[]> {
    const subjects: Record<string, string[]> = {};

    for (const item of items) {
      const x = item.transform[4];
      if (x <= MIN_SUBJECT_X) continue;

      const colIndex = this.findClosestColumn(x, colBoundaries);
      const label = semesterLabels[colIndex] || `col${colIndex}`;

      if (!subjects[label]) subjects[label] = [];
      subjects[label].push(item.str.trim());
    }

    return subjects;
  }

  private findClosestColumn(x: number, boundaries: number[]): number {
    let closest = 0;
    let minDist = Infinity;

    for (let i = 0; i < boundaries.length; i++) {
      const dist = Math.abs(x - boundaries[i]);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }

    return closest;
  }

  private groupByY(items: PdfTextItem[]): TextRow[] {
    const rows: TextRow[] = [];

    for (const item of items) {
      if (!item.str.trim()) continue;

      const existingRow = rows.find(
        (r) => Math.abs(r.y - item.transform[5]) < Y_TOLERANCE
      );

      if (existingRow) {
        existingRow.items.push(item);
      } else {
        rows.push({ y: item.transform[5], items: [item] });
      }
    }

    return rows.sort((a, b) => b.y - a.y);
  }

  private expandAllSemesters(rawLessons: RawLesson[]): Lesson[] {
    const lessons: Lesson[] = [];
    let skippedNoSemester = 0;
    let skippedNoSubject = 0;

    for (const entry of rawLessons) {
      for (const [semesterLabel, parts] of Object.entries(entry.subjects)) {
        if (!parts || parts.length === 0) continue;

        const semesterNumber = this.parseSemesterNumber(semesterLabel);
        if (!semesterNumber) {
          skippedNoSemester++;
          log.trace({ semesterLabel, parts }, "Skipped: no semester number");
          continue;
        }

        const { subject, room } = this.extractSubjectAndRoom(parts);
        if (!subject) {
          skippedNoSubject++;
          log.trace({ semesterLabel, parts }, "Skipped: no subject extracted");
          continue;
        }

        lessons.push({
          date: entry.date,
          lesson: entry.lesson,
          start: entry.start,
          end: entry.end,
          semester: semesterNumber,
          subject,
          room,
        });
      }
    }

    log.debug({ expanded: lessons.length, skippedNoSemester, skippedNoSubject }, "Semester expansion complete");
    return lessons;
  }

  private parseSemesterNumber(label: string): number | null {
    const match = label.match(SEMESTER_NUMBER_PATTERN);
    return match ? Number(match[1]) : null;
  }

  private extractSubjectAndRoom(parts: string[]): {
    subject: string;
    room: string;
  } {
    let subject = "";
    let room = "";

    for (const part of parts) {
      const roomMatch = part.match(ROOM_ADDRESS_PATTERN);
      if (roomMatch) {
        room = roomMatch[1];
      } else {
        subject = part.trim();
      }
    }

    return { subject, room };
  }
}
