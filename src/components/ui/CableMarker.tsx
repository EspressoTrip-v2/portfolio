"use client";

import type { CSSProperties } from "react";
import { useInView } from "@/lib/useInView";

/** Yellow heat-shrink markers threaded on a cable. They slide into place the first time the cable scrolls into view. */
export function MarkerList({ items, label }: { items: string[]; label: string }) {
  const [ref, inView] = useInView<HTMLUListElement>(0.4);
  return (
    <div>
      <ul ref={ref} aria-label={label} className="flex flex-wrap gap-x-3 gap-y-2.5 pl-3">
        {items.map((item, i) => (
          <li
            key={item}
            // A short length of cable runs into each marker from the left.
            className="cable-marker relative text-data before:absolute before:-left-3 before:top-1/2 before:h-1 before:w-3 before:-translate-y-1/2 before:bg-ink/80"
            style={
              inView
                ? ({
                    animation: "slide-on 0.45s var(--ease-out) both",
                    animationDelay: `${i * 0.04}s`,
                  } as CSSProperties)
                : { opacity: 0 }
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
