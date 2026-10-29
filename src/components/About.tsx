import { education, languages, profile } from "@/content/profile";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const whoami = [
  ["name", `"${profile.name}"`],
  ["role", `"${profile.title}"`],
  ["base", `"${profile.location}"`],
  ["origin", `"Electrical trade → engineering → software"`],
  ["worked_in", `["ZA", "UAE", "QA"]`],
  ["primary", `["TypeScript", "Go"]`],
  ["now", `"Lead Backend Engineer @ Alpha7x"`],
  ["thinks_in", `"events, contracts, failure modes"`],
  ["status", `"${profile.availability.toLowerCase()}"`],
];

export function About() {
  return (
    <Section
      id="about"
      index="01"
      kicker="About"
      title={
        <>
          Engineer by trade.{" "}
          <span className="text-muted">Systems thinker by habit.</span>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <Reveal className="min-w-0 space-y-6 text-lg leading-relaxed text-fg/85 lg:col-span-6">
          {profile.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-pretty">
              {paragraph}
            </p>
          ))}
          <dl className="grid grid-cols-2 gap-px border border-line bg-line pt-0 text-sm">
            {[...education.map((e) => [e.issuer, `${e.name} · ${e.period}`]), ...languages.map((l) => [l.name, l.level])].map(
              ([k, v]) => (
                <div key={k} className="bg-ink px-4 py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">{k}</dt>
                  <dd className="mt-1 text-fg/90">{v}</dd>
                </div>
              ),
            )}
          </dl>
        </Reveal>

        <Reveal delay={0.15} className="min-w-0 lg:col-span-6">
          <div className="overflow-hidden border border-line bg-panel/80 shadow-[0_40px_120px_-40px_rgb(200_255_61/0.15)] backdrop-blur">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-acid" />
              <span className="ml-3 font-mono text-[11px] text-dim">juan@knysna: ~</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[11.5px] leading-7 sm:p-7 sm:text-[13px]">
              <code>
                <span className="text-acid">$</span> whoami --json{"\n"}
                <span className="text-dim">{"{"}</span>
                {"\n"}
                {whoami.map(([key, value], i) => (
                  <span key={key}>
                    {"  "}
                    <span className="text-cyan">&quot;{key}&quot;</span>
                    <span className="text-dim">: </span>
                    <span className="text-fg/90">{value}</span>
                    <span className="text-dim">{i < whoami.length - 1 ? "," : ""}</span>
                    {"\n"}
                  </span>
                ))}
                <span className="text-dim">{"}"}</span>
                {"\n"}
                <span className="text-acid">$</span> <span className="inline-block h-4 w-2 translate-y-0.5 animate-blink bg-acid" />
              </code>
            </pre>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
