"use client";

import { type CSSProperties, useState } from "react";
import { experience, type Role } from "@/content/profile";
import { Screws } from "./ui/Enclosure";

// Oldest job on the left, like circuits added to a board over the years.
const circuits = [...experience].reverse();
const current = circuits.findIndex((role) => role.end === "Present");

// Power-up timing (seconds): busbar energises, then each breaker switches on in turn,
// then the board settles with only the current job left on.
const BUS_AT = 0.35;
const FIRST_AT = 0.8;
const STEP = 0.14;
const SETTLE_AT = FIRST_AT + circuits.length * STEP + 0.35;

/** Anchor of a role in the Journey section. Shared with Timeline. */
export function roleAnchor(role: Role) {
  return `role-${role.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${role.start.slice(-4)}`;
}

function load(role: Role) {
  return role.metric ? `${role.metric.value} ${role.metric.label}` : role.blurb;
}

function shortCompany(company: string) {
  return company.replace("JourneyApps", "PowerSync").replace("A.C Whitcher", "Whitcher");
}

/** Juan's career as a distribution board: one breaker per role. Flip a breaker to read that circuit. */
export function DistributionBoard() {
  const [on, setOn] = useState(current);
  // Once someone flips a breaker, the power-up animation gives way to their choice.
  const [touched, setTouched] = useState(false);
  const role = circuits[on];

  return (
    <div data-hero-board className="enclosure px-4 pb-5 pt-7 sm:px-6" role="group" aria-label="Career, one breaker per role">
      <Screws />
      {/* Main busbar */}
      <span
        aria-hidden
        className="absolute inset-x-6 top-2.5 h-[3px] origin-left bg-red"
        style={touched ? undefined : { animation: `energise 0.7s var(--ease-out) ${BUS_AT}s both` }}
      />

      <div className="grid grid-cols-4 gap-2 rounded-[3px] bg-rail p-2.5 sm:grid-cols-7 sm:gap-2.5 sm:p-3">
        {circuits.map((circuit, i) => {
          const pressed = i === on;
          const leverAnimation = touched
            ? undefined
            : i === current
              ? `lever-on 0.14s var(--ease-spring) ${FIRST_AT + i * STEP}s both`
              : `lever-on 0.14s var(--ease-spring) ${FIRST_AT + i * STEP}s both, lever-off 0.14s ease-in ${SETTLE_AT}s forwards`;
          return (
            <button
              key={`${circuit.company}-${circuit.start}`}
              type="button"
              aria-pressed={pressed}
              aria-label={`${circuit.role}, ${circuit.company}, ${circuit.start} to ${circuit.end === "Present" ? "now" : circuit.end}`}
              onClick={() => {
                setTouched(true);
                setOn(i);
              }}
              className="group rounded-[4px] bg-[linear-gradient(var(--color-breaker),var(--color-breaker-shade))] px-1.5 pb-2.5 pt-2.5 text-center text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)] transition-transform active:scale-[0.98]"
            >
              <span aria-hidden className="relative mx-auto block h-14 w-7 rounded-[3px] bg-[#2b2b2b]">
                <span
                  className={`absolute inset-x-[3px] h-[26px] rounded-[2px] transition-[top,background] duration-150 ease-[var(--ease-spring)] ${
                    pressed
                      ? "top-[3px] bg-[linear-gradient(var(--color-red-hot),var(--color-red))]"
                      : "top-[27px] bg-[linear-gradient(#fafafa,#cfcfca)]"
                  }`}
                  style={leverAnimation ? ({ animation: leverAnimation } as CSSProperties) : undefined}
                />
              </span>
              <span className="mt-2 block text-data font-bold font-stretch-[78%] tabular-nums">{circuit.start.slice(-4)}</span>
              <span className="block text-data font-semibold leading-tight">{shortCompany(circuit.company)}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 px-1 text-panel-fg"
        style={touched ? undefined : { animation: `flicker 0.5s steps(2, end) ${SETTLE_AT}s both` }}
      >
        <span className="text-small text-panel-dim font-stretch-[85%]">Circuit</span>
        <span className="text-h3 font-bold">
          {role.role}, {role.company}
        </span>
        <span className="text-small text-panel-dim font-stretch-[85%]">Rated</span>
        <span className="text-small tabular-nums">
          {role.start} to {role.end === "Present" ? "now" : role.end}
        </span>
        <span className="text-small text-panel-dim font-stretch-[85%]">Load</span>
        <span className="text-small">
          {load(role)}{" "}
          <a href={`#${roleAnchor(role)}`} className="font-semibold text-panel-fg underline decoration-panel-dim decoration-2 underline-offset-4 hover:decoration-red-hot">
            Details
          </a>
        </span>
      </div>
    </div>
  );
}
