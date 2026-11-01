import { caseStudy, profile } from "@/content/profile";
import { FlowTabs, ServiceMap } from "./CaseStudyInteractive";
import { Mail } from "./Icons";
import { Section } from "./Section";
import { MarkerList } from "./ui/CableMarker";
import { Link } from "./ui/Link";
import { RatingPlate } from "./ui/RatingPlate";
import { Tape } from "./ui/Tape";

export function CaseStudy() {
  return (
    <Section id="case-study" title={caseStudy.name} tilt={1.2} intro={caseStudy.summary}>
      <p className="-mt-4 mb-10 max-w-[60ch] text-small font-semibold text-ink-2">
        Technical lead and primary backend author, {caseStudy.period.replace(" – ", " to ")}. The code is private; I&apos;m happy to
        walk you through it.
      </p>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <RatingPlate label="Platform specifications" title="Specifications" rows={caseStudy.metrics.map((m) => ({ label: m.label, value: m.value }))} />
        </div>
        <div className="min-w-0 lg:col-span-8">
          <ServiceMap services={caseStudy.services} />
        </div>
      </div>

      <Tape as="h3" tilt={-1} className="mb-4 mt-14 text-small">
        How it works
      </Tape>
      <FlowTabs flows={caseStudy.flows} />

      <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <MarkerList label="Platform stack" items={caseStudy.stack} />
        <Link href={profile.links.email.href} className="shrink-0">
          <Mail /> Request a walkthrough
        </Link>
      </div>
    </Section>
  );
}
