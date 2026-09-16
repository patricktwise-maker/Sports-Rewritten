import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StudioEditor } from "./StudioEditor";

export const metadata: Metadata = {
  title: "Contributor Studio | Sports Rewritten",
  description: "Create, preview, and submit Sports Rewritten articles for editorial review.",
};

export default function StudioPage() {
  return (
    <>
      <Header />
      <main>
        <section className="shell" style={{ padding: "34px 0 14px" }}>
          <p className="eyebrow">EDITORIAL WORKSPACE</p>
          <h1 style={{ fontFamily: "Impact, 'Arial Narrow', sans-serif", fontSize: "clamp(44px,7vw,82px)", lineHeight: .94, margin: 0 }}>
            CONTRIBUTOR <span style={{ color: "var(--red)" }}>STUDIO</span>
          </h1>
          <p style={{ color: "#aeb8bc", maxWidth: 760, lineHeight: 1.55 }}>
            Build Sports Rewritten stories, organize the timeline, preview the reader experience, and submit drafts for editorial review.
          </p>
        </section>
        <StudioEditor />
      </main>
      <Footer />
    </>
  );
}
