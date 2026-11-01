import type { Metadata, Viewport } from "next";
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
  description: profile.tagline,
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description: profile.tagline,
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#C3C7CA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} antialiased`}
    >
      <body className="min-h-dvh overflow-x-clip text-body">{children}</body>
    </html>
  );
}
