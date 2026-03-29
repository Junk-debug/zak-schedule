import path from "node:path";
import type { ScheduleStore } from "@/lib/scraper/types";
import { ZakScraper } from "@/lib/scraper/scraper";
import { ScheduleParser } from "@/lib/scraper/parser";
import { ScheduleFileStore } from "@/lib/scraper/store";

const BASE_URL = "https://gdansk.zak.edu.pl";
const DATA_DIR = path.resolve(process.cwd(), "data");

const store = new ScheduleFileStore(DATA_DIR);
const scraper = new ZakScraper(BASE_URL);
const parser = new ScheduleParser();

let refreshed = false;

async function ensureFresh(): Promise<void> {
  if (refreshed) return;
  refreshed = true;

  await store.ensureDir();

  const meta = await store.loadMeta();
  const existing = await store.loadSchedule();

  // Skip scraping if we have data and checked recently (within 1 hour)
  if (existing && meta?.lastChecked) {
    const age = Date.now() - new Date(meta.lastChecked).getTime();
    if (age < 60 * 60 * 1000) {
      console.log("[data] Schedule is fresh, skipping scrape");
      return;
    }
  }

  try {
    console.log("[data] Scraping schedule...");
    const articleUrl = await scraper.findScheduleArticleUrl();
    if (!articleUrl) {
      console.warn("[data] Schedule article not found");
      return;
    }

    const pdfUrl = await scraper.findPdfUrl(articleUrl);
    if (!pdfUrl) {
      console.warn("[data] PDF link not found");
      return;
    }

    const now = new Date().toISOString();

    // If same PDF URL, just update lastChecked
    if (meta && meta.lastPdfUrl === pdfUrl) {
      console.log("[data] Same PDF, updating lastChecked");
      await store.saveMeta({ ...meta, lastChecked: now });
      return;
    }

    // New PDF — parse and save
    console.log("[data] New PDF found, parsing...");
    const lessons = await parser.parse(pdfUrl);

    const schedule: ScheduleStore = { updatedAt: now, pdfUrl, lessons };
    await store.saveSchedule(schedule);
    await store.saveMeta({
      lastPdfUrl: pdfUrl,
      lastChecked: now,
      lastChanged: now,
    });

    console.log(`[data] Schedule updated: ${lessons.length} lessons`);
  } catch (err) {
    console.error("[data] Scrape failed:", err);
    if (!existing) {
      throw new Error(`Scrape failed and no existing data: ${err}`);
    }
  }
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
