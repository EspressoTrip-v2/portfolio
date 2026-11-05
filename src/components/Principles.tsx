"use client";

import { principles } from "@/content/profile";
import { useInView } from "@/lib/useInView";
import { Section } from "./Section";

/** "How I build" as the circuit chart taped inside a board's door. It swings down into place when scrolled to. */
export function Principles() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);

  return (
    <Section
      id="principles"
      title="Circuit chart"
      eyebrow="Engineering principles"
      tilt={-1.4}
      intro="How I build, written the way every board I wired was documented: the circuit, what it feeds, and the proof it holds."
    >
      <div
        ref={ref}
        className="chart-paper origin-top px-5 py-6 sm:px-8"
        style={inView ? { animation: "swing-down 0.8s var(--ease-spring) both" } : { opacity: 0 }}
      >
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Engineering principles and where they are proven</caption>
          <thead>
            <tr className="border-b-2 border-ink text-small font-bold font-stretch-[85%]">
              <th scope="col" className="w-[3ch] py-2 pr-3">
                No.
              </th>
              <th scope="col" className="py-2 pr-4">
                Circuit
              </th>
              <th scope="col" className="hidden py-2 pr-4 md:table-cell">
                Feeds
              </th>
              <th scope="col" className="py-2">
                Tested on
              </th>
            </tr>
          </thead>
          <tbody>
            {principles.map((principle, i) => (
              <tr key={principle.title} className="border-b border-[#cfcec6] align-top last:border-b-0">
                <td className="py-4 pr-3 text-h3 font-extrabold font-stretch-[75%] tabular-nums">{i + 1}</td>
                <th scope="row" className="py-4 pr-4 font-bold">
                  {principle.title}
                  <span className="mt-1 block text-small font-normal text-ink-2 md:hidden">{principle.body}</span>
                </th>
                <td className="hidden py-4 pr-4 text-small text-ink-2 md:table-cell">{principle.body}</td>
                <td className="py-4">
                  <ul className="space-y-1 text-small italic text-pen">
                    {principle.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
