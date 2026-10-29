"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { navSections, sections } from "@/content/navigation";
import { profile } from "@/content/profile";
import { openCommandPalette } from "./CommandPalette";

function useClock(timeZone: string) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const update = () => setTime(format.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}

function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return active;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.2 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="absolute inset-x-0 -bottom-px h-px origin-left bg-gradient-to-r from-acid to-cyan"
    />
  );
}

export function Nav() {
  const time = useClock(profile.timezone);
  const active = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-ink/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group flex items-center gap-3" aria-label={`${profile.name}, back to top`}>
          <span className="grid size-9 place-items-center border border-acid/40 font-mono text-sm font-bold text-acid transition-colors group-hover:bg-acid group-hover:text-ink">
            JB
          </span>
          <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-muted sm:block lg:hidden xl:block">
            {profile.name}
          </span>
        </a>

        <ul className="hidden items-center lg:flex">
          {navSections.map(({ id, label }) => {
            const index = sections.findIndex((section) => section.id === id) + 1;
            const current = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={current ? "location" : undefined}
                  className={`group relative px-3 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
                    current ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  <span className={current ? "text-acid" : "text-dim"}>0{index}.</span> {label}
                  <span
                    className={`absolute inset-x-3 -bottom-px h-px origin-left bg-acid transition-transform duration-300 ${
                      current ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs tabular-nums text-dim xl:block">
            SAST {time ?? "--:--:--"}
          </span>
          <button
            type="button"
            onClick={openCommandPalette}
            className="hidden items-center gap-2 border border-line-strong px-3 py-2 font-mono text-xs text-muted transition-colors hover:border-acid hover:text-acid sm:flex"
          >
            <span className="uppercase tracking-[0.15em]">Jump to</span>
            <kbd className="border border-line-strong px-1.5 py-0.5 text-[10px] text-fg">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-9 place-items-center border border-line-strong lg:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <span className="relative block h-2.5 w-4">
              <span className={`absolute left-0 h-px w-4 bg-fg transition-all ${open ? "top-1.25 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-4 bg-fg transition-all ${open ? "top-1.25 -rotate-45" : "top-2.5"}`} />
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <ul id="mobile-menu" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line px-5 pb-6 pt-2 lg:hidden">
          {sections.map(({ id, label }, i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-line py-4 font-display text-2xl"
              >
                <span className="font-mono text-xs text-acid">0{i + 1}</span>
                {label}
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openCommandPalette();
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 bg-acid py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink"
            >
              Command palette
            </button>
          </li>
        </ul>
      )}
      <ScrollProgress />
    </header>
  );
}
