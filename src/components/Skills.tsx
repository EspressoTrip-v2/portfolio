import { skillGroups } from "@/content/profile";
import { Section } from "./Section";
import { MarkerList } from "./ui/CableMarker";
import { Tape } from "./ui/Tape";

const tilts = [-1.2, 0.8, -0.5, 1.1, -0.9, 0.6];

/** The stack as labelled cable runs: each group on its own tape, each technology a heat-shrink marker. */
export function Skills() {
  return (
    <Section id="stack" title="Stack" tilt={1} intro="Technology I have used in production.">
      <div className="grid gap-x-10 gap-y-9 md:grid-cols-2">
        {skillGroups.map((group, i) => (
          <div key={group.title}>
            <Tape as="h3" tilt={tilts[i % tilts.length]} className="text-small">
              {group.title}
            </Tape>
            <div className="mt-4">
              <MarkerList label={group.title} items={group.items} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
