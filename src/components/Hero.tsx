import { profile } from "@/content/profile";
import { DistributionBoard } from "./DistributionBoard";
import { Button } from "./ui/Button";
import { Tape } from "./ui/Tape";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pt-16">
      <div className="mx-auto max-w-6xl px-5 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(2rem,5vw,3.5rem)] sm:px-8">
        {/* On wide screens the name and the pitch sit side by side, so the board is in the first view. */}
        <div className="grid gap-x-12 lg:grid-cols-12 lg:items-end">
          <h1 id="hero-title" aria-label={profile.name} className="text-h1 lg:col-span-7">
            <Tape slap tilt={-1.6} className="block w-fit">
              {profile.firstName}
            </Tape>
            <Tape slap tilt={0.9} delay={0.18} className="mt-[0.12em] block w-fit sm:ml-[0.4em]">
              {profile.lastName}
            </Tape>
          </h1>

          <div className="lg:col-span-5 lg:pb-2">
            <p className="mt-7 text-body font-semibold font-stretch-[88%] text-ink-2 lg:mt-0">
              {profile.title}, {profile.location.replace(", ZA", ", South Africa")}
            </p>
            {profile.available && (
              <p className="mt-2 flex items-center gap-2.5 text-small font-semibold">
                <span aria-hidden className="size-3 animate-lamp rounded-full bg-red-hot" />
                {profile.availability}
              </p>
            )}
            <p className="mt-5 max-w-[34ch] text-lede font-medium text-pretty">{profile.lede}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="primary" href={profile.links.email.href}>
                Email me
              </Button>
              <Button href="#case-study">Read the case study</Button>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(2.25rem,4vw,3rem)]">
          <DistributionBoard />
        </div>
      </div>
    </section>
  );
}
