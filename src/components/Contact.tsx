"use client";

import { useState } from "react";
import { profile } from "@/content/profile";
import { Check, Copy, GitHub, LinkedIn } from "./Icons";
import { Button } from "./ui/Button";
import { Link } from "./ui/Link";
import { PushButton } from "./ui/PushButton";
import { Tape } from "./ui/Tape";

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
    <section id="contact" aria-labelledby="contact-title" className="overflow-x-clip">
      <div className="mx-auto max-w-6xl px-5 pt-[clamp(4rem,8vw,6.5rem)] sm:px-8">
        <Tape as="h2" id="contact-title" tilt={-1.5} className="text-[clamp(2.25rem,1.4rem+3.6vw,4.5rem)]">
          Get in touch
        </Tape>
        <p className="mt-6 max-w-[48ch] text-lede font-medium text-pretty">
          Email is the fastest way to reach me. The assistant in the corner can answer quick questions about my work.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-6">
          <PushButton href={email.href}>Email Juan</PushButton>
          <div>
            <p className="mb-2 text-small font-semibold">{email.handle}</p>
            <Button size="sm" onClick={copy}>
              {copied ? <Check /> : <Copy />}
              <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
            </Button>
          </div>
        </div>

        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-4">
          {[
            { link: github, Icon: GitHub },
            { link: linkedin, Icon: LinkedIn },
          ].map(({ link, Icon }) => (
            <li key={link.label} className="flex items-center gap-2.5">
              <Icon className="size-5" />
              <span className="sr-only">{link.label}: </span>
              <Link href={link.href} external>
                {link.handle}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-small text-ink-3">References available on request.</p>

        <footer className="mt-[clamp(4rem,8vw,6rem)] flex flex-col gap-3 border-t-2 border-steel-dark pb-28 pt-8 text-small text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {profile.name}</span>
          <span>{profile.location.replace(", ZA", ", South Africa")}</span>
          <a href="#top" className="font-semibold underline decoration-2 underline-offset-4 hover:text-ink hover:decoration-red">
            Back to top
          </a>
        </footer>
      </div>
    </section>
  );
}
