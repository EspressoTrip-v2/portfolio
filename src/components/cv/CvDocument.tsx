import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { TailoredCv } from "@/lib/cv/schema";

// The CV in the site's "Tripped" language, kept print-friendly: white paper, Archivo, headings on
// black label tape, contact details on a riveted rating plate, each role numbered as a circuit,
// red only as marks (the live circuit, bullet marks, the busbar). One column, real text, A4.
const c = {
  ink: "#121314",
  ink2: "#34383C",
  ink3: "#5A5F64",
  tape: "#151515",
  tapeText: "#F4F4F0",
  red: "#D8261C",
  plate: "#E6E8E9",
  plateEdge: "#8F959A",
  steel: "#C3C7CA",
  marker: "#F2C230",
  masking: "#ECDEAA",
};

let fontsRegistered = false;

/**
 * Registers the CV font. Call once before rendering. `publicBase` is where /public is reachable:
 * the site origin in the browser, or the public directory's path on the server.
 */
export function registerCvFonts(publicBase: string) {
  if (fontsRegistered) return;
  Font.register({
    family: "Archivo",
    fonts: [
      { src: `${publicBase}/fonts/cv/archivo-latin-400-normal.woff`, fontWeight: 400 },
      { src: `${publicBase}/fonts/cv/archivo-latin-400-italic.woff`, fontWeight: 400, fontStyle: "italic" },
      { src: `${publicBase}/fonts/cv/archivo-latin-600-normal.woff`, fontWeight: 600 },
      { src: `${publicBase}/fonts/cv/archivo-latin-800-normal.woff`, fontWeight: 800 },
    ],
  });
  // Whole words only; hyphenated tech names read badly.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Archivo",
    fontSize: 8.8,
    lineHeight: 1.38,
    color: c.ink,
    paddingTop: 34,
    paddingBottom: 46,
    paddingHorizontal: 38,
  },
  topBand: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: c.steel },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  // Tapes are a rotated View holding plain Text: rotating Text with a background clips the glyphs.
  nameTape: {
    alignSelf: "flex-start",
    backgroundColor: c.tape,
    paddingTop: 6,
    paddingBottom: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    transform: "rotate(-1.2deg)",
  },
  // Little letter spacing: wider gaps make text extraction (ATS screening) split the name into fragments.
  nameText: { color: c.tapeText, fontSize: 25, fontWeight: 800, letterSpacing: 0.5, lineHeight: 1 },
  title: { fontSize: 12.5, fontWeight: 600, color: c.ink2, marginTop: 9 },
  workLine: { fontSize: 8.4, fontWeight: 600, color: c.ink3, marginTop: 3 },
  photoWrap: { width: 70, height: 70, position: "relative" },
  photo: { width: 70, height: 70, borderWidth: 1, borderColor: c.ink },
  photoTape: {
    position: "absolute",
    top: -6,
    left: 17,
    width: 36,
    height: 11,
    backgroundColor: c.masking,
    opacity: 0.9,
    transform: "rotate(-4deg)",
  },

  busbar: { height: 2.5, backgroundColor: c.red, marginTop: 12, marginBottom: 12 },

  summary: { fontSize: 9.4, lineHeight: 1.45, marginBottom: 12 },

  plate: {
    position: "relative",
    backgroundColor: c.plate,
    borderWidth: 0.8,
    borderColor: c.plateEdge,
    borderRadius: 3,
    paddingVertical: 9,
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  rivet: { position: "absolute", width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: "#A4AAAF" },
  plateCell: { width: "30%", paddingRight: 8, marginBottom: 4 },
  plateCellWide: { width: "40%" },
  plateLabel: { fontSize: 6.4, fontWeight: 600, letterSpacing: 0.8, color: c.ink3 },
  plateValue: { fontSize: 8.4, color: c.ink, textDecoration: "none" },

  sectionTape: {
    alignSelf: "flex-start",
    backgroundColor: c.tape,
    paddingTop: 3,
    paddingBottom: 2.5,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: { color: c.tapeText, fontSize: 9.5, fontWeight: 800, letterSpacing: 0, lineHeight: 1 },

  markers: { flexDirection: "row", flexWrap: "wrap" },
  marker: {
    backgroundColor: c.marker,
    color: c.ink,
    fontSize: 7.6,
    fontWeight: 600,
    paddingTop: 2,
    paddingBottom: 1.5,
    paddingHorizontal: 5,
    borderRadius: 2,
    marginRight: 3.5,
    marginBottom: 3.5,
  },

  // A plain column (not a row) so a long role can break across pages. Only the header is a row:
  // circuit tag, then title block.
  // paddingBottom, not marginBottom: a bottom margin stops react-pdf splitting the role across pages.
  role: { paddingLeft: 30, paddingBottom: 11 },
  roleHeader: { flexDirection: "row", marginLeft: -30 },
  circuit: { width: 30, paddingTop: 1.5 },
  roleHeaderBody: { flex: 1 },
  circuitTag: {
    alignSelf: "flex-start",
    backgroundColor: c.tape,
    paddingTop: 2.5,
    paddingBottom: 2,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  circuitText: { color: c.tapeText, fontSize: 7.4, fontWeight: 800, lineHeight: 1 },
  liveTag: { backgroundColor: c.red },
  roleHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  roleTitle: { fontSize: 10.6, fontWeight: 800, flex: 1, paddingRight: 8 },
  dates: { fontSize: 8, fontWeight: 600, color: c.ink2 },
  companyRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 1 },
  company: { fontSize: 9.2, fontWeight: 600, color: c.ink2 },
  location: { fontSize: 7.8, color: c.ink3 },
  roleMeta: { fontSize: 7.8, fontWeight: 600, color: c.ink2, marginTop: 1 },
  blurb: { fontSize: 7.8, fontStyle: "italic", color: c.ink3, marginTop: 1.5, marginBottom: 3 },
  bullet: { flexDirection: "row", marginBottom: 2.2 },
  bulletMark: { width: 3, height: 3, backgroundColor: c.red, marginTop: 3.8, marginRight: 6 },
  bulletText: { flex: 1 },

  columns: { flexDirection: "row" },
  column: { flex: 1, paddingRight: 14 },
  item: { marginBottom: 5 },
  itemTitle: { fontWeight: 600 },
  itemSub: { fontSize: 7.8, color: c.ink3 },
  link: { color: c.ink, textDecoration: "underline" },

  footer: {
    position: "absolute",
    bottom: 22,
    left: 38,
    right: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.6,
    borderTopColor: c.steel,
    paddingTop: 5,
    fontSize: 7.2,
    color: c.ink3,
  },
});

