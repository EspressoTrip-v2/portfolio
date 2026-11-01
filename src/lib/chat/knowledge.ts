import { readFile } from "node:fs/promises";
import path from "node:path";

// Shipped with the /api/chat Function through `outputFileTracingIncludes` in next.config.ts.
const ABOUT_ME_PATH = path.join(process.cwd(), "src/content/about-me.md");

let aboutMe: Promise<string> | undefined;

/** The about-me knowledge document, read once per cold start. */
export function loadAboutMe() {
  aboutMe ??= readFile(ABOUT_ME_PATH, "utf8").catch((error: unknown) => {
    aboutMe = undefined;
    throw error;
  });
  return aboutMe;
}
