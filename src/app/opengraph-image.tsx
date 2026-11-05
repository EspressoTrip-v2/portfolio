import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name}, ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/@fontsource/archivo/files");

// Read inside the render, not at the top level: link-preview bots get a request-time render that
// imports this module for its metadata exports, so a top-level read would run (and fail) outside
// the image route. Cached, because with cacheComponents uncached file reads make the image dynamic.
async function loadFonts() {
  "use cache";
  cacheLife("max");
  const [medium, heavy] = await Promise.all([
    readFile(join(fontDir, "archivo-latin-500-normal.woff")),
    readFile(join(fontDir, "archivo-latin-800-normal.woff")),
  ]);
  // ArrayBuffers: serialisable for the cache, and accepted by ImageResponse's font option.
  return [toArrayBuffer(medium), toArrayBuffer(heavy)] as const;
}

function toArrayBuffer(buffer: Buffer) {
  return new Uint8Array(buffer).buffer;
}

// Tripped theme colours (see src/app/globals.css).
const steel = "#C3C7CA";
const ink = "#121314";
const ink2 = "#34383C";
const tape = "#151515";
const tapeText = "#F4F4F0";
const panel = "#1C1D1F";
const marker = "#F2C230";
const red = "#D8261C";

function Tape({ text, tilt, size: fontSize }: { text: string; tilt: number; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        background: tape,
        color: tapeText,
        fontSize,
        fontWeight: 800,
        letterSpacing: fontSize * 0.06,
        padding: `${fontSize * 0.12}px ${fontSize * 0.45}px`,
        borderRadius: 6,
        transform: `rotate(${tilt}deg)`,
        boxShadow: "0 4px 0 rgba(0,0,0,0.25)",
      }}
    >
      {text.toUpperCase()}
    </div>
  );
}

export default async function OpenGraphImage() {
  const [medium, heavy] = await loadFonts();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: `linear-gradient(180deg, #CCD0D3, ${steel} 45%, #B9BEC1)`,
        padding: "56px 64px",
        fontFamily: "Archivo",
        color: ink,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex" }}>
          <Tape text={profile.firstName} tilt={-1.6} size={92} />
        </div>
        <div style={{ display: "flex", marginLeft: 40 }}>
          <Tape text={profile.lastName} tilt={0.9} size={92} />
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 30, fontWeight: 500, color: ink2 }}>
          {`${profile.title}, ${profile.location}`}
        </div>
      </div>

      {/* Stack as cable markers on a dark board, with how Juan works */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          background: panel,
          borderRadius: 10,
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {profile.stack.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                background: marker,
                color: ink,
                fontSize: 26,
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: 4,
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 10, color: tapeText, fontSize: 26 }}>
          <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: red }} />
          {profile.workMode}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Archivo", data: medium, weight: 500, style: "normal" },
        { name: "Archivo", data: heavy, weight: 800, style: "normal" },
      ],
    },
  );
}
