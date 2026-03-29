import { readFile, writeFile, mkdir, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { ScheduleStore, Meta } from "./types";
import { logger as baseLogger } from "./logger";

const log = baseLogger.child({ module: "store" });

function isFileNotFound(err: unknown): boolean {
  return err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT";
}

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
      log.debug({ dir: this.dataDir }, "Creating data directory");
      await mkdir(this.dataDir, { recursive: true });
    }
    if (!existsSync(this.archiveDir)) {
      log.debug({ dir: this.archiveDir }, "Creating archive directory");
      await mkdir(this.archiveDir, { recursive: true });
    }
  }

  async loadSchedule(): Promise<ScheduleStore | null> {
    log.debug({ path: this.schedulePath }, "Loading schedule");
    try {
      const raw = await readFile(this.schedulePath, "utf-8");
      const store = JSON.parse(raw) as ScheduleStore;
      log.trace({ lessons: store.lessons.length, updatedAt: store.updatedAt }, "Schedule loaded");
      return store;
    } catch (err: unknown) {
      if (isFileNotFound(err)) {
        log.debug("No schedule file found");
        return null;
      }
      throw err;
    }
  }

  async saveSchedule(store: ScheduleStore): Promise<void> {
    log.info({ lessons: store.lessons.length, pdfUrl: store.pdfUrl }, "Saving schedule");
    await this.archiveCurrent();
    await writeFile(this.schedulePath, JSON.stringify(store, null, 2));
    log.debug({ path: this.schedulePath }, "Schedule written to disk");
  }

  private async archiveCurrent(): Promise<void> {
    const current = await this.loadSchedule();
    if (!current) return;

    const date = current.updatedAt.slice(0, 10);
    let archivePath = path.join(this.archiveDir, `schedule-${date}.json`);

    if (existsSync(archivePath)) {
      const time = current.updatedAt.slice(11, 19).replace(/:/g, "");
      archivePath = path.join(this.archiveDir, `schedule-${date}-${time}.json`);
    }

    if (!existsSync(archivePath)) {
      log.info({ archivePath }, "Archiving current schedule");
      await copyFile(this.schedulePath, archivePath);
    } else {
      log.debug({ archivePath }, "Archive already exists, skipping");
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
    const resolved = path.resolve(this.archiveDir, filename);
    if (!resolved.startsWith(this.archiveDir + path.sep)) return null;

    try {
      const raw = await readFile(resolved, "utf-8");
      return JSON.parse(raw) as ScheduleStore;
    } catch (err: unknown) {
      if (isFileNotFound(err)) return null;
      throw err;
    }
  }

  async loadMeta(): Promise<Meta | null> {
    log.debug({ path: this.metaPath }, "Loading meta");
    try {
      const raw = await readFile(this.metaPath, "utf-8");
      const meta = JSON.parse(raw) as Meta;
      log.trace({ meta }, "Meta loaded");
      return meta;
    } catch (err: unknown) {
      if (isFileNotFound(err)) {
        log.debug("No meta file found");
        return null;
      }
      throw err;
    }
  }

  async saveMeta(meta: Meta): Promise<void> {
    log.info({ meta }, "Saving meta");
    await writeFile(this.metaPath, JSON.stringify(meta, null, 2));
  }
}
