"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sections } from "@/content/navigation";
import { profile, projects } from "@/content/profile";

const OPEN_EVENT = "command-palette:open";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Command = {
  id: string;
  group: "Navigate" | "Actions" | "Links";
  label: string;
  glyph: string;
  hint?: string;
  run: () => void | Promise<void>;
};

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function openExternal(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const { email, github, linkedin } = profile.links;
    const [featured] = projects;
    return [
      ...sections.map((section, i) => ({
        id: `go-${section.id}`,
        group: "Navigate" as const,
        label: section.label,
        glyph: `0${i + 1}`,
        hint: `#${section.id}`,
        run: () => {
          window.location.hash = section.id;
        },
      })),
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        glyph: "⧉",
        hint: email.handle,
        run: async () => {
          await navigator.clipboard.writeText(email.handle);
          notify("Email copied to clipboard");
        },
      },
      {
        id: "email",
        group: "Actions",
        label: "Send me an email",
        glyph: "@",
        run: () => {
          window.location.href = email.href;
        },
      },
      { id: "github", group: "Links", label: "GitHub", glyph: "↗", hint: github.handle, run: () => openExternal(github.href) },
      { id: "linkedin", group: "Links", label: "LinkedIn", glyph: "↗", hint: linkedin.handle, run: () => openExternal(linkedin.href) },
      ...(featured
        ? [{ id: "featured", group: "Links" as const, label: featured.name, glyph: "↗", hint: "GitHub repo", run: () => openExternal(featured.href) }]
        : []),
    ];
  }, [notify]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) => `${command.label} ${command.group} ${command.hint ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus();
  }, []);

  const run = useCallback(
    async (command: Command | undefined) => {
      if (!command) return;
      close();
      try {
        await command.run();
      } catch {
        notify("That didn't work, try again");
      }
    },
    [close, notify],
  );

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else show();
      } else if (event.key === "/" && !open && !isTyping(event.target)) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [open, show, close]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = filtered.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (count) setActiveIndex((i) => (i + 1) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (count) setActiveIndex((i) => (i - 1 + count) % count);
    } else if (event.key === "Enter") {
      event.preventDefault();
      void run(filtered[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      event.preventDefault();
    }
  };

  let lastGroup: string | null = null;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="palette"
            className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/70 px-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              className="w-full max-w-xl overflow-hidden border border-line-strong bg-panel shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8),0_0_0_1px_rgb(200_255_61/0.08)]"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <span className="font-mono text-sm text-acid">&gt;</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onInputKey}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="command-list"
                  aria-activedescendant={filtered[activeIndex] ? `command-${filtered[activeIndex].id}` : undefined}
                  aria-autocomplete="list"
                  placeholder="Type a command or section…"
                  className="h-14 flex-1 bg-transparent font-mono text-sm text-fg outline-none placeholder:text-dim"
                />
                <kbd className="border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-dim">ESC</kbd>
              </div>

              <ul ref={listRef} id="command-list" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto p-2">
                {filtered.length === 0 && (
                  <li role="presentation" className="px-3 py-8 text-center font-mono text-xs text-dim">
                    No matches for “{query}”
                  </li>
                )}
                {filtered.map((command, i) => {
                  const header = command.group !== lastGroup ? command.group : null;
                  lastGroup = command.group;
                  const active = i === activeIndex;
                  return (
                    <li key={command.id} role="presentation">
                      {header && (
                        <div className="px-3 pb-1.5 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{header}</div>
                      )}
                      <div
                        id={`command-${command.id}`}
                        role="option"
                        aria-selected={active}
                        data-index={i}
                        onMouseMove={() => setActiveIndex(i)}
                        onClick={() => void run(command)}
                        className={`flex cursor-pointer items-center gap-3 border-l-2 px-3 py-2.5 transition-colors ${
                          active ? "border-acid bg-acid-dim text-fg" : "border-transparent text-fg/80"
                        }`}
                      >
                        <span className={`w-6 font-mono text-[11px] ${active ? "text-acid" : "text-dim"}`}>{command.glyph}</span>
                        <span className="flex-1 text-sm">{command.label}</span>
                        {command.hint && <span className="truncate font-mono text-[11px] text-dim">{command.hint}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span className="ml-auto hidden sm:inline">⌘K / Ctrl K · / to open</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="flex items-center gap-2 border border-acid/40 bg-panel px-4 py-2.5 font-mono text-xs text-fg shadow-lg"
            >
              <span className="size-1.5 rounded-full bg-acid" /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
