import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of Sports Rewritten.",
  alternates: { canonical: "https://sportsrewritten.com/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="shell" style={{maxWidth:900,padding:"56px 0 80px"}}>
        <p className="goldKicker">SPORTS REWRITTEN</p>
        <h1 style={{fontSize:"clamp(42px,7vw,68px)",margin:"10px 0 12px"}}>Terms of Use</h1>
        <p style={{color:"#9fa9ad"}}>Last updated: September 19, 2026</p>
        <div style={{display:"grid",gap:26,lineHeight:1.75,color:"#c4ccd0"}}>
          <section><h2>About the content</h2><p>Sports Rewritten publishes sports analysis, alternate-history scenarios, simulations, and creative editorial storytelling. Alternate timelines are hypothetical. They are not statements that the imagined events actually occurred or guarantees that they would have occurred.</p></section>
          <section><h2>Accounts</h2><p>You are responsible for maintaining the security of your account credentials and for activity performed through your account. Do not use another person's account without authorization or attempt to bypass access controls.</p></section>
          <section><h2>Memberships</h2><p>Paid membership provides access to premium content and features while the subscription is active. Pricing and billing frequency are shown before checkout. Billing is processed by Stripe. Unless Stripe or the checkout flow states otherwise, cancellation scheduled for the end of a billing period leaves access active through that period.</p></section>
          <section><h2>Comments and community participation</h2><p>Comments may be moderated before publication. Sports Rewritten may reject or remove comments that are abusive, unlawful, spam, impersonation, infringing, or otherwise disruptive to the service.</p></section>
          <section><h2>Intellectual property</h2><p>Original Sports Rewritten articles, site design, graphics, branding, and other original materials are protected by applicable intellectual-property laws. Sports names, statistics, historical facts, trademarks, and third-party materials remain the property of their respective owners where applicable.</p></section>
          <section><h2>Acceptable use</h2><p>Do not scrape premium content, circumvent the paywall, interfere with site operation, abuse authentication or commenting systems, or use the service in violation of applicable law.</p></section>
          <section><h2>Service changes</h2><p>Features, pricing, and availability may change over time. These terms may also be revised as the service develops. Continued use after updated terms are published constitutes acceptance of the revised terms to the extent permitted by law.</p></section>
        </div>
      </main>
      <Footer />
    </>
  );
}
