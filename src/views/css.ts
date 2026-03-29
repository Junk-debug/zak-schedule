import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function loadCSS(importMetaUrl: string, filename: string): string {
  const dir = fileURLToPath(new URL(".", importMetaUrl));
  return readFileSync(dir + filename, "utf-8");
}
