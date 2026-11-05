import type { ReactNode } from "react";
import { Tape } from "./ui/Tape";

type SectionProps = {
  id: string;
  title: string;
  /** Plain label above a themed title, so skimmers know what the section is. */
  eyebrow?: string;
  intro?: ReactNode;
  /** Slight rotation of the heading tape, so labels don't all sit at the same angle. */
  tilt?: number;
  children: ReactNode;
};

/** A page section headed by a strip of label tape. */
export function Section({ id, title, eyebrow, intro, tilt = -1, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="overflow-x-clip">
      <div className="mx-auto max-w-6xl px-5 py-[clamp(4rem,8vw,6.5rem)] sm:px-8">
        <header className="mb-10 md:mb-12">
          {eyebrow && (
            <p className="mb-4 flex items-center gap-2.5 text-small font-semibold text-ink-2">
              <span aria-hidden className="h-[3px] w-6 bg-red" />
              {eyebrow}
            </p>
          )}
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
