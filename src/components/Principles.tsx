import { principles } from "@/content/profile";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Principles() {
  return (
    <Section
      id="principles"
      index="04"
      kicker="How I build"
      title={
        <>
          Engineering principles, <span className="text-muted">backed by evidence.</span>
        </>
      }
      intro="Each principle is grounded in systems I have designed and delivered in production."
    >
      <ol className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle, i) => (
          <li key={principle.title} className="h-full">
            <Reveal delay={(i % 3) * 0.08} className="h-full">
              <article className="group relative flex h-full flex-col bg-ink p-6 transition-colors hover:bg-ink-2 sm:p-8">
                <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-acid transition-transform duration-500 group-hover:scale-x-100" />
                <span className="font-mono text-xs text-acid">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-2xl font-medium tracking-tight">{principle.title}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-fg/75">{principle.body}</p>
                <p className="mt-6 border-t border-dashed border-line-strong pt-4 font-mono text-[11px] leading-relaxed text-muted">
                  <span className="text-cyan">evidence:</span> {principle.evidence}
                </p>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
