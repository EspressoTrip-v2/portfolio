import { About } from "@/components/About";
import { CaseStudy } from "@/components/CaseStudy";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CommandPalette } from "@/components/CommandPalette";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Portfolio } from "@/components/Portfolio";
import { Principles } from "@/components/Principles";
import { Skills } from "@/components/Skills";
import { Timeline } from "@/components/Timeline";

export default function Home() {
  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[4px] focus:bg-red focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <Nav />
      <CommandPalette />
      <ChatWidget />
      <main>
        <Hero />
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