function SectionTape({ children, tilt }: { children: string; tilt: number }) {
  return (
    <View style={[s.sectionTape, { transform: `rotate(${tilt}deg)` }]} minPresenceAhead={50}>
      <Text style={s.sectionText}>{children.toUpperCase()}</Text>
    </View>
  );
}

function PlateCell({ label, value, href, wide }: { label: string; value: string; href?: string; wide?: boolean }) {
  return (
    <View style={wide ? [s.plateCell, s.plateCellWide] : s.plateCell}>
      <Text style={s.plateLabel}>{label.toUpperCase()}</Text>
      {href ? (
        <Link src={href} style={s.plateValue}>
          {value}
        </Link>
      ) : (
        <Text style={s.plateValue}>{value}</Text>
      )}
    </View>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={s.bullet} wrap={false}>
      <View style={s.bulletMark} />
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );
}

/** Juan's CV as a PDF. The page preview shows this same document, so what you see is what downloads. */
export function CvDocument({ cv, photoUrl }: { cv: TailoredCv; photoUrl: string }) {
  return (
    <Document title={`${cv.name} CV`} author={cv.name} subject={cv.title} creator={cv.name} producer={cv.name}>
      <Page size="A4" style={s.page}>
        <View fixed style={s.topBand} />

        <View style={s.header}>
          <View>
            <View style={s.nameTape}>
              <Text style={s.nameText}>{cv.name.toUpperCase()}</Text>
            </View>
            <Text style={s.title}>{cv.title}</Text>
            <Text style={s.workLine}>{cv.workLine}</Text>
          </View>
          <View style={s.photoWrap}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            <Image src={photoUrl} style={s.photo} />
            <View style={s.photoTape} />
          </View>
        </View>

        <View style={s.busbar} />
        <Text style={s.summary}>{cv.summary}</Text>

        <View style={s.plate}>
          <View style={[s.rivet, { top: 4, left: 4 }]} />
          <View style={[s.rivet, { top: 4, right: 4 }]} />
          <View style={[s.rivet, { bottom: 4, left: 4 }]} />
          <View style={[s.rivet, { bottom: 4, right: 4 }]} />
          <PlateCell label="Email" value={cv.contact.email} href={`mailto:${cv.contact.email}`} />
          {cv.contact.phone && (
            <PlateCell label="Phone" value={cv.contact.phone} href={`tel:${cv.contact.phone.replace(/\s+/g, "")}`} />
          )}
          <PlateCell label="Based in" value={cv.location} wide />
          <PlateCell
            label="LinkedIn"
            value={cv.contact.linkedin.replace(/^https:\/\/(www\.)?/, "")}
            href={cv.contact.linkedin}
          />
          <PlateCell label="GitHub" value={cv.contact.github.replace(/^https:\/\//, "")} href={cv.contact.github} />
        </View>

        <SectionTape tilt={-1}>Skills</SectionTape>
        <View style={s.markers}>
          {cv.skills.map((skill) => (
            <Text key={skill} style={s.marker}>
              {skill}
            </Text>
          ))}
        </View>

        <SectionTape tilt={0.8}>Experience</SectionTape>
        {cv.roles.map((role, i) => (
          <View key={role.id} style={s.role}>
            <View style={s.roleHeader} wrap={false} minPresenceAhead={36}>
              <View style={s.circuit}>
                <View style={i === 0 && role.dates.includes("Present") ? [s.circuitTag, s.liveTag] : s.circuitTag}>
                  <Text style={s.circuitText}>C{cv.roles.length - i}</Text>
                </View>
              </View>
              <View style={s.roleHeaderBody}>
                <View style={s.roleHead}>
                  <Text style={s.roleTitle}>{role.role}</Text>
                  <Text style={s.dates}>{role.dates}</Text>
                </View>
                <View style={s.companyRow}>
                  <Text style={s.company}>{role.company}</Text>
                  <Text style={s.location}>{role.location}</Text>
                </View>
                {(role.engagement || role.team) && (
                  <Text style={s.roleMeta}>{[role.engagement, role.team].filter(Boolean).join(" · ")}</Text>
                )}
                <Text style={s.blurb}>{role.blurb}</Text>
              </View>
            </View>
            {role.bullets.map((bullet) => (
              <Bullet key={bullet.text}>{bullet.text}</Bullet>
            ))}
          </View>
        ))}

        <View style={s.columns} wrap={false}>
          <View style={s.column}>
            <SectionTape tilt={-0.8}>Earlier</SectionTape>
            {cv.earlier.map((entry) => (
              <View key={entry.company} style={s.item}>
                <Text style={s.itemTitle}>
                  {entry.company}, {entry.location}
                </Text>
                <Text style={s.itemSub}>{entry.roles.join("; ")}</Text>
              </View>
            ))}
            <Text style={s.itemSub}>{cv.earlierNote}</Text>
          </View>
          <View style={s.column}>
            <SectionTape tilt={1}>Education</SectionTape>
            {cv.education.map((item) => (
              <View key={item.name} style={s.item}>
                <Text style={s.itemTitle}>{item.name}</Text>
                <Text style={s.itemSub}>
                  {item.issuer}, {item.period}
                </Text>
              </View>
            ))}
            <SectionTape tilt={-0.6}>Languages</SectionTape>
            {cv.languages.map((language) => (
              <View key={language.name} style={s.item}>
                <Text style={s.itemTitle}>{language.name}</Text>
                <Text style={s.itemSub}>{language.level}</Text>
              </View>
            ))}
          </View>
        </View>

        <SectionTape tilt={0.7}>Open source</SectionTape>
        {cv.portfolio.map((project) => (
          <View key={project.name} style={s.item} wrap={false}>
            <Link src={project.href} style={[s.itemTitle, s.link]}>
              {project.href.replace(/^https:\/\/github\.com\//, "github.com/")}
            </Link>
            <Text style={s.itemSub}>{project.description}</Text>
          </View>
        ))}

        <SectionTape tilt={-0.9}>References</SectionTape>
        <Text>Available on request.</Text>

        <View fixed style={s.footer}>
          <Text>{cv.name}, CV</Text>
          <Text render={({ pageNumber, totalPages }) => `Sheet ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
