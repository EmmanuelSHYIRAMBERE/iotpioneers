import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { contact } from "@/content/contact";
import { site } from "@/content/site";
import { socialLinks } from "@/content/social";
import { SkipLink } from "@/components/layout/SkipLink";
import { AnchorHighlight } from "@/components/ui/AnchorHighlight";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { buildOrganizationJsonLd } from "@/lib/structuredData";
import { isPlaceholder, isPreviewMode, resolveSiteUrl } from "@/lib/verification";
import { REDUCE_MOTION_STORAGE_KEY } from "@/lib/motion";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

// Data font is used below the fold and in small labels only: not preloaded.
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  preload: false,
});

const preview = isPreviewMode();
const siteUrl = resolveSiteUrl(site.siteUrl.text);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: site.metaTitle.text,
  description: site.metaDescription.text,
  applicationName: site.name.text,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name.text,
    title: site.metaTitle.text,
    description: site.metaDescription.text,
    url: "/",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: site.metaTitle.text,
    description: site.metaDescription.text,
  },
  // Preview builds (and anything with an unconfirmed domain) must never be indexed.
  robots:
    preview || isPlaceholder(site.siteUrl.text)
      ? { index: false, follow: false }
      : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

// Applies the footer "Reduce motion" choice before first paint, so nothing flashes into motion.
const reduceMotionScript = `try{if(localStorage.getItem(${JSON.stringify(REDUCE_MOTION_STORAGE_KEY)})==="true"){document.documentElement.dataset.reduceMotion="true"}}catch(e){}`;

// Without JavaScript, every reveal stays visible.
const noScriptStyles = `[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  const organization = buildOrganizationJsonLd({
    legalName: site.legalName,
    siteUrl,
    siteUrlVerified: site.siteUrl.verified,
    contact,
    social: socialLinks,
    logoPath: null,
  });

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: reduceMotionScript }} />
        <noscript>
          <style>{noScriptStyles}</style>
        </noscript>
        {organization ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
          />
        ) : null}
      </head>
      <body>
        <SkipLink />
        <MotionProvider>{children}</MotionProvider>
        <AnchorHighlight />
      </body>
    </html>
  );
}
