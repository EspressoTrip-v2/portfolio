import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CvGenerator } from "@/components/cv/CvGenerator";
import { Tape } from "@/components/ui/Tape";
import { cvEnabled } from "@/lib/cv/enabled";

export const metadata: Metadata = {
  title: "CV",
  robots: { index: false, follow: false },
};

export default function CvPage() {
  if (!cvEnabled()) notFound();

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <Tape as="h1" tilt={-1} className="text-h2">
        CV
      </Tape>
      <p className="mt-5 max-w-[60ch] text-body text-ink-2 text-pretty">
        Paste the job spec to get Juan&apos;s CV for the role as a PDF.
      </p>
      <CvGenerator />
    </main>
  );
}
