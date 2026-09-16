"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import styles from "./admin.module.css";

type Profile = {
  id: string;
  display_name: string;
  role: "admin" | "editor" | "contributor";
  is_active: boolean;
  created_at: string;
};

type Article = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  sport: string;
  scenario_type: string;
  status: "draft" | "in_review" | "changes_requested" | "approved" | "scheduled" | "published" | "archived";
  submitted_at: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  featured: boolean;
  updated_at: string;
};

type ReviewNote = Record<string, string>;

const labels: Record<Article["status"], string> = {
  draft: "Draft",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export function AdminDashboard() {
  const [me, setMe] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [notes, setNotes] = useState<ReviewNote>({});
  const [schedule, setSchedule] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    void load();
    const { data } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function load() {
    setLoading(true);
    setMessage("");

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user ?? null;
    if (!user) {
      setLoading(false);
      setMe(null);
      setProfiles([]);
      setArticles([]);
      return;
    }

    const { data: mine, error: profileError } = await supabase
      .from("profiles")
      .select("id,display_name,role,is_active,created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      setMe(null);
      return;
    }

    const mineProfile = mine as Profile | null;
    setMe(mineProfile);
    if (!mineProfile || !mineProfile.is_active || !["admin", "editor"].includes(mineProfile.role)) {
      setLoading(false);
      return;
    }

    const [{ data: p, error: peopleError }, { data: a, error: articlesError }] = await Promise.all([
      supabase.from("profiles").select("id,display_name,role,is_active,created_at").order("created_at", { ascending: false }),
      supabase.from("articles").select("id,author_id,title,slug,sport,scenario_type,status,submitted_at,scheduled_for,published_at,featured,updated_at").order("updated_at", { ascending: false }),
    ]);

    if (peopleError || articlesError) setMessage(peopleError?.message ?? articlesError?.message ?? "Unable to load newsroom data.");
    setProfiles((p ?? []) as Profile[]);
    setArticles((a ?? []) as Article[]);
    setLoading(false);
  }

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setAuthBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setPassword("");
    await load();
  }

  const stats = useMemo(() => ({
    pending: profiles.filter((p) => !p.is_active).length,
    review: articles.filter((a) => a.status === "in_review").length,
    scheduled: articles.filter((a) => a.status === "scheduled").length,
    published: articles.filter((a) => a.status === "published").length,
  }), [profiles, articles]);

  async function logEvent(articleId: string, eventType: string, details: Record<string, unknown> = {}) {
    if (!me) return;
    await supabase.from("editorial_events").insert({ article_id: articleId, actor_id: me.id, event_type: eventType, details });
  }

  async function manageProfile(profile: Profile, patch: Partial<Pick<Profile, "role" | "is_active">>) {
    if (me?.role !== "admin") return;
    setBusyId(profile.id);
    setMessage("");
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    setBusyId(null);
    if (error) setMessage(error.message);
    else { setMessage("Contributor access updated."); await load(); }
  }

  async function reviewArticle(article: Article, decision: "changes_requested" | "approved") {
    if (!me) return;
    setBusyId(article.id);
    setMessage("");
    const note = notes[article.id]?.trim() || null;
    const now = new Date().toISOString();
    const { error } = await supabase.from("articles").update({ status: decision, reviewed_at: now, reviewed_by: me.id, editor_notes: note }).eq("id", article.id);
    if (!error) {
      await supabase.from("article_reviews").insert({ article_id: article.id, reviewer_id: me.id, decision, note });
      await logEvent(article.id, decision, { note });
    }
    setBusyId(null);
    if (error) setMessage(error.message);
    else { setMessage(decision === "approved" ? "Article approved." : "Revision request sent to contributor."); await load(); }
  }

  async function publishNow(article: Article) {
    if (!me) return;
    setBusyId(article.id);
    const now = new Date().toISOString();
    const { error } = await supabase.from("articles").update({ status: "published", published_at: now, scheduled_for: null, reviewed_at: article.status === "in_review" ? now : undefined, reviewed_by: me.id }).eq("id", article.id);
    if (!error) await logEvent(article.id, "published", { published_at: now });
    setBusyId(null);
    if (error) setMessage(error.message); else { setMessage("Article published."); await load(); }
  }

  async function scheduleArticle(article: Article) {
    if (!me) return;
    const value = schedule[article.id];
    if (!value) { setMessage("Choose a publication date and time first."); return; }
    setBusyId(article.id);
    const iso = new Date(value).toISOString();
    const { error } = await supabase.from("articles").update({ status: "scheduled", scheduled_for: iso, reviewed_by: me.id, reviewed_at: new Date().toISOString() }).eq("id", article.id);
    if (!error) await logEvent(article.id, "scheduled", { scheduled_for: iso });
    setBusyId(null);
    if (error) setMessage(error.message); else { setMessage("Article scheduled."); await load(); }
  }

  async function setFeatured(article: Article, value: boolean) {
    setBusyId(article.id);
    const { error } = await supabase.from("articles").update({ featured: value }).eq("id", article.id);
    setBusyId(null);
    if (error) setMessage(error.message); else { setMessage(value ? "Article marked featured." : "Article removed from featured placement."); await load(); }
  }

  if (loading) return <section className={`shell ${styles.shell}`}><div className={styles.accessCard}>Loading newsroom…</div></section>;

  if (!me) return <section className={`shell ${styles.shell}`}><div className={styles.accessCard}><p className="goldKicker">EDITORIAL ACCESS</p><h2>Sign in to the newsroom</h2><p>Use your Sports Rewritten account. Administrator and editor accounts can enter the Editorial Dashboard directly.</p><form onSubmit={signIn} style={{ display: "grid", gap: 12, marginTop: 20 }}><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><button className="redButton" disabled={authBusy}>{authBusy ? "Signing in…" : "Sign In to Editorial Dashboard"}</button></form>{message && <p className={styles.message}>{message}</p>}<p style={{ marginTop: 18 }}><Link href="/studio">Contributor Studio</Link></p></div></section>;

  if (!me.is_active || !["admin", "editor"].includes(me.role)) return <section className={`shell ${styles.shell}`}><div className={styles.accessCard}><h2>Editorial access required</h2><p>This account is signed in, but Editorial Dashboard access is limited to Sports Rewritten editors and administrators.</p><p>Current role: <strong>{me.role}</strong></p><button className="outlineButton" onClick={() => supabase.auth.signOut()}>Sign Out</button></div></section>;

  return (
    <section className={`shell ${styles.shell}`}>
      <div className={styles.topline}>
        <div><strong>{me.display_name}</strong><span>{me.role}</span></div>
        <div className={styles.quickLinks}><Link href="/studio">Write Article</Link><button type="button" onClick={() => supabase.auth.signOut().then(() => location.href = "/admin")}>Sign Out</button></div>
      </div>
      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.stats}>
        <div><span>{stats.pending}</span><small>Pending Contributors</small></div>
        <div><span>{stats.review}</span><small>Articles In Review</small></div>
        <div><span>{stats.scheduled}</span><small>Scheduled</small></div>
        <div><span>{stats.published}</span><small>Published</small></div>
      </div>

      <div className={styles.sectionHeading}><div><p className="goldKicker">PEOPLE</p><h2>Contributor Management</h2></div><p>{me.role === "admin" ? "Approve writers, change roles, or deactivate access." : "Editors can view contributor status. Only administrators can change access."}</p></div>
      <div className={styles.peopleGrid}>
        {profiles.map((profile) => (
          <article className={styles.personCard} key={profile.id}>
            <div><h3>{profile.display_name}</h3><p>{profile.role}</p></div>
            <span className={profile.is_active ? styles.active : styles.pending}>{profile.is_active ? "Active" : "Pending"}</span>
            {me.role === "admin" && profile.id !== me.id && <div className={styles.personActions}>
              {!profile.is_active && <button disabled={busyId === profile.id} onClick={() => void manageProfile(profile, { is_active: true })}>Approve</button>}
              {profile.is_active && <button disabled={busyId === profile.id} onClick={() => void manageProfile(profile, { is_active: false })}>Deactivate</button>}
              <select value={profile.role} disabled={busyId === profile.id} onChange={(e) => void manageProfile(profile, { role: e.target.value as Profile["role"] })}>
                <option value="contributor">Contributor</option><option value="editor">Editor</option><option value="admin">Admin</option>
              </select>
            </div>}
          </article>
        ))}
      </div>

      <div className={styles.sectionHeading}><div><p className="goldKicker">PIPELINE</p><h2>Editorial Queue</h2></div><p>Review submitted stories and move approved work toward publication.</p></div>
      <div className={styles.articleList}>
        {articles.length === 0 && <div className={styles.empty}>No articles have entered the editorial system yet.</div>}
        {articles.map((article) => {
          const author = profiles.find((p) => p.id === article.author_id);
          return <article className={styles.articleCard} key={article.id}>
            <div className={styles.articleTop}><div><p>{article.sport} · {article.scenario_type}</p><h3>{article.title}</h3><small>By {author?.display_name ?? "Unknown contributor"} · Updated {new Date(article.updated_at).toLocaleDateString()}</small></div><span className={styles.status}>{labels[article.status]}</span></div>
            <div className={styles.pipelineActions}>
              {article.status === "in_review" && <>
                <textarea placeholder="Editorial note or revision request…" value={notes[article.id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [article.id]: e.target.value }))} />
                <button disabled={busyId === article.id} onClick={() => void reviewArticle(article, "changes_requested")}>Request Changes</button>
                <button className={styles.primary} disabled={busyId === article.id} onClick={() => void reviewArticle(article, "approved")}>Approve</button>
              </>}
              {["approved", "scheduled"].includes(article.status) && <>
                <input type="datetime-local" value={schedule[article.id] ?? ""} onChange={(e) => setSchedule((s) => ({ ...s, [article.id]: e.target.value }))} />
                <button disabled={busyId === article.id} onClick={() => void scheduleArticle(article)}>Schedule</button>
                <button className={styles.primary} disabled={busyId === article.id} onClick={() => void publishNow(article)}>Publish Now</button>
              </>}
              {article.status === "published" && <button disabled={busyId === article.id} onClick={() => void setFeatured(article, !article.featured)}>{article.featured ? "Remove Featured" : "Make Featured"}</button>}
              <Link className={styles.viewLink} href={`/studio?article=${article.id}`}>Open in Studio</Link>
            </div>
            {article.scheduled_for && <p className={styles.scheduleLine}>Scheduled: {new Date(article.scheduled_for).toLocaleString()}</p>}
          </article>;
        })}
      </div>
    </section>
  );
}
