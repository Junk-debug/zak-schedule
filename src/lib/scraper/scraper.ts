import * as cheerio from "cheerio";

export class ZakScraper {
  constructor(private readonly baseUrl: string) {}

  async findScheduleArticleUrl(): Promise<string | null> {
    const res = await fetch(`${this.baseUrl}/aktualnosci`);
    if (!res.ok) throw new Error(`Failed to fetch news page: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    let found: string | null = null;

    $(".news a").each((_, el) => {
      const title = $(el).find(".title").text().toUpperCase();
      const href = $(el).attr("href");

      if (title.includes("PLAN ZAJĘĆ") && title.includes("LICEUM") && href) {
        found = this.baseUrl + href;
        return false;
      }
    });

    return found;
  }

  async findPdfUrl(articleUrl: string): Promise<string | null> {
    const res = await fetch(articleUrl);
    if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    let pdfUrl: string | null = null;

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.toLowerCase().endsWith(".pdf")) {
        pdfUrl = href.startsWith("http") ? href : this.baseUrl + href;
        return false;
      }
    });

    return pdfUrl;
  }
}
