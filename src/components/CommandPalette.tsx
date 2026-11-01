"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { openChat } from "@/components/chat/ChatWidget";
import { Screws } from "@/components/ui/Enclosure";
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
      ...sections.map((section) => ({
        id: `go-${section.id}`,
        group: "Navigate" as const,
        label: section.label,
        hint: `#${section.id}`,
        run: () => {
          window.location.hash = section.id;
        },
      })),
      {
        id: "ask",
        group: "Actions",
        label: "Ask about Juan",
        hint: "Chat assistant",
        run: openChat,
      },
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: email.handle,
        run: async () => {
          await navigator.clipboard.writeText(email.handle);
          notify("Email copied to clipboard");
        },
      },
      {
        id: "email",
        group: "Actions",
        label: "Send Juan an email",
        run: () => {
          window.location.href = email.href;
        },
      },
      { id: "github", group: "Links", label: "GitHub", hint: github.handle, run: () => openExternal(github.href) },
      { id: "linkedin", group: "Links", label: "LinkedIn", hint: linkedin.handle, run: () => openExternal(linkedin.href) },
      ...(featured
        ? [{ id: "featured", group: "Links" as const, label: featured.name, hint: "GitHub repo", run: () => openExternal(featured.href) }]
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
            className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/40 px-4 pt-[12vh]"
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
              className="enclosure w-full max-w-xl overflow-hidden pt-3"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <Screws inset={7} />
              <div className="flex items-center gap-3 border-b border-panel-line px-6">
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
                  placeholder="Search sections and actions"
                  className="h-14 flex-1 bg-transparent text-body text-panel-fg outline-none! placeholder:text-panel-dim"
                />
                <kbd className="tape text-data">Esc</kbd>
              </div>

              <ul ref={listRef} id="command-list" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto p-2">
                {filtered.length === 0 && (
                  <li role="presentation" className="px-3 py-8 text-center text-small text-panel-dim">
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
                        <div className="px-3 pb-1 pt-3 text-data font-medium text-panel-dim">{header}</div>
                      )}
                      <div
                        id={`command-${command.id}`}
                        role="option"
                        aria-selected={active}
                        data-index={i}
                        onMouseMove={() => setActiveIndex(i)}
                        onClick={() => void run(command)}
                        className={`flex cursor-pointer items-center gap-3 rounded-[3px] border-l-2 px-3 py-2.5 transition-colors ${
                          active ? "border-red-hot bg-panel-2 text-panel-fg" : "border-transparent text-panel-dim"
                        }`}
                      >
                        <span className="flex-1 text-small font-medium">{command.label}</span>
                        {command.hint && <span className="truncate text-data font-stretch-[80%] text-panel-dim">{command.hint}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-4 border-t border-panel-line px-4 py-2.5 text-data text-panel-dim">
                <span>Arrow keys to move, Enter to select</span>
                <span className="ml-auto hidden sm:inline">Open with ⌘K, Ctrl K or /</span>
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
              className="tape flex items-center gap-2 px-4 py-2.5 text-small"
            >
              <span aria-hidden className="size-2 rounded-full bg-red-hot shadow-[0_0_6px_var(--color-red-hot)]" /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
