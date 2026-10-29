export type NavSection = {
  id: string;
  label: string;
  inNav: boolean;
};

export const sections: NavSection[] = [
  { id: "about", label: "About", inNav: true },
  { id: "journey", label: "Journey", inNav: true },
  { id: "case-study", label: "Case study", inNav: true },
  { id: "principles", label: "Principles", inNav: false },
  { id: "stack", label: "Stack", inNav: true },
  { id: "work", label: "Work", inNav: true },
  { id: "contact", label: "Contact", inNav: true },
];

export const navSections = sections.filter((section) => section.inNav);
