"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { earlier, experience, type Role } from "@/content/profile";
import { ArrowUpRight, Plus } from "./Icons";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const PREVIEW = 2;

function RoleCard({ role, index }: { role: Role; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const hidden = role.highlights.length - PREVIEW;
  const bodyId = `role-${index}-more`;

  return (
    <Reveal>
      <article className="relative grid gap-6 pl-10 md:grid-cols-12 md:gap-8 md:pl-0">
        <span
          aria-hidden
          className="absolute left-[3px] top-2 size-2.5 rotate-45 border border-acid bg-ink md:left-[calc(25%-5px)]"
        />
        <div className="md:sticky md:top-28 md:col-span-3 md:self-start md:pr-10 md:text-right">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-acid">
            {role.start} — {role.end}
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">{role.location}</p>
        </div>

        <div className="group border border-line bg-panel/50 p-6 backdrop-blur transition-colors hover:border-line-strong md:col-span-9 md:ml-6 sm:p-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{role.role}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-lg text-muted">
                {role.links?.length ? (
                  role.links.map((link, i) => (
                    <span key={link.href} className="inline-flex items-center gap-2">
                      {i > 0 && <span className="text-dim">/</span>}
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:text-acid hover:decoration-acid"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3.5" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </span>
                  ))
                ) : (
                  <span className="text-fg">{role.company}</span>
                )}
              </p>
            </div>
            {role.metric && (
              <div className="border-l-2 border-acid bg-acid-dim px-4 py-2">
                <div className="font-display text-2xl font-semibold text-acid">{role.metric.value}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{role.metric.label}</div>
              </div>
            )}
          </header>

          <p className="mt-4 text-sm italic text-muted">{role.blurb}</p>
          {role.end === "Present" && (
            <p className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-acid" /> Current role
            </p>
          )}

          <ul className="mt-6 space-y-3 text-[15px] leading-relaxed text-fg/85">
            {role.highlights.slice(0, PREVIEW).map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2.5 h-px w-3 shrink-0 bg-acid" />
                {item}
              </li>
            ))}
          </ul>

          {hidden > 0 && (
            <>
              <div
                id={bodyId}
                className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <ul className="space-y-3 overflow-hidden text-[15px] leading-relaxed text-fg/85" inert={!open}>
                  {role.highlights.slice(PREVIEW).map((item, i) => (
                    <li key={item} className={`flex gap-3 ${i === 0 ? "pt-3" : ""}`}>
                      <span className="mt-2.5 h-px w-3 shrink-0 bg-acid" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={bodyId}
                className="mt-3 inline-flex items-center gap-2 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-acid"
              >
                <Plus className={`size-3.5 transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
                {open ? "Show less" : `${hidden} more`}
              </button>
            </>
          )}

          {role.caseStudy && (
            <a
              href={role.caseStudy}
              className="group/cs mt-6 flex items-center justify-between gap-4 border border-acid/30 bg-acid-dim px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-acid transition-colors hover:border-acid"
            >
              Read the platform case study
              <ArrowUpRight className="transition-transform group-hover/cs:-translate-y-0.5 group-hover/cs:translate-x-0.5" />
            </a>
          )}

          <ul className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5" aria-label="Technologies">
            {role.stack.map((tech) => (
              <li
                key={tech}
                className="border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition-colors group-hover:border-line-strong group-hover:text-fg/80"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Reveal>
  );
}

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <Section
      id="journey"
      index="02"
      kicker="Career journey"
      title={
        <>
          From switchboards to{" "}
          <span className="text-acid">service meshes.</span>
        </>
      }
      intro="I started in the electrical trades, managed businesses in the Gulf, then moved into software. Today I lead a TypeScript platform rebuild at Alpha7x."
    >
      <div ref={ref} className="relative">
        <div aria-hidden className="absolute bottom-0 left-2 top-0 w-px bg-line md:left-1/4">
          <motion.div
            style={{ scaleY }}
            className="h-full w-full origin-top bg-gradient-to-b from-acid via-acid to-cyan shadow-[0_0_12px_var(--acid)]"
          />
        </div>

        <div className="space-y-12 md:space-y-16">
          {experience.map((role, i) => (
            <RoleCard key={`${role.company}-${role.start}`} role={role} index={i} />
          ))}

          <Reveal>
            <div className="relative grid gap-6 pl-10 md:grid-cols-12 md:gap-8 md:pl-0">
              <span aria-hidden className="absolute left-[3px] top-2 size-2.5 rotate-45 bg-line-strong md:left-[calc(25%-5px)]" />
              <div className="md:col-span-3 md:pr-10 md:text-right">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Before 2019</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">Middle East</p>
              </div>
              <div className="md:col-span-9 md:ml-6">
                <h3 className="font-display text-2xl font-medium tracking-tight">Earlier chapters</h3>
                <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-3">
                  {earlier.map((item) => (
                    <div key={item.company} className="hatch bg-ink p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-acid">{item.location}</p>
                      <p className="mt-2 font-display text-lg">{item.company}</p>
                      <ul className="mt-3 space-y-1.5 text-sm text-muted">
                        {item.roles.map((r) => (
                          <li key={r.text}>
                            {r.text}
                            {r.link && (
                              <>
                                {" "}
                                <a
                                  href={r.link.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-fg/90 underline decoration-line-strong underline-offset-4 transition-colors hover:text-acid hover:decoration-acid"
                                >
                                  {r.link.label}
                                  <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
