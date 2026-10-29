import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name}, ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const root = process.cwd();
const fontDir = (pkg: string) => join(root, "node_modules/@fontsource", pkg, "files");

const [displayFont, monoFont, portrait] = await Promise.all([
  readFile(join(fontDir("space-grotesk"), "space-grotesk-latin-700-normal.woff")),
  readFile(join(fontDir("geist-mono"), "geist-mono-latin-500-normal.woff")),
  readFile(join(root, "src/assets/og-portrait.png")),
]);
const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`;

const ink = "#060708";
const acid = "#c8ff3d";
const muted = "#8b929b";
const line = "rgba(255,255,255,0.08)";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: ink,
          backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          padding: 64,
          fontFamily: "Geist Mono",
          color: "#eceef0",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 20, letterSpacing: 4, color: acid }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: `1px solid rgba(200,255,61,0.35)`,
                background: "rgba(200,255,61,0.12)",
                padding: "8px 16px",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 10, background: acid }} />
              {profile.availability.toUpperCase()}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Space Grotesk", lineHeight: 0.85 }}>
            <div style={{ fontSize: 150, letterSpacing: -6 }}>{profile.firstName.toUpperCase()}</div>
            <div style={{ fontSize: 150, letterSpacing: -6, color: acid }}>{profile.lastName.toUpperCase()}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, color: muted }}>
              <span style={{ color: acid, marginRight: 14 }}>&gt;</span>
              <span>{profile.title.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: 26, maxWidth: 640, color: "#d9dce0", lineHeight: 1.35 }}>{profile.tagline}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ display: "flex", position: "relative", padding: 14, border: `1px solid ${line}` }}>
            <img src={portraitSrc} width={360} height={420} alt="" style={{ objectFit: "cover", objectPosition: "40% 30%" }} />
            {[
              { top: -1, left: -1, borderTop: `3px solid ${acid}`, borderLeft: `3px solid ${acid}` },
              { top: -1, right: -1, borderTop: `3px solid ${acid}`, borderRight: `3px solid ${acid}` },
              { bottom: -1, left: -1, borderBottom: `3px solid ${acid}`, borderLeft: `3px solid ${acid}` },
              { bottom: -1, right: -1, borderBottom: `3px solid ${acid}`, borderRight: `3px solid ${acid}` },
            ].map((corner, i) => (
              <div key={i} style={{ position: "absolute", width: 22, height: 22, ...corner }} />
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 18, letterSpacing: 3, color: muted }}>
            {profile.location.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: displayFont, weight: 700, style: "normal" },
        { name: "Geist Mono", data: monoFont, weight: 500, style: "normal" },
      ],
    },
  );
}
