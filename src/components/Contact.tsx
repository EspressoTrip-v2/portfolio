import { profile } from "@/content/profile";
import { CV_FILE_NAME, CV_PDF_PATH } from "@/lib/cv/file";
import { PushButton } from "./ui/PushButton";
import { Tape } from "./ui/Tape";

export function Contact() {
  const { email, github, linkedin } = profile.links;

  return (
    <section id="contact" aria-labelledby="contact-title" className="overflow-x-clip">
      <div className="mx-auto max-w-6xl px-5 pt-[clamp(4rem,8vw,6.5rem)] sm:px-8">
        <Tape as="h2" id="contact-title" tilt={-1.5} className="text-[clamp(2.25rem,1.4rem+3.6vw,4.5rem)]">
          Get in touch
        </Tape>
        <p className="mt-6 max-w-[48ch] text-lede font-medium text-pretty">
          Email is the fastest way to reach me, and {profile.terms.response}. The assistant in the corner can answer
          quick questions about my work.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-6">
          <PushButton href={email.href}>Email Juan</PushButton>
          <PushButton href={CV_PDF_PATH} download={CV_FILE_NAME}>
            Download CV (PDF)
          </PushButton>
          <PushButton href={github.href} external>
            GitHub
          </PushButton>
          <PushButton href={linkedin.href} external>
            LinkedIn
          </PushButton>
        </div>
        <p className="mt-10 text-small text-ink-3">
          Or write to <span className="font-semibold text-ink select-all">{email.handle}</span>. References available on
          request.
        </p>

        <footer className="mt-[clamp(4rem,8vw,6rem)] flex flex-col gap-3 border-t-2 border-steel-dark pb-28 pt-8 text-small text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {profile.name}</span>
          <span>{profile.location.replace(", ZA", ", South Africa")}</span>
          <a
            href="#top"
            className="font-semibold underline decoration-2 underline-offset-4 hover:text-ink hover:decoration-red"
          >
            Back to top
          </a>
        </footer>
      </div>
    </section>
  );
}
