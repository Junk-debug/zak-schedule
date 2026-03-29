import * as cheerio from "cheerio";
import { logger as baseLogger } from "./logger";

const log = baseLogger.child({ module: "scraper" });

export class ZakScraper {
  constructor(private readonly baseUrl: string) {}

  async findScheduleArticleUrl(): Promise<string | null> {
    const url = `${this.baseUrl}/aktualnosci`;
    log.debug({ url }, "Fetching news page");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch news page: ${res.status}`);
    const html = await res.text();
    log.trace({ bytes: html.length }, "News page loaded");
    const $ = cheerio.load(html);

    let found: string | null = null;
    const candidates: string[] = [];

    $(".news a").each((_, el) => {
      const title = $(el).find(".title").text().toUpperCase();
      const href = $(el).attr("href");
      candidates.push(title);

      if (title.includes("PLAN ZAJĘĆ") && title.includes("LICEUM") && href) {
        found = this.baseUrl + href;
        return false;
      }
    });

    log.debug({ candidates: candidates.length, titles: candidates.slice(0, 5) }, "Scanned news articles");
    if (found) {
      log.info({ articleUrl: found }, "Found schedule article");
    } else {
      log.warn("No schedule article found among candidates");
    }

    return found;
  }

  async findPdfUrl(articleUrl: string): Promise<string | null> {
    log.debug({ articleUrl }, "Fetching article page");
    const res = await fetch(articleUrl);
    if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);
    const html = await res.text();
    log.trace({ bytes: html.length }, "Article page loaded");
    const $ = cheerio.load(html);

    let pdfUrl: string | null = null;
    const links: string[] = [];

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href) links.push(href);
      if (href && href.toLowerCase().endsWith(".pdf")) {
        pdfUrl = href.startsWith("http") ? href : this.baseUrl + href;
        return false;
      }
    });

    log.debug({ totalLinks: links.length }, "Scanned links in article");
    if (pdfUrl) {
      log.info({ pdfUrl }, "Found PDF link");
    } else {
      log.warn({ links: links.slice(0, 10) }, "No PDF link found in article");
    }

    return pdfUrl;
  }
}
