"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { type KeyboardEvent, useRef, useState } from "react";
import type { Flow, Service, ServiceLane } from "@/content/profile";

const lanes: { lane: ServiceLane; label: string; note: string }[] = [
  { lane: "edge", label: "Edge", note: "Public entry points" },
  { lane: "core", label: "Core APIs", note: "Tenant-scoped, JWT per realm" },
  { lane: "worker", label: "Workers", note: "Queue-driven delivery" },
];

const dataPlane = ["MongoDB · DB per tenant", "Redis Stack", "BullMQ Redis", "Keycloak · realm per tenant", "Vault"];

function ServiceChip({ service, selected, onSelect }: { service: Service; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      className={`group relative flex items-center gap-2 border px-3 py-2 font-mono text-xs transition-colors ${
        selected ? "border-acid bg-acid-dim text-acid" : "border-line-strong bg-ink text-fg/80 hover:border-fg/40"
      }`}
    >
      <span className={`size-1.5 rounded-full ${selected ? "bg-acid" : "bg-dim group-hover:bg-fg/60"}`} />
      {service.name}
    </button>
  );
}

function EventBus() {
  return (
    <div className="relative my-1 flex h-10 items-center" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-acid/60 to-transparent" />
      <div className="absolute inset-x-0 top-1/2 h-px translate-y-1 bg-gradient-to-r from-transparent via-line-strong to-transparent" />
      {[0, 1.3, 2.6].map((delay) => (
        <span
          key={delay}
          className="absolute top-1/2 h-[3px] w-16 -translate-y-1/2 animate-bus bg-gradient-to-r from-transparent via-acid to-transparent"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      <span className="relative mx-auto border border-acid/40 bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
        RabbitMQ event bus · 73 exchanges
      </span>
    </div>
  );
}

export function ServiceMap({ services }: { services: Service[] }) {
  const [selected, setSelected] = useState("grouping");
  const current = services.find((service) => service.name === selected) ?? services[0];
  const laneOf = lanes.find((l) => l.lane === current.lane);

  const renderLane = (lane: ServiceLane) => {
    const meta = lanes.find((l) => l.lane === lane)!;
    return (
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr] sm:items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{meta.label}</p>
          <p className="font-mono text-[10px] text-dim">{meta.note}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {services
            .filter((service) => service.lane === lane)
            .map((service) => (
              <ServiceChip
                key={service.name}
                service={service}
                selected={service.name === current.name}
                onSelect={() => setSelected(service.name)}
              />
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-px border border-line bg-line lg:grid-cols-12">
      <div className="relative min-w-0 overflow-hidden bg-ink p-5 sm:p-8 lg:col-span-8">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative space-y-5">
          {renderLane("edge")}
          {renderLane("core")}
          <EventBus />
          {renderLane("worker")}
          <div className="border-t border-dashed border-line-strong pt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Data & identity plane</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-dim">
              {dataPlane.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="size-1 bg-cyan/70" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative min-w-0 bg-panel p-5 sm:p-8 lg:col-span-4" aria-live="polite">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">Selected service</p>
        <MotionConfig reducedMotion="user">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="mt-3 font-mono text-3xl text-acid">{current.name}</h4>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{laneOf?.label}</p>
              <p className="mt-5 text-lg leading-relaxed text-fg/90">{current.role}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {current.tech.map((tech) => (
                  <li key={tech} className="border border-line-strong px-2.5 py-1 font-mono text-[11px] text-fg/80">
                    {tech}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </MotionConfig>
        <p className="mt-8 border-t border-line pt-4 font-mono text-[11px] leading-relaxed text-dim">
          Select any service on the map to inspect it. Every service publishes and consumes typed events through the shared library.
        </p>
      </div>
    </div>
  );
}

function BackoffBars({ seconds }: { seconds: number[] }) {
  const max = Math.max(...seconds);
  return (
    <div className="mt-8 border border-line bg-ink p-5">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Exponential backoff per attempt</p>
      <ul className="space-y-2">
        {seconds.map((s, i) => (
          <li key={s} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3 font-mono text-[11px]">
            <span className="text-dim">attempt {i + 1}</span>
            <span className="h-2 bg-line">
              <motion.span
                className="block h-full bg-gradient-to-r from-acid to-cyan"
                initial={{ width: 0 }}
                whileInView={{ width: `${(s / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span className="text-right text-fg/80">{s}s</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FlowTabs({ flows }: { flows: Flow[] }) {
  const [activeId, setActiveId] = useState(flows[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = flows.findIndex((flow) => flow.id === activeId);
  const flow = flows[activeIndex];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let next: number | null = null;
    if (event.key in keys) next = (activeIndex + keys[event.key] + flows.length) % flows.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = flows.length - 1;
    if (next === null) return;
    event.preventDefault();
    setActiveId(flows[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="grid gap-px border border-line bg-line lg:grid-cols-12">
      <div
        role="tablist"
        aria-label="Platform flows"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="flex min-w-0 overflow-x-auto bg-ink lg:col-span-4 lg:flex-col"
      >
        {flows.map((item, i) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`flow-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`flow-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              className={`relative min-w-[12rem] shrink-0 border-r border-line px-5 py-5 text-left transition-colors last:border-r-0 lg:min-w-0 lg:border-b lg:border-r-0 lg:last:border-b ${
                selected ? "bg-panel text-fg" : "bg-ink text-muted hover:text-fg"
              }`}
            >
              <span className={`absolute inset-y-0 left-0 w-0.5 ${selected ? "bg-acid" : "bg-transparent"}`} />
              <span className={`block font-mono text-[10px] tracking-[0.2em] ${selected ? "text-acid" : "text-dim"}`}>
                FLOW 0{i + 1}
              </span>
              <span className="mt-1 block font-display text-lg">{item.title}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`flow-panel-${flow.id}`}
        aria-labelledby={`flow-tab-${flow.id}`}
        className="min-w-0 bg-panel p-5 sm:p-8 lg:col-span-8"
      >
        <MotionConfig reducedMotion="user">
          <AnimatePresence mode="wait">
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <p className="max-w-2xl text-lg leading-relaxed text-fg/90 text-pretty">{flow.summary}</p>
              <ol className="mt-8 grid gap-px bg-line sm:grid-cols-2">
                {flow.steps.map((step, i) => (
                  <li key={step.text} className="relative bg-ink p-5">
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="grid size-6 place-items-center border border-acid/50 text-acid">{i + 1}</span>
                      <span className="uppercase tracking-[0.18em] text-cyan">{step.actor}</span>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-fg/80">{step.text}</p>
                  </li>
                ))}
              </ol>
              {flow.backoff && <BackoffBars seconds={flow.backoff} />}
            </motion.div>
          </AnimatePresence>
        </MotionConfig>
      </div>
    </div>
  );
}
