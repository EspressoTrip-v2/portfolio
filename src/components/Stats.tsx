"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { stats } from "@/content/profile";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      <span className="text-acid">{suffix}</span>
    </span>
  );
}

export function Stats() {
  return (
    <section aria-label="At a glance" className="border-t border-line">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`group relative px-5 py-10 sm:px-8 md:py-14 ${i % 2 === 1 ? "border-l" : ""} ${
              i >= 2 ? "border-t lg:border-t-0" : ""
            } border-line lg:border-l lg:first:border-l-0`}
          >
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{stat.label}</dt>
            <dd className="mt-3 font-display text-5xl font-medium tracking-tight sm:text-6xl">
              <Counter value={stat.value} suffix={stat.suffix} />
            </dd>
            <span className="absolute inset-x-5 bottom-0 h-px origin-left scale-x-0 bg-acid transition-transform duration-500 group-hover:scale-x-100 sm:inset-x-8" />
          </div>
        ))}
      </dl>
    </section>
  );
}
