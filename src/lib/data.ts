import path from "node:path";
import type { ScheduleStore } from "@/lib/scraper/types";
import { ZakScraper } from "@/lib/scraper/scraper";
import { ScheduleParser } from "@/lib/scraper/parser";
import { ScheduleFileStore } from "@/lib/scraper/store";
import { logger as baseLogger } from "@/lib/scraper/logger";

const log = baseLogger.child({ module: "data" });

const BASE_URL = "https://gdansk.zak.edu.pl";
const DATA_DIR = path.resolve(process.cwd(), "data");
const FRESHNESS_TTL = 60 * 60 * 1000; // 1 hour

const store = new ScheduleFileStore(DATA_DIR);
const scraper = new ZakScraper(BASE_URL);
const parser = new ScheduleParser();

let scrapePromise: Promise<void> | null = null;

async function ensureFresh(): Promise<void> {
  await store.ensureDir();

  const existing = await store.loadSchedule();
  const meta = await store.loadMeta();

  if (existing && meta?.lastChecked) {
    const age = Date.now() - new Date(meta.lastChecked).getTime();
    if (age < FRESHNESS_TTL) {
      log.info({ ageMinutes: Math.round(age / 60000), ttlMinutes: Math.round(FRESHNESS_TTL / 60000) }, "Schedule is fresh, skipping scrape");
      return;
    }
  }

  if (existing) {
    await scrapeInBackground(meta);
    return;
  }

  // No data at all — must scrape synchronously
  if (!scrapePromise) {
    scrapePromise = doScrape(meta, existing).finally(() => {
      scrapePromise = null;
    });
  }
  await scrapePromise;
}

async function scrapeInBackground(meta: Awaited<ReturnType<typeof store.loadMeta>>): Promise<void> {
  try {
    await doScrape(meta, true);
  } catch (err) {
    log.error({ err }, "Background scrape failed");
  }
}

async function doScrape(meta: Awaited<ReturnType<typeof store.loadMeta>>, hasExisting: unknown): Promise<void> {
  log.info("Starting scrape");
  const articleUrl = await scraper.findScheduleArticleUrl();
  if (!articleUrl) {
    const msg = "Schedule article not found";
    if (!hasExisting) throw new Error(msg);
    log.warn(msg);
    return;
  }

  const pdfUrl = await scraper.findPdfUrl(articleUrl);
  if (!pdfUrl) {
    const msg = "PDF link not found";
    if (!hasExisting) throw new Error(msg);
    log.warn(msg);
    return;
  }

  const now = new Date().toISOString();

  if (meta?.lastPdfUrl === pdfUrl) {
    log.info({ pdfUrl }, "Same PDF, updating lastChecked");
    await store.saveMeta({ lastPdfUrl: meta.lastPdfUrl, lastChanged: meta.lastChanged, lastChecked: now });
    return;
  }

  log.info({ pdfUrl }, "New PDF found, parsing");
  const lessons = await parser.parse(pdfUrl);

  const schedule: ScheduleStore = { updatedAt: now, pdfUrl, lessons };
  await store.saveSchedule(schedule);
  await store.saveMeta({
    lastPdfUrl: pdfUrl,
    lastChecked: now,
    lastChanged: now,
  });

  log.info({ lessons: lessons.length }, "Schedule updated");
}

export async function loadSchedule(): Promise<ScheduleStore | null> {
  await ensureFresh();
  return store.loadSchedule();
}

export async function listArchives(): Promise<string[]> {
  await ensureFresh();
  return store.listArchives();
}

export async function loadArchive(
  filename: string
): Promise<ScheduleStore | null> {
  return store.loadArchive(filename);
}
