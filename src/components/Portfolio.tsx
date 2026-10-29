import { profile, projects, type Project } from "@/content/profile";
import { ArrowUpRight, GitHub } from "./Icons";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/** Small animated systems diagram used on the featured project. */
function ArchitectureDiagram() {
  const nodes = [
    { x: 40, y: 90, label: "GATEWAY" },
    { x: 200, y: 30, label: "SVC·AUTH" },
    { x: 200, y: 90, label: "SVC·CORE" },
    { x: 200, y: 150, label: "SVC·JOBS" },
    { x: 360, y: 90, label: "RABBITMQ" },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 4],
    [2, 4],
    [3, 4],
  ];
  return (
    <svg viewBox="0 0 420 196" className="h-auto w-full" aria-hidden>
      <rect x="150" y="8" width="100" height="164" fill="none" stroke="var(--line-strong)" strokeDasharray="3 4" />
      <text x="200" y="190" textAnchor="middle" className="fill-dim font-mono text-[7px] tracking-[0.2em]">
        LINKERD MESH · gRPC
      </text>
      {edges.map(([a, b]) => (
        <path
          key={`${a}-${b}`}
          d={`M${nodes[a].x + 34} ${nodes[a].y} C ${(nodes[a].x + nodes[b].x) / 2 + 17} ${nodes[a].y}, ${(nodes[a].x + nodes[b].x) / 2 + 17} ${nodes[b].y}, ${nodes[b].x - 34} ${nodes[b].y}`}
          fill="none"
          stroke="var(--acid)"
          strokeOpacity="0.55"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="animate-dash"
        />
      ))}
      {nodes.map((n) => (
        <g key={n.label}>
          <rect x={n.x - 34} y={n.y - 12} width="68" height="24" fill="var(--ink)" stroke="var(--line-strong)" />
          <rect x={n.x - 34} y={n.y - 12} width="2" height="24" fill="var(--acid)" />
          <text x={n.x + 1} y={n.y + 3} textAnchor="middle" className="fill-fg font-mono text-[8px] tracking-[0.12em]">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StackList({ stack }: { stack: string[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {stack.map((tech) => (
        <li key={tech} className="border border-line px-2.5 py-1 font-mono text-[11px] text-fg/80">
          {tech}
        </li>
      ))}
    </ul>
  );
}

function FeaturedCard({ project }: { project: Project }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      className="group relative grid overflow-hidden border border-line bg-panel/60 backdrop-blur transition-colors hover:border-acid/60 lg:grid-cols-2"
    >
      <div className="grid-lines absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,black)]" />
      <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="flex items-center gap-2 text-acid">
            <span className="size-1.5 rounded-full bg-acid" /> Featured · Open source
          </span>
          <ArrowUpRight className="size-5 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acid lg:hidden" />
        </div>
        <div className="mt-8 lg:mt-16">
          <h3 className="flex items-center gap-3 font-mono text-2xl tracking-tight sm:text-3xl">
            <GitHub className="size-6 shrink-0" />
            {project.name}
          </h3>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">{project.description}</p>
          <StackList stack={project.stack} />
          <span className="mt-8 hidden items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors group-hover:text-acid lg:inline-flex">
            View repository
            <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
      <div className="relative flex items-center border-t border-line p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
        <div className="w-full border border-line bg-ink/70 p-4">
          <ArchitectureDiagram />
        </div>
      </div>
    </a>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col justify-between border border-line bg-panel/60 p-6 backdrop-blur transition-colors hover:border-acid/60 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="flex items-center gap-3 font-mono text-xl tracking-tight">
          <GitHub className="size-5 shrink-0" />
          {project.name}
        </h3>
        <ArrowUpRight className="size-5 shrink-0 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acid" />
      </div>
      <p className="mt-4 leading-relaxed text-muted">{project.description}</p>
      <StackList stack={project.stack} />
    </a>
  );
}

export function Portfolio() {
  const [featured, ...rest] = projects;
  return (
    <Section
      id="work"
      index="06"
      kicker="Portfolio"
      title={
        <>
          Selected work. <span className="text-muted">More shipping soon.</span>
        </>
      }
    >
      <Reveal>
        <FeaturedCard project={featured} />
      </Reveal>
      {rest.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {rest.map((project, i) => (
            <Reveal key={project.name} delay={0.1 * (i % 2)} className="h-full">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal>
        <a
          href={profile.links.github.href}
          target="_blank"
          rel="noreferrer"
          className="group mt-10 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-acid"
        >
          <GitHub /> All repositories on GitHub
          <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </Reveal>
    </Section>
  );
}
