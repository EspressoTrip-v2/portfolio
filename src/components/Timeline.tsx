"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { earlier, experience, type Role } from "@/content/profile";
import { useInView } from "@/lib/useInView";
import { roleAnchor } from "./DistributionBoard";
import { Section } from "./Section";
import { Button } from "./ui/Button";
import { MarkerList } from "./ui/CableMarker";
import { Link } from "./ui/Link";
import { Tape } from "./ui/Tape";

const PREVIEW = 2;
const tilts = [-1.4, 0.8, -0.6, 1.2, -1, 0.6, -1.2];

function dates(role: Role) {
  return `${role.start} to ${role.end === "Present" ? "now" : role.end}`;
}

/** A junction box on the conduit. Its lamp lights when the role scrolls into view. */
function Junction({ lit }: { lit: boolean }) {
  return (
    <span
      aria-hidden
      className="absolute left-0 top-1 grid size-5 place-items-center rounded-[3px] bg-panel shadow-[inset_0_0_0_1px_var(--color-panel-line)] md:left-[calc(25%-10px)]"
    >
      <span className={`size-2 rounded-full transition-colors duration-300 ${lit ? "bg-red-hot shadow-[0_0_8px_var(--color-red-hot)]" : "bg-panel-line"}`} />
    </span>
  );
}

function RoleCard({ role, index }: { role: Role; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [ref, lit] = useInView<HTMLLIElement>(0.35);
  const hidden = role.highlights.length - PREVIEW;
  const bodyId = `${roleAnchor(role)}-more`;
  const shown = open ? role.highlights : role.highlights.slice(0, PREVIEW);

  return (
    <li ref={ref} id={roleAnchor(role)} className="relative grid scroll-mt-24 gap-3 pl-9 md:grid-cols-12 md:gap-8 md:pl-0">
      <Junction lit={lit} />
      <div className="md:col-span-3 md:pr-10 md:text-right">
        <p className="text-small font-bold tabular-nums">{dates(role)}</p>
        <p className="text-small text-ink-3">{role.location}</p>
      </div>

      <article className="@container md:col-span-9 md:ml-4">
        <Tape tilt={tilts[index % tilts.length]} className="text-small">
          {role.company}
        </Tape>
        <div className="mt-3 rounded-[3px] bg-chart p-5 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.5)] sm:p-7">
          <header className="flex flex-col gap-3 @lg:flex-row @lg:items-start @lg:justify-between">
            <div>
              <h3 className="text-h3 font-bold">{role.role}</h3>
              {role.links && role.links.length > 0 && (
                <p className="mt-1 flex flex-wrap gap-x-4">
                  {role.links.map((link) => (
                    <Link key={link.href} href={link.href} external>
                      {link.label}
                    </Link>
                  ))}
                </p>
              )}
            </div>
            {role.metric && (
              <p className="shrink-0 @lg:text-right">
                <span className="block text-h3 font-extrabold font-stretch-[85%] text-red-ink">{role.metric.value}</span>
                <span className="text-small text-ink-2">{role.metric.label}</span>
              </p>
            )}
          </header>

          <p className="mt-4 text-ink-2">{role.blurb}</p>
          {role.contractUntil && (
            <p className="mt-2 text-small text-ink-3">Then contracted to {role.company} until {role.contractUntil}.</p>
          )}

          <ul id={bodyId} className="mt-5 max-w-[65ch] space-y-2.5">
            {shown.map((item) => (
              <li key={item} className="relative pl-5">
                <span aria-hidden className="absolute left-0 top-[0.7em] h-[3px] w-2.5 bg-red" />
                {item}
              </li>
            ))}
          </ul>

          {hidden > 0 && (
            <Button variant="quiet" size="sm" className="mt-3" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={bodyId}>
              {open ? "Show less" : `${hidden} more`}
            </Button>
          )}

          {role.caseStudy && (
            <p className="mt-5">
              <Link href={role.caseStudy}>Read the platform case study</Link>
            </p>
          )}

          <div className="mt-6 border-t border-[#d9d8d0] pt-5">
            <MarkerList label={`Technologies used at ${role.company}`} items={role.stack} />
          </div>
        </div>
      </article>
    </li>
  );
}

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const current = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <Section
      id="journey"
      title="From switchboards to service meshes"
      tilt={0.8}
      intro="My career began in the electrical trade and continued through business management in the Gulf before moving into software. Since then I have built multi-tenant platforms and multi-region sync infrastructure, and I currently lead a backend platform rebuild at Alpha7x."
    >
      <div ref={ref} className="relative">
        {/* Conduit, with current flowing down it as you scroll */}
        <div aria-hidden className="absolute bottom-0 left-[7px] top-2 w-1.5 rounded-full bg-panel/80 md:left-[calc(25%-3px)]">
          <motion.div style={{ scaleY: reduce ? 1 : current }} className="h-full w-full origin-top rounded-full bg-red shadow-[0_0_10px_var(--color-red-hot)]" />
        </div>

        <ol className="space-y-12 md:space-y-16">
          {experience.map((role, i) => (
            <RoleCard key={`${role.company}-${role.start}`} role={role} index={i} />
          ))}

          <li className="relative grid gap-3 pl-9 md:grid-cols-12 md:gap-8 md:pl-0">
            <Junction lit={false} />
            <div className="md:col-span-3 md:pr-10 md:text-right">
              <p className="text-small font-bold">Before 2019</p>
              <p className="text-small text-ink-3">Middle East</p>
            </div>
            <div className="md:col-span-9 md:ml-4">
              <Tape tilt={-0.8} className="text-small">
                Earlier roles
              </Tape>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {earlier.map((item) => (
                  <li key={item.company} className="rounded-[3px] bg-chart/80 p-4">
                    <p className="font-bold">{item.company}</p>
                    <p className="text-small text-ink-3">{item.location}</p>
                    <ul className="mt-2 space-y-1 text-small text-ink-2">
                      {item.roles.map((r) => (
                        <li key={r.text}>
                          {r.text}
                          {r.link && (
                            <>
                              {" "}
                              <Link href={r.link.href} external>
                                {r.link.label}
                              </Link>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ol>
      </div>
    </Section>
  );
}
