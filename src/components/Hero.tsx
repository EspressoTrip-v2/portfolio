import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import { CV_FILE_NAME, CV_PDF_PATH } from "@/lib/cv/file";
import { DistributionBoard } from "./DistributionBoard";
import { Button } from "./ui/Button";
import { Dotted } from "./ui/Dotted";
import { Tape } from "./ui/Tape";

/**
 * One row of the legend: an etched label and its value. On phones the label sits above the value,
 * so the value gets the full width; from sm the label is a column on the value's baseline.
 */
function Legend({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-baseline sm:gap-4 ${wide ? "lg:col-span-2" : ""}`}>
      <dt className="shrink-0 text-data font-bold font-stretch-expanded text-ink-3 uppercase sm:w-[4.5rem]">{label}</dt>
      <dd className="min-w-0 font-semibold font-stretch-[88%]">{children}</dd>
    </div>
  );
}

export function Hero() {
  const { address } = profile;
  return (
    <section id="top" aria-labelledby="hero-title" className="pt-16">
      <div className="mx-auto max-w-6xl px-5 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(2rem,5vw,3.5rem)] sm:px-8">
        {/* Wide screens: the name and the pitch side by side, the facts as a legend across the board below. */}
        <div className="grid grid-cols-1 gap-x-16 lg:grid-cols-12 lg:items-end">
          <h1 id="hero-title" aria-label={profile.name} className="text-h1 lg:col-span-7">
            <Tape slap tilt={-1.6} className="block w-fit">
              {profile.firstName}
            </Tape>
            <Tape slap tilt={0.9} delay={0.18} className="mt-[0.12em] block w-fit sm:ml-[0.3em]">
              {profile.lastName}
            </Tape>
          </h1>

          {/* After the name in the DOM, so phones show the facts before the pitch; last on wide screens. */}
          <dl
            aria-label="Key facts"
            className="chart-paper mt-12 grid min-w-0 grid-cols-1 gap-x-10 gap-y-3 px-5 py-4 sm:gap-y-2.5 sm:px-6 lg:order-last lg:col-span-12 lg:mt-[clamp(2.25rem,4vw,3rem)] lg:grid-cols-[7fr_5fr] lg:gap-x-16"
          >
            <Legend label="Role">
              <Dotted items={[profile.title, profile.experienceYears]} />
            </Legend>
            <Legend label="Base">
              {address.locality}, {address.countryName}
            </Legend>
            <Legend label="Work">
              <Dotted items={[profile.workMode, profile.notice]} />
            </Legend>
            {profile.available && (
              <Legend label="Status">
                <span className="inline-flex items-center gap-2.5">
                  <span aria-hidden className="size-3 animate-lamp rounded-full bg-red-hot" />
                  {profile.availability}
                </span>
              </Legend>
            )}
            <Legend label="Stack" wide>
              <Dotted items={profile.stack} />
            </Legend>
          </dl>

          <div className="mt-8 lg:col-span-5 lg:mt-0 lg:pb-2">
            <p className="max-w-[30ch] text-lede font-medium text-pretty">{profile.lede}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button variant="primary" href={CV_PDF_PATH} download={CV_FILE_NAME}>
                Download CV (PDF)
              </Button>
              <Button href={profile.links.email.href}>Email me</Button>
              {/* Its own row, so it never jumps beside the buttons at widths where it happens to fit. */}
              <div className="basis-full">
                <Button variant="quiet" href="#case-study">
                  Read the case study
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(1.25rem,2vw,1.75rem)]">
          <DistributionBoard />
        </div>
      </div>
    </section>
  );
}
