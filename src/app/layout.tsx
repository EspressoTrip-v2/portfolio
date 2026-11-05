import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Archivo } from "next/font/google";
import { isIndexable, siteUrl } from "@/config/site";
import { profile } from "@/content/profile";
import "./globals.css";

// One variable family. The width axis does the work: expanded for label tape,
// condensed for data, normal for reading.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  alternates: { canonical: "/" },
  robots: isIndexable ? undefined : { index: false, follow: false },
  title: `${profile.name} — ${profile.title}`,
  description: profile.metaDescription,
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description: profile.metaDescription,
    type: "profile",
    url: "/",
    siteName: profile.name,
  },
};

/** schema.org Person, so search engines can tie the site to Juan's profiles. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  description: profile.metaDescription,
  url: siteUrl.toString(),
  email: profile.links.email.href,
  address: {
    "@type": "PostalAddress",
    addressLocality: profile.address.locality,
    addressRegion: profile.address.region,
    addressCountry: profile.address.country,
  },
  sameAs: [profile.links.linkedin.href, profile.links.github.href],
  knowsAbout: profile.stack,
};

export const viewport: Viewport = {
  themeColor: "#C3C7CA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} antialiased`}>
      <body className="min-h-dvh overflow-x-clip text-body">
        <script
          type="application/ld+json"
          // Escape "<" so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
