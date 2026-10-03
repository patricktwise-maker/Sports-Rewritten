import type { Metadata } from "next";
import "./globals.css";
import { SiteAnalytics } from "@/components/SiteAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://sportsrewritten.com"),
  title: { default: "Sports Rewritten | The Home of the Sports Multiverse", template: "%s | Sports Rewritten" },
  description: "Evidence-based alternate sports history, simulations, and long-form storytelling.",
  alternates: { canonical: "https://sportsrewritten.com" },
  openGraph: {
    title: "Sports Rewritten | The Home of the Sports Multiverse",
    description: "Evidence-based alternate sports history, simulations, and long-form storytelling.",
    url: "https://sportsrewritten.com",
    siteName: "Sports Rewritten",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Rewritten | The Home of the Sports Multiverse",
    description: "Evidence-based alternate sports history, simulations, and long-form storytelling.",
  },
};

const siteJsonLd = {
  "@context":"https://schema.org",
  "@graph":[
    {
      "@type":"WebSite",
      "@id":"https://sportsrewritten.com/#website",
      url:"https://sportsrewritten.com",
      name:"Sports Rewritten",
      alternateName:"The Home of the Sports Multiverse",
      description:"Evidence-based alternate sports history, simulations, and long-form storytelling.",
      publisher:{"@id":"https://sportsrewritten.com/#organization"}
    },
    {
      "@type":"Organization",
      "@id":"https://sportsrewritten.com/#organization",
      name:"Sports Rewritten",
      url:"https://sportsrewritten.com",
      description:"An independent sports publication focused on research-driven alternate sports history."
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(siteJsonLd)}} /><SiteAnalytics />{children}</body></html>;
}
