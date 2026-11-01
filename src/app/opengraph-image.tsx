import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { experience, profile } from "@/content/profile";

export const alt = `${profile.name}, ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/@fontsource/archivo/files");
const [medium, heavy] = await Promise.all([
  readFile(join(fontDir, "archivo-latin-500-normal.woff")),
  readFile(join(fontDir, "archivo-latin-800-normal.woff")),
]);

// Tripped theme colours (see src/app/globals.css).
const steel = "#C3C7CA";
const ink = "#121314";
const ink2 = "#34383C";
const tape = "#151515";
const tapeText = "#F4F4F0";
const panel = "#1C1D1F";
const rail = "#8C9196";
const red = "#D8261C";

const circuits = [...experience].reverse();

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

export default function OpenGraphImage() {
  return new ImageResponse(
    (
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
            {`${profile.title}, ${profile.location.replace(", ZA", ", South Africa")}`}
          </div>
        </div>

        {/* Mini distribution board: the current role's breaker is on */}
        <div style={{ display: "flex", background: panel, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", flex: 1, gap: 10, background: rail, borderRadius: 4, padding: 10 }}>
            {circuits.map((role) => {
              const on = role.end === "Present";
              return (
                <div
                  key={`${role.company}-${role.start}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    background: "#EEEEEA",
                    borderRadius: 5,
                    padding: "10px 4px 8px",
                  }}
                >
                  <div style={{ display: "flex", width: 22, height: 40, background: "#2b2b2b", borderRadius: 3, padding: 3, alignItems: on ? "flex-start" : "flex-end" }}>
                    <div style={{ display: "flex", width: 16, height: 18, borderRadius: 2, background: on ? red : "#E7E7E2" }} />
                  </div>
                  <div style={{ display: "flex", marginTop: 6, fontSize: 16, fontWeight: 800 }}>{role.start.slice(-4)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: medium, weight: 500, style: "normal" },
        { name: "Archivo", data: heavy, weight: 800, style: "normal" },
      ],
    },
  );
}
