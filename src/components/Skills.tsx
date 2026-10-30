import { skillGroups } from "@/content/profile";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Skills() {
  return (
    <Section
      id="stack"
      index="05"
      kicker="Stack"
      title={
        <>
          Technology <span className="text-muted">proven in production.</span>
        </>
      }
    >
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => (
          <Reveal key={group.title} delay={(i % 3) * 0.08} className="h-full">
            <div className="group relative h-full overflow-hidden bg-ink p-6 transition-colors hover:bg-ink-2 sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-acid/0 blur-3xl transition-colors duration-500 group-hover:bg-acid/10" />
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl font-medium">{group.title}</h3>
                <span className="font-mono text-[10px] tracking-[0.2em] text-dim">[{group.code}]</span>
              </div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border border-line bg-ink-2 px-3 py-1.5 font-mono text-xs text-fg/80 transition-colors hover:border-acid hover:text-acid"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
