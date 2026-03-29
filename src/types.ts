export interface Lesson {
  date: string;
  lesson: number;
  start: string;
  end: string;
  subject: string;
  room: string;
  semester: number;
}

export interface ScheduleStore {
  updatedAt: string;
  pdfUrl: string;
  lessons: Lesson[];
}

export interface Meta {
  lastPdfUrl: string;
  lastChecked: string;
  lastChanged: string;
}

export interface RawLesson {
  date: string;
  lesson: number;
  start: string;
  end: string;
  subjects: Record<string, string[]>;
}

export interface RefreshResult {
  changed: boolean;
  updatedAt: string;
}
