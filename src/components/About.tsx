import Image from "next/image";
import { education, experience, languages, profile } from "@/content/profile";
import portrait from "../../public/juan.jpg";
import { Section } from "./Section";
import { RatingPlate } from "./ui/RatingPlate";

export function About() {
  const current = experience.find((role) => role.end === "Present");
  const trade = education[0];

  const facts = [
    { label: "Based in", value: profile.location.replace(", ZA", ", South Africa") },
    ...(current ? [{ label: "Working on", value: `${current.role}, ${current.company}` }] : []),
    { label: "Trade qualification", value: `${trade.name}, ${trade.period.replace(" – ", " to ")}` },
    { label: "Languages", value: languages.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(", ") },
  ];

  return (
    <Section id="about" title="Engineer by trade" tilt={-1.2}>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          {profile.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="max-w-[62ch] text-pretty">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="grid content-start gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {/* Photo taped to the steel */}
          <figure className="chart-paper w-full max-w-[18rem] rotate-[1.5deg] p-2.5 pb-3">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={portrait}
                alt={`Portrait of ${profile.name}`}
                fill
                sizes="(min-width: 1024px) 288px, (min-width: 640px) 45vw, 90vw"
                className="object-cover object-[40%_30%]"
              />
            </div>
          </figure>
          <RatingPlate label="Quick facts" title="Quick facts" rows={facts} className="self-start text-small" />
        </div>
      </div>
    </Section>
  );
}
