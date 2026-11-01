import type { ReactNode } from "react";
import { Tape } from "./ui/Tape";

type SectionProps = {
  id: string;
  title: string;
  intro?: ReactNode;
  /** Slight rotation of the heading tape, so labels don't all sit at the same angle. */
  tilt?: number;
  children: ReactNode;
};

/** A page section headed by a strip of label tape. */
export function Section({ id, title, intro, tilt = -1, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="overflow-x-clip">
      <div className="mx-auto max-w-6xl px-5 py-[clamp(4rem,8vw,6.5rem)] sm:px-8">
        <header className="mb-10 md:mb-12">
          <Tape as="h2" id={`${id}-title`} tilt={tilt} className="text-h2">
            {title}
          </Tape>
          {intro && <p className="mt-5 max-w-[56ch] text-body text-ink-2 text-pretty">{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
