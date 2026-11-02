import type { TailoredCv } from "@/lib/cv/schema";

/**
 * Renders the CV to a PDF blob in the browser. The page shows this blob and "Download CV" saves the
 * same blob, so the preview and the download always match. react-pdf is loaded on first use.
 */
export async function renderCvPdf(cv: TailoredCv) {
  const [{ pdf }, { CvDocument, registerCvFonts }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./CvDocument"),
  ]);
  const origin = window.location.origin;
  registerCvFonts(origin);
  return pdf(<CvDocument cv={cv} photoUrl={`${origin}/juan.jpg`} />).toBlob();
}

/** Always the same neutral name, whichever job spec the CV was prepared for. */
export const CV_FILE_NAME = "Juan-Botha-CV.pdf";
