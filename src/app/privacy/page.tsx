import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for Sports Rewritten.",
  alternates: { canonical: "https://sportsrewritten.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="shell" style={{maxWidth:900,padding:"56px 0 80px"}}>
        <p className="goldKicker">SPORTS REWRITTEN</p>
        <h1 style={{fontSize:"clamp(42px,7vw,68px)",margin:"10px 0 12px"}}>Privacy Policy</h1>
        <p style={{color:"#9fa9ad"}}>Last updated: September 19, 2026</p>
        <div style={{display:"grid",gap:26,lineHeight:1.75,color:"#c4ccd0"}}>
          <section><h2>Information we collect</h2><p>When you create a reader or contributor account, Sports Rewritten may collect account information such as your email address, display name, account role, and authentication records. When you comment, we store the display name, comment text, moderation status, and the account associated with the comment when applicable.</p></section>
          <section><h2>Membership and payments</h2><p>Membership checkout and billing are handled by Stripe. Sports Rewritten stores subscription identifiers, plan status, billing-period information, and related account references needed to determine membership access. Payment-card details are handled by Stripe and are not stored in the Sports Rewritten application database.</p></section>
          <section><h2>Authentication and email</h2><p>Account authentication and application data are hosted with Supabase. Transactional authentication email is delivered using Resend. These service providers process information as needed to provide their services.</p></section>
          <section><h2>How information is used</h2><p>Information is used to operate accounts, provide membership access, process and synchronize subscription status, moderate comments, secure the service, communicate authentication messages, and maintain the site.</p></section>
          <section><h2>Sharing</h2><p>Sports Rewritten does not sell reader account data. Information may be processed by service providers used to operate the site, including hosting, authentication, payments, and transactional email providers, or disclosed when required by law.</p></section>
          <section><h2>Retention and account requests</h2><p>Records may be retained while an account or subscription is active and for a reasonable period afterward for security, accounting, dispute resolution, and operational purposes. Requests concerning account data can be handled through the account and billing tools available on the site or by emailing sportsrewritten1@gmail.com.</p></section>
          <section><h2>Changes</h2><p>This policy may be updated as Sports Rewritten adds features or service providers. The date above will be updated when material changes are published.</p></section>
        </div>
      </main>
      <Footer />
    </>
  );
}
