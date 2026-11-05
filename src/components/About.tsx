import Image from "next/image";
import { earlierNote, languages, profile } from "@/content/profile";
import portrait from "../../public/juan.jpg";
import { Section } from "./Section";
import { RatingPlate } from "./ui/RatingPlate";

export function About() {
  // Where Juan came from. Location, role and work mode are in the hero legend, so they aren't repeated here.
  const background = [
    { label: "Languages", value: languages.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(", ") },
    { label: "Earlier work", value: earlierNote },
  ];
  // What agencies ask before a first call, kept together on one plate (notice is also in the hero legend).
  const terms = [
    { label: "Notice", value: profile.notice },
    { label: "Engagement", value: profile.terms.engagement },
    { label: "Right to work", value: profile.terms.rightToWork },
    { label: "Rate", value: profile.terms.rate },
  ];

  return (
    <Section id="about" title="Engineer by trade" eyebrow="About me" tilt={-1.2}>
      {/* Text and photo side by side from md, so the photo never sits alone on a row. */}
      <div className="grid gap-10 md:grid-cols-12 lg:gap-12">
        <div className="space-y-5 md:col-span-8">
          {profile.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="max-w-[62ch] text-pretty">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Photo taped to the steel */}
        <figure className="chart-paper w-full max-w-[16rem] rotate-[1.5deg] p-2.5 pb-3 md:col-span-4 md:justify-self-end">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={portrait}
              alt={`Portrait of ${profile.name}`}
              fill
              sizes="(min-width: 1024px) 256px, (min-width: 768px) 30vw, (min-width: 330px) 256px, 90vw"
              className="object-cover object-[40%_30%]"
            />
          </div>
        </figure>

        <div className="grid items-stretch gap-8 md:col-span-12 md:grid-cols-2">
          <RatingPlate label="Background" title="Background" rows={background} className="text-small" />
          <RatingPlate label="Working terms" title="Working terms" rows={terms} className="text-small" />
        </div>
      </div>
    </Section>
  );
}
