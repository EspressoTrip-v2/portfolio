"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { type FormEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Close } from "@/components/Icons";
import { profile } from "@/content/profile";
import { chatCopy, chatLimits } from "@/lib/chat/copy";
import { parseAnswer } from "./parseAnswer";

const OPEN_EVENT = "chat:open";
const STORAGE_KEY = "portfolio-chat:v1";
// Session flags: the greeting shows once per visit; the call lamp pulses until the chat is first opened.
const GREETED_KEY = "portfolio-chat:greeted";
const OPENED_KEY = "portfolio-chat:opened";
// Arrive once the hero distribution board has finished powering up (about 2.6 s), not on top of it.
const ARRIVE_AFTER_MS = 3000;
// The bottom-right area the full intercom and greeting occupy.
const CORNER = { width: 440, height: 230 };

/** True when the hero board isn't sitting in the bottom-right corner, so the full intercom won't cover it. */
function cornerIsClear() {
  const board = document.querySelector("[data-hero-board]");
  if (!board) return true;
  const r = board.getBoundingClientRect();
  return !(r.right > window.innerWidth - CORNER.width && r.bottom > window.innerHeight - CORNER.height && r.top < window.innerHeight);
}

function readFlag(key: string) {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function setFlag(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // Storage unavailable: the greeting may show again, which is harmless.
  }
}

export function openChat() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Entry = {
  role: "user" | "assistant";
  content: string;
  /** Kept on screen but not sent back to the API (declines, errors and the questions that caused them). */
  excluded?: boolean;
  notice?: "limit" | "error";
};

const starters = [
  "What did Juan build at PowerSync?",
  "How does he handle retries in event-driven systems?",
  "What is he working on now?",
  "Has he led a team?",
];

function readStored(): Entry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

function store(entries: Entry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the chat still works without it.
  }
}

function errorEntry(status: number): Entry {
  if (status === 429) return { role: "assistant", content: chatCopy.limit, excluded: true, notice: "limit" };
  return { role: "assistant", content: chatCopy.failure, excluded: true, notice: "error" };
}

