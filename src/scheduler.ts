import type { ZakScraper } from "./scraper.js";
import type { ScheduleParser } from "./parser.js";
import type { ScheduleFileStore } from "./store.js";
import type { RefreshResult, ScheduleStore } from "./types.js";

export class ScheduleRefresher {
  constructor(
    private readonly scraper: ZakScraper,
    private readonly parser: ScheduleParser,
    private readonly store: ScheduleFileStore
  ) {}

  async refresh(): Promise<RefreshResult> {
    await this.store.ensureDir();

    const pdfUrl = await this.resolvePdfUrl();
    const now = new Date().toISOString();
    const meta = await this.store.loadMeta();

    if (meta && meta.lastPdfUrl === pdfUrl) {
      await this.store.saveMeta({ ...meta, lastChecked: now });
      console.log(`[${now}] Schedule unchanged (same PDF URL)`);
      return { changed: false, updatedAt: meta.lastChanged };
    }

    const lessons = await this.parser.parse(pdfUrl);

    const schedule: ScheduleStore = {
      updatedAt: now,
      pdfUrl,
      lessons,
    };

    await this.store.saveSchedule(schedule);
    await this.store.saveMeta({
      lastPdfUrl: pdfUrl,
      lastChecked: now,
      lastChanged: now,
    });

    console.log(
      `[${now}] Schedule updated: ${lessons.length} lessons from ${pdfUrl}`
    );
    return { changed: true, updatedAt: now };
  }

  private async resolvePdfUrl(): Promise<string> {
    const articleUrl = await this.scraper.findScheduleArticleUrl();
    if (!articleUrl) {
      throw new Error("Schedule article not found on the news page");
    }

    const pdfUrl = await this.scraper.findPdfUrl(articleUrl);
    if (!pdfUrl) {
      throw new Error("PDF link not found in the article");
    }

    return pdfUrl;
  }
}
