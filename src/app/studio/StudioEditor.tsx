"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import styles from "./studio.module.css";

type Section = {
  id: string;
  heading: string;
  body: string;
  premium: boolean;
};

type Draft = {
  title: string;
  subtitle: string;
  slug: string;
  sport: string;
  scenarioType: string;
  tags: string;
  excerpt: string;
  heroAlt: string;
  heroFileName: string;
  seoTitle: string;
  seoDescription: string;
  notes: string;
  status: "Draft" | "In Review";
  sections: Section[];
};

const STORAGE_KEY = "sports-rewritten-contributor-draft-v1";

const initialDraft: Draft = {
  title: "",
  subtitle: "",
  slug: "",
  sport: "College Football",
  scenarioType: "Born in Another Era",
  tags: "",
  excerpt: "",
  heroAlt: "",
  heroFileName: "",
  seoTitle: "",
  seoDescription: "",
  notes: "",
  status: "Draft",
  sections: [
    { id: "section-1", heading: "The Player We Actually Got", body: "", premium: false },
    { id: "section-2", heading: "The Divergence", body: "", premium: false },
  ],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function StudioEditor() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [ready, setReady] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");
  const [heroPreview, setHeroPreview] = useState<string>("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDraft(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [draft, ready]);

  const wordCount = useMemo(() => {
    const text = [draft.title, draft.subtitle, draft.excerpt, ...draft.sections.map((s) => s.body)].join(" ");
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [draft]);

  const readingMinutes = Math.max(1, Math.ceil(wordCount / 225));

  function updateField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateTitle(value: string) {
    setDraft((current) => ({
      ...current,
      title: value,
      slug: current.slug && current.slug !== slugify(current.title) ? current.slug : slugify(value),
      seoTitle: current.seoTitle || value,
    }));
  }

  function updateSection(id: string, patch: Partial<Section>) {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) => section.id === id ? { ...section, ...patch } : section),
    }));
  }

  function addSection() {
    setDraft((current) => ({
      ...current,
      sections: [
        ...current.sections,
        { id: `section-${Date.now()}`, heading: "New Section", body: "", premium: true },
      ],
    }));
  }

  function removeSection(id: string) {
    setDraft((current) => ({ ...current, sections: current.sections.filter((section) => section.id !== id) }));
  }

  function handleHero(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (heroPreview) URL.revokeObjectURL(heroPreview);
    setHeroPreview(URL.createObjectURL(file));
    updateField("heroFileName", file.name);
  }

  function saveNow() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  }

  function submitForReview() {
    if (!draft.title.trim() || !draft.excerpt.trim() || draft.sections.some((section) => !section.body.trim())) {
      window.alert("Add a headline, excerpt, and content to every section before submitting for review.");
      return;
    }
    setDraft((current) => ({ ...current, status: "In Review" }));
  }

  return (
    <section className={`shell ${styles.studioShell}`}>
      <div className={styles.statusBar}>
        <div>
          <span className={styles.status}>{draft.status}</span>
          <span>{savedAt ? `Saved ${savedAt}` : "Autosave ready"}</span>
          <span>{wordCount.toLocaleString()} words</span>
          <span>{readingMinutes} min read</span>
        </div>
        <p>Studio preview mode. Drafts currently save only on this device until the Sports Rewritten editorial backend is connected.</p>
      </div>

      <div className={styles.toolbar}>
        <button type="button" className="outlineButton" onClick={saveNow}>Save Draft</button>
        <button type="button" className="outlineButton" onClick={() => setPreviewMode((value) => !value)}>{previewMode ? "Edit Article" : "Preview Article"}</button>
        <button type="button" className="redButton" onClick={submitForReview}>Submit for Review</button>
      </div>

      {previewMode ? (
        <article className={styles.preview}>
          <p className="eyebrow">{draft.sport.toUpperCase()} • {draft.scenarioType.toUpperCase()}</p>
          <h1>{draft.title || "Untitled Sports Rewritten Story"}</h1>
          <p className={styles.previewSubtitle}>{draft.subtitle || "Add a subtitle to frame the alternate timeline."}</p>
          {heroPreview ? <img src={heroPreview} alt={draft.heroAlt || "Draft hero preview"} className={styles.previewHero} /> : <div className={styles.heroPlaceholder}>HERO IMAGE PREVIEW</div>}
          <p className={styles.previewExcerpt}>{draft.excerpt || "Your article excerpt will appear here."}</p>
          {draft.sections.map((section, index) => (
            <section className={styles.previewSection} key={section.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className={styles.sectionHeadingRow}><h2>{section.heading || "Untitled Section"}</h2>{section.premium && <small>PREMIUM</small>}</div>
                <p>{section.body || "Section copy will appear here."}</p>
              </div>
            </section>
          ))}
        </article>
      ) : (
        <div className={styles.editorGrid}>
          <div className={styles.editorMain}>
            <div className={styles.card}>
              <p className="goldKicker">STORY BASICS</p>
              <label>Headline<input value={draft.title} onChange={(event) => updateTitle(event.target.value)} placeholder="What If..." /></label>
              <label>Subtitle / Deck<textarea rows={3} value={draft.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} /></label>
              <div className={styles.twoColumns}>
                <label>Sport<select value={draft.sport} onChange={(event) => updateField("sport", event.target.value)}><option>College Football</option><option>NFL</option><option>NBA</option><option>College Basketball</option><option>MLB</option><option>Boxing</option><option>Other Sports</option></select></label>
                <label>Scenario Type<select value={draft.scenarioType} onChange={(event) => updateField("scenarioType", event.target.value)}><option>Born in Another Era</option><option>Draft What If</option><option>Trade What If</option><option>Injury What If</option><option>Recruiting What If</option><option>Coaching What If</option><option>Careers Rewritten</option><option>Dynasty</option><option>Game Rewritten</option></select></label>
              </div>
              <label>Slug<input value={draft.slug} onChange={(event) => updateField("slug", slugify(event.target.value))} /></label>
              <label>Tags<input value={draft.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="Joe Hamilton, Georgia Tech, NFL Draft" /></label>
              <label>Article Excerpt<textarea rows={4} value={draft.excerpt} onChange={(event) => updateField("excerpt", event.target.value)} /></label>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeading}><div><p className="goldKicker">ARTICLE BODY</p><h2>Timeline Sections</h2></div><button type="button" className="outlineButton" onClick={addSection}>+ Add Section</button></div>
              <div className={styles.sections}>
                {draft.sections.map((section, index) => (
                  <div className={styles.sectionEditor} key={section.id}>
                    <div className={styles.sectionTop}><strong>{String(index + 1).padStart(2, "0")}</strong><input value={section.heading} onChange={(event) => updateSection(section.id, { heading: event.target.value })} aria-label={`Section ${index + 1} heading`} /><label className={styles.check}><input type="checkbox" checked={section.premium} onChange={(event) => updateSection(section.id, { premium: event.target.checked })} /> Premium</label>{draft.sections.length > 1 && <button type="button" onClick={() => removeSection(section.id)}>Remove</button>}</div>
                    <textarea rows={10} value={section.body} onChange={(event) => updateSection(section.id, { body: event.target.value })} placeholder="Write this section of the Sports Rewritten timeline..." />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className={styles.editorRail}>
            <div className={styles.card}>
              <p className="goldKicker">HERO ART</p>
              <label className={styles.uploadBox}>Choose hero image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleHero} /></label>
              {heroPreview && <img src={heroPreview} className={styles.railImage} alt="Hero image preview" />}
              <small>{draft.heroFileName || "PNG, JPEG, or WebP. Final published hero art should be at least 1200px wide."}</small>
              <label>Image Alt Text<textarea rows={3} value={draft.heroAlt} onChange={(event) => updateField("heroAlt", event.target.value)} /></label>
            </div>
            <div className={styles.card}>
              <p className="goldKicker">SEARCH & DISCOVERY</p>
              <label>SEO Title<input value={draft.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} /></label>
              <label>SEO Description<textarea rows={4} value={draft.seoDescription} onChange={(event) => updateField("seoDescription", event.target.value)} /></label>
            </div>
            <div className={styles.card}>
              <p className="goldKicker">EDITOR NOTES</p>
              <label>Private Notes<textarea rows={6} value={draft.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Sources to verify, simulation assumptions, art requests, questions for the editor..." /></label>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
