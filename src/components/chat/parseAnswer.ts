import { type NavSection, sections } from "@/content/navigation";

// The model is asked for [[section:id]], but small models sometimes write [[journey:journey]] or [[journey]].
// Accept any [[prefix:id]] or [[id]] form; only ids that exist on the page become links.
const SECTION_TOKEN = /\[\[(?:[a-z0-9-]+:)?([a-z0-9-]+)\]\]/gi;
// A reference still arriving mid-stream, e.g. "[[sec" at the end of the text.
const PARTIAL_TOKEN = /\[\[?[a-z0-9:-]*\]?$/;

/**
 * Splits an answer into display text and validated section links.
 * Strips `[[section:id]]` tokens (and partial ones while streaming) and stray markdown emphasis.
 */
export function parseAnswer(raw: string, streaming: boolean) {
  const ids = new Set<string>();
  let text = raw.replace(SECTION_TOKEN, (_, id: string) => {
    ids.add(id.toLowerCase());
    return "";
  });
  if (streaming) text = text.replace(PARTIAL_TOKEN, "");
  text = text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    // A reference left mid-sentence leaves a gap like "on the  section"; close it up.
    .replace(/ {2,}/g, " ")
    .replace(/ +([.,;:])/g, "$1")
    .trim();

  const links = sections.filter((section): section is NavSection => ids.has(section.id));
  return { text, links: streaming ? [] : links };
}
