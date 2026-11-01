"use client";

import { useEffect, useState } from "react";
import { navSections, sections } from "@/content/navigation";
import { profile } from "@/content/profile";
import { openCommandPalette } from "./CommandPalette";
import { Button } from "./ui/Button";

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

export function Nav() {
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
      className={`fixed inset-x-0 top-0 z-50 bg-steel-light transition-[border-color,box-shadow] ${
        scrolled || open ? "border-b border-steel-dark shadow-[0_6px_16px_-12px_rgb(0_0_0/0.5)]" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" aria-label={`${profile.name}, back to top`} className="tape text-small" style={{ ["--tilt" as string]: "-1deg" }}>
          J. {profile.lastName}
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navSections.map(({ id, label }) => {
            const current = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={current ? "location" : undefined}
                  className={`group relative block px-2.5 py-2 text-small font-semibold font-stretch-[88%] transition-colors ${
                    current ? "text-ink" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-2.5 bottom-0.5 h-[3px] origin-left bg-red transition-transform duration-200 ${
                      current ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openCommandPalette} className="max-sm:hidden!">
            Jump to
            <kbd className="rounded-[3px] bg-ink px-1.5 text-data font-bold text-tape-text">⌘K</kbd>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-[4px] bg-[linear-gradient(var(--color-breaker),var(--color-breaker-shade))] shadow-[inset_0_0_0_1px_#9aa0a5,0_2px_0_#8b9095] lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="relative block h-2.5 w-4">
              <span className={`absolute left-0 h-px w-4 bg-ink transition-all ${open ? "top-1.25 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-4 bg-ink transition-all ${open ? "top-1.25 -rotate-45" : "top-2.5"}`} />
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-steel-dark px-5 pb-6 lg:hidden">
          <ul>
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} onClick={() => setOpen(false)} className="block border-b border-steel-dark py-3.5 text-h3 font-bold">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <Button
            className="mt-5 w-full"
            onClick={() => {
              setOpen(false);
              openCommandPalette();
            }}
          >
            Search and shortcuts
          </Button>
        </div>
      )}
    </header>
  );
}
