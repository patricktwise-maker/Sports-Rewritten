import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sportsrewritten.com"),
  title: { default: "Sports Rewritten | The Home of the Sports Multiverse", template: "%s | Sports Rewritten" },
  description: "Evidence-based alternate sports history, simulations, and long-form storytelling.",
  openGraph: {
    title: "Sports Rewritten",
    description: "The Home of the Sports Multiverse",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
