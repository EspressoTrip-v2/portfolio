"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { type CSSProperties, type KeyboardEvent, useRef, useState } from "react";
import type { Flow, Service, ServiceLane } from "@/content/profile";
import { useInView } from "@/lib/useInView";
import { Enclosure } from "./ui/Enclosure";

const lanes: { lane: ServiceLane; label: string; note: string }[] = [
  { lane: "edge", label: "Edge", note: "Public entry points" },
  { lane: "core", label: "Core APIs", note: "Tenant-scoped, JWT per realm" },
  { lane: "worker", label: "Workers", note: "Queue-driven delivery" },
];

const dataPlane: { name: string; note?: string }[] = [
  { name: "MongoDB", note: "database per tenant" },
  { name: "Redis Stack" },
  { name: "BullMQ Redis" },
  { name: "Keycloak", note: "realm per tenant" },
  { name: "Vault" },
];

/** A service as a DIN-rail module. Its lever is up (red) when selected. */
function Module({ service, selected, onSelect }: { service: Service; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      onFocus={onSelect}
      className="flex items-center gap-2 rounded-[3px] bg-[linear-gradient(var(--color-breaker),var(--color-breaker-shade))] py-1.5 pl-1.5 pr-2.5 text-data font-bold font-stretch-[80%] text-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)] transition-transform active:scale-[0.97]"
    >
      <span aria-hidden className="relative h-5 w-3 rounded-[2px] bg-[#2b2b2b]">
        <span
          className={`absolute inset-x-[2px] h-2 rounded-[1px] transition-[top,background] duration-150 ease-[var(--ease-spring)] ${
            selected ? "top-[2px] bg-red-hot" : "top-[10px] bg-[#e7e7e2]"
          }`}
        />
      </span>
      {service.name}
    </button>
  );
}

/** The event bus as a live busbar: messages flow along it. */
function Busbar() {
  return (
    <div className="relative py-2" role="img" aria-label="RabbitMQ event bus carrying typed events between services">
      <div className="relative h-2.5 overflow-hidden rounded-[2px] bg-[linear-gradient(#e2562c,#b8361a)] shadow-[0_0_10px_rgb(255_81_70/0.35)]">
        {[0, 0.9, 1.8].map((delay) => (
          <span
            key={delay}
            aria-hidden
            className="absolute top-0 h-full w-8 animate-bus-flow bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.85),transparent)]"
            style={{ animationDelay: `-${delay}s` }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-center text-data font-bold font-stretch-[80%] text-panel-dim">RabbitMQ event bus</p>
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
      <div className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:items-center">
        <div>
          <p className="text-small font-bold text-panel-fg">{meta.label}</p>
          <p className="text-data text-panel-dim">{meta.note}</p>
        </div>
        {/* DIN rail */}
        <div className="flex flex-wrap gap-1.5 rounded-[3px] bg-rail p-1.5">
          {services
            .filter((service) => service.lane === lane)
            .map((service) => (
              <Module
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
    <Enclosure label="Services: switch one on to inspect it">
      <div className="space-y-3 px-5 pb-4 pt-4 sm:px-7">
        {renderLane("edge")}
        {renderLane("core")}
        <Busbar />
        {renderLane("worker")}
        <div className="border-t border-panel-line pt-3">
          <p className="text-small font-bold text-panel-fg">Data and identity</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-data text-panel-dim">
            {dataPlane.map((item) => (
              <li key={item.name}>
                <span className="font-bold text-panel-fg">{item.name}</span>
                {item.note && <span>, {item.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="mx-3 mb-3 rounded-[4px] bg-panel px-4 py-4 shadow-[inset_0_0_0_1px_var(--color-panel-line)] sm:mx-4 sm:mb-4"
        aria-live="polite"
      >
        <MotionConfig reducedMotion="user">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="flex items-baseline gap-3">
                <span className="text-body font-extrabold font-stretch-[85%] text-red-hot">{current.name}</span>
                <span className="text-small text-panel-dim">{laneOf?.label}</span>
              </p>
              <p className="mt-1.5 max-w-[60ch] text-small">{current.role}</p>
              <ul aria-label={`Technologies in ${current.name}`} className="mt-3 flex flex-wrap gap-1.5">
                {current.tech.map((tech) => (
                  <li key={tech} className="cable-marker text-data">
                    {tech}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </MotionConfig>
      </div>
    </Enclosure>
  );
}

/** Backoff as an LED bar graph: one segment per two seconds of wait, lit in sequence. */
function BackoffLeds({ seconds }: { seconds: number[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  let order = 0;
  return (
    <div ref={ref} className="mt-6 border-t border-panel-line pt-4">
      <p className="mb-3 text-small font-bold">Wait before each retry</p>
      <ul className="space-y-2">
        {seconds.map((s, i) => (
          <li key={s} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-data">
            <span className="text-panel-dim">Attempt {i + 1}</span>
            <span aria-hidden className="flex gap-[3px]">
              {Array.from({ length: s / 2 }, (_, k) => {
                const delay = order++ * 0.03;
                return (
                  <span
                    key={k}
                    className="h-3 w-2 rounded-[1px] bg-panel-line"
                    style={
                      inView ? ({ animation: `led-on 0.12s linear ${delay}s forwards` } as CSSProperties) : undefined
                    }
                  />
                );
              })}
            </span>
            <span className="text-right font-bold tabular-nums">{s} s</span>
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
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
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
    <Enclosure>
      {/* Rocker switches */}
      <div
        role="tablist"
        aria-label="Platform flows"
        onKeyDown={onKeyDown}
        className="flex gap-2 overflow-x-auto px-5 pb-1 pt-7 sm:px-7"
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
              className={`flex shrink-0 items-center gap-2 rounded-[4px] px-3 py-2 text-small font-bold font-stretch-[85%] transition-[background,box-shadow,translate] ${
                selected
                  ? "translate-y-px bg-panel text-panel-fg shadow-[inset_0_2px_4px_rgb(0_0_0/0.6)]"
                  : "bg-panel-2 text-panel-dim shadow-[inset_0_0_0_1px_var(--color-panel-line),0_2px_0_#000] hover:text-panel-fg"
              }`}
            >
              <span
                aria-hidden
                className={`size-2 rounded-full ${selected ? "bg-red-hot shadow-[0_0_6px_var(--color-red-hot)]" : "bg-panel-line"}`}
              />
              {item.title}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`flow-panel-${flow.id}`}
        aria-labelledby={`flow-tab-${flow.id}`}
        className="px-5 pb-7 pt-4 sm:px-7"
      >
        <p className="max-w-[65ch] text-pretty">{flow.summary}</p>
        <ol className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {flow.steps.map((step, i) => (
            <li key={step.text} className="flex gap-3">
              {/* Terminal block */}
              <span className="grid h-8 w-7 shrink-0 place-items-center rounded-[2px] bg-[linear-gradient(var(--color-breaker),var(--color-breaker-shade))] text-small font-extrabold text-ink">
                {i + 1}
              </span>
              <div>
                <p className="text-small font-extrabold font-stretch-[85%] text-red-hot">{step.actor}</p>
                <p className="mt-0.5 text-small text-panel-dim">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        {flow.backoff && <BackoffLeds key={flow.id} seconds={flow.backoff} />}
      </div>
    </Enclosure>
  );
}
