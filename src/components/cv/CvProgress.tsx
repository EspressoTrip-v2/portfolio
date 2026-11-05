"use client";

import { useEffect, useState } from "react";
import { Screws } from "@/components/ui/Enclosure";
import type { CvStage } from "@/lib/cv/schema";

/** The server's stages, plus the browser's own PDF build. */
export type ProgressStage = CvStage | "building";

// Each stage fills its share of the bar, easing towards the end of its share over its usual duration.
// The server reports real stage changes; the easing only fills the time in between.
const STAGES: { id: ProgressStage; label: string; from: number; to: number; seconds: number }[] = [
  { id: "reading", label: "Reading the job spec", from: 0, to: 4, seconds: 1 },
  { id: "rewording", label: "Rewriting the CV for the spec", from: 4, to: 58, seconds: 90 },
  { id: "checking", label: "Checking every line against the facts", from: 58, to: 70, seconds: 10 },
  { id: "repairing", label: "Fixing failed lines and missing keywords", from: 70, to: 94, seconds: 50 },
  { id: "building", label: "Preparing the PDF", from: 94, to: 100, seconds: 2 },
];
const SEGMENTS = 30;

/** LED bar-graph progress while the CV is prepared, in a board enclosure like the rest of the site. */
export function CvProgress({ stage }: { stage: ProgressStage }) {
  const index = STAGES.findIndex((item) => item.id === stage);
  const current = STAGES[index];
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = performance.now();
    const timer = window.setInterval(() => setElapsed((performance.now() - started) / 1000), 200);
    return () => {
      window.clearInterval(timer);
      setElapsed(0);
    };
  }, [stage]);

  const eased = 1 - Math.exp(-elapsed / (current.seconds / 2));
  const percent = Math.min(current.to - 0.5, current.from + (current.to - current.from) * eased);
  const lit = Math.round((percent / 100) * SEGMENTS);

  return (
    <div
      className="enclosure px-6 pb-6 pt-7 sm:px-8"
      role="progressbar"
      aria-label="Getting the CV"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-valuetext={current.label}
    >
      <Screws />
      <div className="flex items-center justify-between gap-4">
        <p className="tape text-data" style={{ ["--tilt" as string]: "-1deg" }}>
          Getting CV
        </p>
        <p className="text-small font-bold tabular-nums text-panel-fg">{Math.round(percent)}%</p>
      </div>

      <div aria-hidden className="mt-5 flex gap-[3px] rounded-[3px] bg-[#111] p-2">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={`h-5 flex-1 rounded-[1px] transition-[background-color,box-shadow] duration-150 ${
              i < lit ? "bg-red-hot shadow-[0_0_6px_var(--color-red-hot)]" : "bg-panel-line"
            }`}
          />
        ))}
      </div>

      <ol className="mt-5 grid gap-2 text-small text-panel-fg sm:grid-cols-2">
        {STAGES.map((item, i) => (
          <li key={item.id} className="flex items-center gap-2.5">
            <span
              aria-hidden
              className={`size-2.5 shrink-0 rounded-full ${
                i < index ? "bg-red-hot" : i === index ? "animate-lamp bg-red-hot" : "bg-panel-line"
              }`}
            />
            <span className={i <= index ? "" : "text-panel-dim"}>{item.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
