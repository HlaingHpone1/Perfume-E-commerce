import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/config/auth";

/**
 * Dedupes session reads within a single RSC request
 * (e.g. private layout + admin layout both calling getSession).
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
