import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Sports Rewritten",
  description: "How Sports Rewritten builds evidence-based alternate sports histories.",
  alternates: { canonical: "https://sportsrewritten.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="shell" style={{maxWidth:900,padding:"56px 0 80px"}}>
        <p className="goldKicker">ABOUT SPORTS REWRITTEN</p>
        <h1 style={{fontSize:"clamp(44px,8vw,76px)",lineHeight:.96,margin:"10px 0 24px"}}>REAL HISTORY.<br/>PLAUSIBLE DIVERGENCE.</h1>
        <p style={{fontSize:21,lineHeight:1.7,color:"#c9d0d3"}}>Sports Rewritten explores the question behind every great sports argument: what happens if one decision, injury, draft pick, signing, coaching move, or recruiting choice changes?</p>
        <p style={{lineHeight:1.8,color:"#b6c0c4"}}>The process begins with the historical record, then identifies a credible point of divergence. From there, each timeline follows roster construction, contracts, draft position, competitive context, player development, and downstream consequences before the story is written.</p>
        <p style={{lineHeight:1.8,color:"#b6c0c4"}}>The house method is simple: <strong>research first, divergence second, simulation third, storytelling last.</strong> The goal is not to pretend an alternate outcome is certain. It is to build a version of sports history that remains grounded enough to debate.</p>
        <div style={{marginTop:34,display:"flex",gap:12,flexWrap:"wrap"}}>
          <Link className="redButton" href="/vault">Explore the Vault</Link>
          <Link className="outlineButton" href="/membership">Membership</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
