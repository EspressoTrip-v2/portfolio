import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { cacheLife } from "next/cache";
import { CvDocument, registerCvFonts } from "@/components/cv/CvDocument";
import { baseCv } from "@/lib/cv/assemble";
import { CV_FILE_NAME } from "@/lib/cv/file";

/** Renders the standard CV. Cached, so the build prerenders it and every request gets the same file. */
async function renderStandardCv() {
  "use cache";
  cacheLife("max");
  const publicDir = join(process.cwd(), "public");
  registerCvFonts(publicDir);
  const pdf = await renderToBuffer(<CvDocument cv={baseCv()} photoUrl={join(publicDir, "juan.jpg")} />);
  return new Uint8Array(pdf);
}

/** Juan's standard CV for employers, built from profile.ts with the generator's layout. */
export async function GET() {
  return new Response(await renderStandardCv(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${CV_FILE_NAME}"`,
    },
  });
}
