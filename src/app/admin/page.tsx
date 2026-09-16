import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Editorial Dashboard | Sports Rewritten",
  description: "Manage Sports Rewritten contributors, editorial review, scheduling, and publishing.",
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <main>
        <section className="shell" style={{ padding: "34px 0 14px" }}>
          <p className="eyebrow">NEWSROOM CONTROL</p>
          <h1 style={{ fontFamily: "Impact, 'Arial Narrow', sans-serif", fontSize: "clamp(44px,7vw,82px)", lineHeight: .94, margin: 0 }}>
            EDITORIAL <span style={{ color: "var(--red)" }}>DASHBOARD</span>
          </h1>
          <p style={{ color: "#aeb8bc", maxWidth: 780, lineHeight: 1.55 }}>
            Approve contributors, review submitted stories, request revisions, schedule publication, and manage the Sports Rewritten editorial pipeline.
          </p>
        </section>
        <AdminDashboard />
      </main>
      <Footer />
    </>
  );
}
