import { About } from "@/components/About";
import { Background } from "@/components/Background";
import { CaseStudy } from "@/components/CaseStudy";
import { CommandPalette } from "@/components/CommandPalette";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Portfolio } from "@/components/Portfolio";
import { Principles } from "@/components/Principles";
import { Skills } from "@/components/Skills";
import { Stats } from "@/components/Stats";
import { Timeline } from "@/components/Timeline";

export default function Home() {
  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-acid focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <Background />
      <Nav />
      <CommandPalette />
      <main>
        <Hero />
        <Stats />
        <About />
        <Timeline />
        <CaseStudy />
        <Principles />
        <Skills />
        <Portfolio />
        <Contact />
      </main>
    </>
  );
}
