"use client";

import { useState } from "react";
import { profile } from "@/content/profile";
import { ArrowUpRight, Check, Copy, GitHub, LinkedIn, Mail } from "./Icons";
import { Reveal } from "./Reveal";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const { email, github, linkedin } = profile.links;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email.handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = email.href;
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(ellipse_at_bottom,rgb(200_255_61/0.12),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-24 sm:px-8 md:pt-32">
        <Reveal>
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <span className="text-acid">{"//"} 07</span>
            <span className="h-px w-8 bg-line-strong" />
            Contact
          </p>
          <h2
            id="contact-title"
            className="mt-8 font-display text-[clamp(2.75rem,8vw,7.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]"
          >
            Let&apos;s build something <span className="text-acid">resilient.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <a
              href={email.href}
              className="group flex flex-1 items-center justify-between gap-4 bg-acid px-6 py-5 text-ink transition-[filter] hover:brightness-110"
            >
              <span className="flex items-center gap-3 font-mono text-sm font-semibold sm:text-base">
                <Mail className="size-5" /> {email.handle}
              </span>
              <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={copy}
              className="flex items-center justify-center gap-2 border border-line-strong px-6 py-5 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:border-acid hover:text-acid"
            >
              {copied ? <Check className="text-acid" /> : <Copy />}
              <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { link: github, Icon: GitHub },
              { link: linkedin, Icon: LinkedIn },
            ].map(({ link, Icon }) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border border-line bg-panel/50 px-6 py-5 backdrop-blur transition-colors hover:border-line-strong"
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-5 text-muted transition-colors group-hover:text-acid" />
                  <span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{link.label}</span>
                    <span className="font-mono text-sm">{link.handle}</span>
                  </span>
                </span>
                <ArrowUpRight className="text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acid" />
              </a>
            ))}
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
            References available on request.
          </p>
        </Reveal>

        <footer className="mt-28 flex flex-col gap-4 border-t border-line pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-dim sm:flex-row sm:items-center sm:justify-between">
          <span>© {profile.name}</span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-acid" /> Built with Next.js
          </span>
          <a href="#top" className="-my-2 py-2 transition-colors hover:text-acid">
            Back to top ↑
          </a>
        </footer>
      </div>
      <div
        aria-hidden
        className="text-stroke pointer-events-none relative -mb-[0.2em] select-none text-center font-display text-[22vw] font-bold uppercase leading-none tracking-[-0.06em]"
      >
        Botha
      </div>
    </section>
  );
}
