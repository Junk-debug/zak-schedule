import { readFile, writeFile, mkdir, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { ScheduleStore, Meta } from "./types.js";

export class ScheduleFileStore {
  private readonly schedulePath: string;
  private readonly metaPath: string;
  private readonly dataDir: string;

  private readonly archiveDir: string;

  constructor(dataDir: string) {
    this.dataDir = path.resolve(dataDir);
    this.schedulePath = path.join(this.dataDir, "schedule.json");
    this.metaPath = path.join(this.dataDir, "meta.json");
    this.archiveDir = path.join(this.dataDir, "archive");
  }

  async ensureDir(): Promise<void> {
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }
    if (!existsSync(this.archiveDir)) {
      await mkdir(this.archiveDir, { recursive: true });
    }
  }

  async loadSchedule(): Promise<ScheduleStore | null> {
    try {
      const raw = await readFile(this.schedulePath, "utf-8");
      return JSON.parse(raw) as ScheduleStore;
    } catch {
      return null;
    }
  }

  async saveSchedule(store: ScheduleStore): Promise<void> {
    await this.archiveCurrent();
    await writeFile(this.schedulePath, JSON.stringify(store, null, 2));
  }

  private async archiveCurrent(): Promise<void> {
    const current = await this.loadSchedule();
    if (!current) return;

    const date = current.updatedAt.slice(0, 10);
    const archivePath = path.join(this.archiveDir, `schedule-${date}.json`);

    if (!existsSync(archivePath)) {
      await copyFile(this.schedulePath, archivePath);
    }
  }

  async listArchives(): Promise<string[]> {
    if (!existsSync(this.archiveDir)) return [];
    const files = await readdir(this.archiveDir);
    return files
      .filter((f) => f.startsWith("schedule-") && f.endsWith(".json"))
      .sort()
      .reverse();
  }

  async loadArchive(filename: string): Promise<ScheduleStore | null> {
    try {
      const raw = await readFile(path.join(this.archiveDir, filename), "utf-8");
      return JSON.parse(raw) as ScheduleStore;
    } catch {
      return null;
    }
  }

  async loadMeta(): Promise<Meta | null> {
    try {
      const raw = await readFile(this.metaPath, "utf-8");
      return JSON.parse(raw) as Meta;
    } catch {
      return null;
    }
  }

  async saveMeta(meta: Meta): Promise<void> {
    await writeFile(this.metaPath, JSON.stringify(meta, null, 2));
  }
}
