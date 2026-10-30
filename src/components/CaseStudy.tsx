import { caseStudy, profile } from "@/content/profile";
import { ServiceMap, FlowTabs } from "./CaseStudyInteractive";
import { Mail } from "./Icons";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function CaseStudy() {
  return (
    <Section
      id="case-study"
      index="03"
      kicker="Case study"
      title={
        <>
          {caseStudy.name}. <span className="text-muted">Event-driven and multi-tenant by design.</span>
        </>
      }
      intro={caseStudy.summary}
    >
      <Reveal>
        <div className="mb-10 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span className="inline-flex items-center gap-2 border border-line-strong px-3 py-1.5 text-muted">
            <span className="size-1.5 bg-cyan" /> Private codebase · walkthrough on request
          </span>
          <span className="border border-line px-3 py-1.5 text-dim">{caseStudy.period}</span>
          <span className="border border-line px-3 py-1.5 text-dim">Technical lead · primary backend author</span>
          <span className="border border-acid/30 px-3 py-1.5 text-acid">Selected for architectural clarity</span>
        </div>
      </Reveal>

      <Reveal>
        <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          {caseStudy.metrics.map((metric) => (
            <div key={metric.label} className="group bg-ink p-5 transition-colors hover:bg-ink-2 sm:p-6">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{metric.label}</dt>
              <dd className="mt-2 font-display text-4xl font-medium tracking-tight transition-colors group-hover:text-acid sm:text-5xl">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal>
        <h3 className="mb-5 mt-16 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          <span className="text-acid">+</span> Service map
        </h3>
        <ServiceMap services={caseStudy.services} />
      </Reveal>

      <Reveal>
        <h3 className="mb-5 mt-16 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          <span className="text-acid">+</span> How it works
        </h3>
        <FlowTabs flows={caseStudy.flows} />
      </Reveal>

      <Reveal>
        <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-2" aria-label="Platform stack">
            {caseStudy.stack.map((tech) => (
              <li key={tech} className="border border-line px-2.5 py-1 font-mono text-[11px] text-muted">
                {tech}
              </li>
            ))}
          </ul>
          <a
            href={profile.links.email.href}
            className="group inline-flex shrink-0 items-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-acid"
          >
            <Mail /> Request a walkthrough
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
