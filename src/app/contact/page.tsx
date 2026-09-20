import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Sports Rewritten",
  description: "Contact Sports Rewritten about memberships, contributors, corrections, and technical issues.",
  alternates: { canonical: "https://sportsrewritten.com/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="shell" style={{maxWidth:900,padding:"56px 0 80px"}}>
        <p className="goldKicker">CONTACT</p>
        <h1 style={{fontSize:"clamp(42px,7vw,68px)",margin:"10px 0 18px"}}>Reach Sports Rewritten</h1>
        <p style={{fontSize:19,lineHeight:1.7,color:"#c4ccd0"}}>Send a message about membership, contributor questions, corrections, or technical problems. Replies will come by email.</p>
        <ContactForm />
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:18,marginTop:30}}>
          <section style={{border:"1px solid rgba(255,255,255,.13)",padding:22,background:"#11181b"}}><h2>Reader & billing help</h2><p style={{color:"#aeb7bb",lineHeight:1.6}}>Sign in to view membership status or open Stripe's secure billing portal.</p><Link className="outlineButton" href="/membership">Membership</Link></section>
          <section style={{border:"1px solid rgba(255,255,255,.13)",padding:22,background:"#11181b"}}><h2>Contributors</h2><p style={{color:"#aeb7bb",lineHeight:1.6}}>Contributor applications and approved contributor work are handled through the Contributor Studio.</p><Link className="outlineButton" href="/studio">Contributor Studio</Link></section>
        </div>
      </main>
      <Footer />
    </>
  );
}
