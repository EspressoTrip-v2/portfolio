"use client";

import { useEffect, useRef } from "react";

/** Fixed grid, noise and a glow that trails the pointer. */
export function Background() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${event.clientX}px`);
        el.style.setProperty("--my", `${event.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--mx)_var(--my),rgb(200_255_61/0.07),transparent_60%)] transition-[background] duration-300" />
      <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-acid/[0.06] blur-[120px]" />
      <div className="noise absolute inset-0 opacity-[0.07] mix-blend-overlay" />
    </div>
  );
}
