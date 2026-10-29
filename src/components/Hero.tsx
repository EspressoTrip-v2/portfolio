import Image from "next/image";
import { profile, skillGroups } from "@/content/profile";
import portrait from "../../public/juan.jpg";
import { ArrowDown, ArrowUpRight } from "./Icons";
import { Reveal } from "./Reveal";
import { ScrambleText } from "./ScrambleText";

const marquee = [...new Set(skillGroups.flatMap((group) => group.items))];

function Corners() {
  const corner = "absolute size-4 border-acid";
  return (
    <>
      <span className={`${corner} -left-px -top-px border-l-2 border-t-2`} />
      <span className={`${corner} -right-px -top-px border-r-2 border-t-2`} />
      <span className={`${corner} -bottom-px -left-px border-b-2 border-l-2`} />
      <span className={`${corner} -bottom-px -right-px border-b-2 border-r-2`} />
    </>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-dvh flex-col pt-16">
      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-8">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {profile.available && (
                <span className="inline-flex items-center gap-2.5 border border-acid/30 bg-acid-dim px-3 py-1.5 text-acid">
                  <span className="size-1.5 animate-pulse-dot rounded-full bg-acid" />
                  {profile.availability}
                </span>
              )}
              <span>{profile.location}</span>
            </div>
          </Reveal>

          <h1 className="font-display text-[clamp(4.5rem,21vw,10.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.045em]">
            <ScrambleText text={profile.firstName} className="block" />
            <span className="flex items-end gap-4">
              <ScrambleText text={profile.lastName} delay={250} className="text-acid" />
              <span className="mb-[0.12em] hidden h-[0.1em] flex-1 bg-[linear-gradient(90deg,var(--acid),transparent)] opacity-60 sm:block" />
            </span>
          </h1>

          <Reveal delay={0.25}>
            <p className="mt-10 max-w-xl font-mono text-sm uppercase tracking-[0.2em] text-muted">
              <span className="text-acid">&gt;</span> {profile.title}
              <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-acid" />
            </p>
            <p className="mt-5 max-w-2xl font-display text-2xl leading-snug text-fg/90 text-balance sm:text-3xl">
              {profile.tagline}
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#journey"
                className="group inline-flex items-center gap-3 bg-acid px-6 py-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink transition-[filter] hover:brightness-110"
              >
                Explore my journey
                <ArrowDown className="transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href="#contact"
                className="group inline-flex items-center gap-3 border border-line-strong px-6 py-4 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:border-acid hover:text-acid"
              >
                Get in touch
                <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3} className="lg:col-span-4">
          <figure className="relative mx-auto max-w-sm border border-line bg-panel/60 p-3 backdrop-blur">
            <Corners />
            <div className="group relative aspect-[4/5] overflow-hidden bg-ink">
              <Image
                src={portrait}
                alt={`Portrait of ${profile.name}`}
                fill
                priority
                sizes="(min-width: 1024px) 384px, 90vw"
                className="object-cover object-[40%_30%] grayscale contrast-125 brightness-90 transition-[filter] duration-700 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-acid opacity-85 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0" />
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgb(0_0_0/0.25)_50%)] bg-[length:100%_4px] opacity-40" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_40%,transparent_35%,rgb(6_7_8/0.55))]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 to-transparent" />
              <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/80 transition-colors group-hover:text-fg/70">
                REC ● JB-0001
              </span>
            </div>
            <figcaption className="grid grid-cols-2 gap-px bg-line font-mono text-[10px] uppercase tracking-[0.18em]">
              {[
                ["Role", "Backend / Platform"],
                ["Focus", "Event-driven"],
                ["Now", "Alpha7x"],
                ["TZ", "SAST · UTC+2"],
              ].map(([k, v]) => (
                <div key={k} className="bg-panel px-3 py-2.5">
                  <div className="text-dim">{k}</div>
                  <div className="mt-1 text-fg">{v}</div>
                </div>
              ))}
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <div className="relative overflow-hidden border-y border-line bg-ink-2/60 py-4 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 font-mono text-xs uppercase tracking-[0.25em] text-dim hover:[animation-play-state:paused]">
          {[...marquee, ...marquee].map((item, i) => (
            <span key={i} className="flex items-center gap-10" aria-hidden={i >= marquee.length}>
              {item}
              <span className="text-acid/60">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
