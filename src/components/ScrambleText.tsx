"use client";

import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>{}[]=+*";

type ScrambleTextProps = {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
};

/** Decodes `text` from random glyphs on mount. Renders the final text on the server. */
export function ScrambleText({ text, delay = 0, duration = 900, className }: ScrambleTextProps) {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      start ||= now + delay;
      const progress = Math.max(0, Math.min(1, (now - start) / duration));
      const settled = Math.floor(progress * text.length);
      setOutput(
        text
          .split("")
          .map((char, i) =>
            i < settled || char === " " ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join(""),
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, delay, duration]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{output}</span>
    </span>
  );
}
