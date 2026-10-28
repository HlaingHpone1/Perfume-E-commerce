import { existsSync } from "fs";
import path from "path";

/** Returns a usable public URL, or null when a local file is missing. */
export function resolvePublicImage(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const relative = url.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relative);
  return existsSync(filePath) ? `/${relative}` : null;
}
