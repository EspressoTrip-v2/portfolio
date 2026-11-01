import { profile, projects } from "@/content/profile";
import { GitHub } from "./Icons";
import { Section } from "./Section";
import { MarkerList } from "./ui/CableMarker";
import { Link } from "./ui/Link";
import { Rivets } from "./ui/RatingPlate";

/** Projects as nameplates riveted to the steel. */
export function Portfolio() {
  return (
    <Section id="work" title="Selected work" tilt={-0.8} intro="Public code and open-source contributions.">
      <ul className="grid gap-6 md:grid-cols-3">
        {projects.map((project) => (
          <li
            key={project.name}
            className="rating-plate flex flex-col px-6 pb-6 pt-7 transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_14px_24px_-12px_rgb(0_0_0/0.55)]"
          >
            <Rivets />
            <h3 className="flex items-center gap-2 text-h3 font-extrabold font-stretch-[85%]">
              <GitHub className="shrink-0 text-ink-2" />
              {project.name}
            </h3>
            <p className="mt-3 flex-1 text-small text-ink-2">{project.description}</p>
            <div className="mt-5">
              <MarkerList label={`Technologies in ${project.name}`} items={project.stack} />
            </div>
            <p className="mt-5">
              <Link href={project.href} external>
                View on GitHub
              </Link>
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-8">
        <Link href={profile.links.github.href} external>
          All repositories on GitHub
        </Link>
      </p>
    </Section>
  );
}