/** Renders plain-text answers: paragraphs, and runs of "- " lines as a list with a hanging indent. */
function AnswerText({ text, caret }: { text: string; caret: boolean }) {
  const blocks: { kind: "p" | "ul"; lines: string[] }[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const kind = trimmed.startsWith("- ") ? "ul" : "p";
    const content = kind === "ul" ? trimmed.slice(2) : trimmed;
    const previous = blocks[blocks.length - 1];
    if (kind === "ul" && previous?.kind === "ul") previous.lines.push(content);
    else blocks.push({ kind, lines: [content] });
  }

  // A steady CH1 block while the answer streams.
  const caretEl = caret ? <span aria-hidden className="ml-0.5 inline-block h-3.5 w-[6px] translate-y-0.5 bg-red-hot" /> : null;
  if (blocks.length === 0) return <p className="text-small">{caretEl}</p>;

  return (
    <div className="max-w-[65ch] space-y-2.5 text-small text-panel-fg">
      {blocks.map((block, i) => {
        const last = i === blocks.length - 1;
        if (block.kind === "p") {
          return (
            <p key={i}>
              {block.lines[0]}
              {last && caretEl}
            </p>
          );
        }
        return (
          <ul key={i} className="space-y-1.5">
            {block.lines.map((line, j) => (
              <li key={j} className="relative pl-4">
                <span aria-hidden className="absolute left-0 text-panel-dim">
                  –
                </span>
                {line}
                {last && j === block.lines.length - 1 && caretEl}
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Nothing that depends on stored entries renders until the panel opens, so this can't cause a hydration mismatch.
  const [entries, setEntries] = useState<Entry[]>(readStored);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // The intercom arrives shortly after the page loads, so it draws the eye once the hero has settled.
  const [arrived, setArrived] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [calling, setCalling] = useState(true);
  // While the hero board fills the corner, the intercom is a compact lamp button and the greeting waits.
  const [roomy, setRoomy] = useState(true);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRoomy(cornerIsClear()));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        setArrived(true);
        setGreeting(!readFlag(GREETED_KEY));
        setCalling(!readFlag(OPENED_KEY));
      },
      reduce ? 0 : ARRIVE_AFTER_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  const dismissGreeting = useCallback(() => {
    setGreeting(false);
    setFlag(GREETED_KEY);
  }, []);

  // The greeting has done its job after a few seconds on screen; leave just the lamp so it doesn't cover the page.
  const greetingVisible = greeting && roomy;
  useEffect(() => {
    if (!greetingVisible) return;
    const timer = window.setTimeout(dismissGreeting, 12_000);
    return () => window.clearTimeout(timer);
  }, [greetingVisible, dismissGreeting]);

  useEffect(() => {
    if (!streaming) store(entries);
  }, [entries, streaming]);

  const show = useCallback(() => {
    setOpen(true);
    setArrived(true);
    setCalling(false);
    setFlag(OPENED_KEY);
    dismissGreeting();
  }, [dismissGreeting]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  useEffect(() => {
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    // On touch screens, focusing the input opens the keyboard over the starter questions.
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    else panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [entries, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const history = entries.filter((entry) => !entry.excluded);
  const questionsLeft = chatLimits.maxUserTurns - history.filter((entry) => entry.role === "user").length;

  const send = useCallback(
    async (question: string) => {
      const content = question.trim().slice(0, chatLimits.maxUserChars);
      if (!content || streaming || questionsLeft <= 0) return;

      const sent = [
        ...history.map(({ role, content }) => ({ role, content: content.slice(0, chatLimits.maxAssistantChars) })),
        { role: "user" as const, content },
      ];
      setInput("");
      setStreaming(true);
      setEntries((current) => [...current, { role: "user", content }, { role: "assistant", content: "" }]);

      const replaceLast = (update: (last: Entry) => Entry, excludeQuestion = false) =>
        setEntries((current) => {
          const next = [...current];
          next[next.length - 1] = update(next[next.length - 1]);
          if (excludeQuestion) next[next.length - 2] = { ...next[next.length - 2], excluded: true };
          return next;
        });

      const controller = new AbortController();
      abortRef.current = controller;
      let answer = "";
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: sent }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          replaceLast(() => errorEntry(response.status), true);
          setAnnouncement(errorEntry(response.status).content);
          return;
        }

        if (response.headers.get("X-Chat-Result") === "off-topic") {
          answer = await response.text();
          replaceLast(() => ({ role: "assistant", content: answer, excluded: true }), true);
          setAnnouncement(answer);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += decoder.decode(value, { stream: true });
          const snapshot = answer;
          replaceLast((last) => ({ ...last, content: snapshot }));
        }
        answer += decoder.decode();
        if (!answer.trim()) {
          replaceLast(() => errorEntry(500), true);
          setAnnouncement(chatCopy.failure);
          return;
        }
        replaceLast((last) => ({ ...last, content: answer }));
        setAnnouncement(parseAnswer(answer, false).text);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        replaceLast(() => errorEntry(0), true);
        setAnnouncement(chatCopy.failure);
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [history, questionsLeft, streaming],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const onInputKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  };

  const onPanelKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const jumpTo = (id: string) => {
    window.location.hash = id;
    // On phones the panel covers the page, so get out of the way.
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  };

  const outOfQuestions = questionsLeft <= 0;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!open && arrived && (
          <motion.div
            key="intercom"
            // Compact, the lamp tucks into the very corner so it clears the hero board.
            className={`fixed z-[60] flex flex-col items-end gap-3 transition-[right,bottom] ${roomy ? "bottom-4 right-4 sm:bottom-6 sm:right-6" : "bottom-2.5 right-2.5"}`}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
          >
            <AnimatePresence>
              {greetingVisible && (
                <motion.p
                  key="greeting"
                  role="status"
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 16, delay: 0.35 } }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                  style={{ transformOrigin: "100% 100%", ["--tilt" as string]: "-2deg" }}
                  className="tape relative max-w-[17rem] py-2.5! pl-3.5! pr-9! text-small normal-case! tracking-normal! font-stretch-100%!"
                >
                  Hiring? Ask me anything about Juan&apos;s work.
                  <button
                    type="button"
                    onClick={dismissGreeting}
                    aria-label="Dismiss greeting"
                    className="absolute right-1.5 top-1.5 rounded-[3px] p-1 text-tape-text/80 hover:text-tape-text"
                  >
                    <Close className="size-3.5" />
                  </button>
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button
              ref={launcherRef}
              type="button"
              onClick={show}
              aria-haspopup="dialog"
              aria-label="Ask about Juan"
              layout
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 420, damping: 18 } }}
              className={`enclosure flex min-h-12 items-center gap-3 text-body font-bold active:translate-y-0.5 ${roomy ? "px-5" : "min-w-12 justify-center px-0"}`}
            >
              <motion.span layout aria-hidden className={`size-3.5 rounded-full bg-red-hot ${calling ? "animate-lamp" : ""}`} />
              {roomy && (
                <motion.span layout="position" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Ask about Juan
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            tabIndex={-1}
            onKeyDown={onPanelKey}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="enclosure fixed inset-0 z-[60] flex flex-col rounded-none! outline-none! sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(560px,calc(100dvh-3rem))] sm:w-[400px] sm:rounded-[6px]!"
          >
            <header className="flex items-center gap-3 border-b border-panel-line px-4 py-3">
              <span aria-hidden className="size-2.5 rounded-full bg-red-hot shadow-[0_0_6px_var(--color-red-hot)]" />
              <h2 id="chat-title" className="flex-1 text-body font-bold">
                Ask about Juan
              </h2>
              <kbd className="tape hidden text-data sm:inline">Esc</kbd>
              <button
                type="button"
                onClick={close}
                aria-label="Close chat"
                className="-mr-1.5 rounded-[3px] p-1.5 text-panel-dim transition-colors hover:text-panel-fg"
              >
                <Close />
              </button>
            </header>

            <div ref={logRef} className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5">
              {entries.length === 0 ? (
                <div className="space-y-4">
                  <p className="max-w-[34ch] text-small text-panel-dim">
                    Hi! I can tell you about Juan&apos;s work, skills and experience. Pick a question below or ask your own.
                  </p>
                  <ul className="space-y-1.5">
                    {starters.map((starter) => (
                      <li key={starter}>
                        <button
                          type="button"
                          onClick={() => void send(starter)}
                          className="w-full rounded-[3px] border border-panel-line bg-panel-2 px-3 py-2 text-left text-small text-panel-fg transition-colors hover:border-panel-dim"
                        >
                          {starter}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                entries.map((entry, i) => {
                  if (entry.role === "user") {
                    return (
                      <p key={i} className="text-small font-medium text-panel-dim">
                        <span className="sr-only">You asked: </span>
                        {entry.content}
                      </p>
                    );
                  }
                  const live = streaming && i === entries.length - 1;
                  const { text, links } = parseAnswer(entry.content, live);
                  return (
                    <div key={i} className={`border-l-2 pl-3.5 ${entry.notice ? "border-red-hot" : "border-panel-line"}`}>
                      <AnswerText text={text} caret={live} />
                      {entry.notice && (
                        <a href={profile.links.email.href} className="mt-2 inline-block text-small text-red-hot underline underline-offset-4">
                          Email Juan
                        </a>
                      )}
                      {links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {links.map((section) => (
                            <a
                              key={section.id}
                              href={`#${section.id}`}
                              onClick={(event) => {
                                event.preventDefault();
                                jumpTo(section.id);
                              }}
                              className="tape text-data transition-transform hover:-translate-y-0.5"
                            >
                              Jump to {section.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-panel-line px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <div className="flex items-end gap-2 rounded-[4px] border border-panel-line bg-panel-2 px-3 py-2 focus-within:border-red-hot">
                <label htmlFor="chat-input" className="sr-only">
                  Your question
                </label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={chatLimits.maxUserChars}
                  disabled={outOfQuestions}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onInputKey}
                  placeholder={outOfQuestions ? "That's all the questions for this chat" : "Ask me anything about Juan"}
                  className="max-h-28 min-h-6 flex-1 resize-none bg-transparent py-0.5 text-small text-panel-fg [field-sizing:content] placeholder:text-panel-dim outline-none! disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={streaming || outOfQuestions || !input.trim()}
                  className="rounded-[3px] bg-red-hot px-2.5 py-1 text-small font-medium text-ink transition-opacity disabled:opacity-30"
                >
                  Send
                </button>
              </div>
              <p className="mt-2 flex justify-between text-data text-panel-dim">
                <span>
                  {outOfQuestions ? (
                    <>
                      Want to know more?{" "}
                      <a href={profile.links.email.href} className="text-red-hot underline underline-offset-4">
                        email Juan
                      </a>
                    </>
                  ) : (
                    `${questionsLeft} ${questionsLeft === 1 ? "question" : "questions"} left`
                  )}
                </span>
                <span className="hidden sm:inline">Enter to send</span>
              </p>
            </form>

            <p aria-live="polite" className="sr-only">
              {announcement}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
