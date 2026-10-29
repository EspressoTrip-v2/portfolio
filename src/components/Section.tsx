import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  index: string;
  kicker: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
};

export function Section({ id, index, kicker, title, intro, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
        <Reveal>
          <header className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted md:col-span-3">
              <span className="text-acid">{"//"} {index}</span>
              <span className="h-px w-8 bg-line-strong" />
              <span>{kicker}</span>
            </div>
            <div className="md:col-span-9">
              <h2
                id={`${id}-title`}
                className="font-display text-4xl font-medium leading-[1.02] tracking-tight text-balance sm:text-5xl md:text-6xl"
              >
                {title}
              </h2>
              {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{intro}</p>}
            </div>
          </header>
        </Reveal>
        {children}
      </div>
    </section>
  );
}
