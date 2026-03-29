import "dotenv/config";
import { serve } from "@hono/node-server";
import cron from "node-cron";
import { ZakScraper } from "./scraper.js";
import { ScheduleParser } from "./parser.js";
import { ScheduleFileStore } from "./store.js";
import { ScheduleRefresher } from "./scheduler.js";
import { createScheduleRoutes } from "./routes.js";

const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = "https://gdansk.zak.edu.pl";

const scraper = new ZakScraper(BASE_URL);
const parser = new ScheduleParser();
const store = new ScheduleFileStore("data");
const refresher = new ScheduleRefresher(scraper, parser, store);
const app = createScheduleRoutes(store, refresher);

cron.schedule("0 20 * * 0", async () => {
  try {
    await refresher.refresh();
  } catch (err) {
    console.error("[cron] Failed to refresh schedule:", err);
  }
});

console.log(`Starting server on port ${PORT}`);
serve({ fetch: app.fetch, port: PORT });
