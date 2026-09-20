"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import styles from "./article.module.css";

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export function CommentsSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void loadComments();
    void syncAuth();
    const { data } = supabase.auth.onAuthStateChange(() => void syncAuth());
    return () => data.subscription.unsubscribe();
  }, [articleId]);

  async function syncAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    setSignedIn(Boolean(user));
  }

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("id,author_name,body,created_at")
      .eq("article_id", articleId)
      .eq("status", "approved")
      .order("created_at", { ascending: true });
    setComments((data ?? []) as Comment[]);
  }

  async function submitComment(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!signedIn) {
      setMessage("Sign in before submitting a comment.");
      return;
    }
    if (name.trim().length < 2 || body.trim().length < 2) {
      setMessage("Add your name and a comment before submitting.");
      return;
    }
    setBusy(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id ?? null;
    if (!userId) {
      setBusy(false);
      setMessage("Sign in before submitting a comment.");
      return;
    }
    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: userId,
      author_name: name.trim(),
      body: body.trim(),
      status: "pending",
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setBody("");
    setMessage("Comment submitted for moderation. It will appear after editorial approval.");
  }

  return (
    <section className={styles.comments} aria-labelledby="comments-heading">
      <div className={styles.commentHeading}>
        <div>
          <p className="goldKicker">THE DISCUSSION</p>
          <h2 id="comments-heading">Comments</h2>
        </div>
        <span>{comments.length} approved</span>
      </div>

      <div className={styles.commentList}>
        {comments.length === 0 && <p className={styles.emptyComments}>No approved comments yet. Start the conversation.</p>}
        {comments.map((comment) => (
          <article className={styles.comment} key={comment.id}>
            <div className={styles.commentMeta}>
              <strong>{comment.author_name}</strong>
              <time>{new Date(comment.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time>
            </div>
            <p>{comment.body}</p>
          </article>
        ))}
      </div>

      <form className={styles.commentForm} onSubmit={submitComment}>
        <h3>Join the discussion</h3>
        <p>Comments are reviewed before they appear publicly. You must be signed in to comment.</p>
        {!signedIn && <p><Link href="/membership">Sign in or create a reader account</Link> to join the discussion.</p>}
        <label>
          Display name
          <input maxLength={80} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Comment
          <textarea maxLength={2000} rows={5} value={body} onChange={(e) => setBody(e.target.value)} required />
        </label>
        <button className="redButton" type="submit" disabled={busy || !signedIn}>{busy ? "Submitting…" : "Submit Comment"}</button>
        {message && <p className={styles.commentMessage}>{message}</p>}
      </form>
    </section>
  );
}
