"use client";

import { useEffect, useRef } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

const VISITOR_KEY = "sports-rewritten-visitor-id";
const SESSION_KEY = "sports-rewritten-session-id";

function idFor(storage: Storage, key: string) {
  let value = storage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    storage.setItem(key, value);
  }
  return value;
}

export function ArticleEngagementTracker({ articleId, sectionCount }: { articleId: string; sectionCount: number }) {
  const activeSeconds = useRef(0);
  const maxSection = useRef(0);
  const lastTick = useRef(Date.now());

  useEffect(() => {
    const supabase = createPublicSupabaseClient();
    const visitorId = idFor(localStorage, VISITOR_KEY);
    const sessionId = idFor(sessionStorage, SESSION_KEY);

    function measure() {
      const readable = [...document.querySelectorAll('[data-analytics-readable="true"]')];
      readable.forEach((section, index) => {
        if (section.getBoundingClientRect().top < window.innerHeight * 0.72) {
          maxSection.current = Math.max(maxSection.current, index + 1);
        }
      });
    }

    function tick() {
      const now = Date.now();
      if (!document.hidden && document.hasFocus()) {
        activeSeconds.current += Math.max(0, Math.round((now - lastTick.current) / 1000));
      }
      lastTick.current = now;
    }

    async function send() {
      measure();
      tick();
      const readPercent = Math.min(100, Math.round((maxSection.current / Math.max(1, sectionCount)) * 100));
      await supabase.rpc("record_article_engagement", {
        p_article_id: articleId,
        p_visitor_id: visitorId,
        p_session_id: sessionId,
        p_read_percent: readPercent,
        p_active_seconds: activeSeconds.current,
        p_max_section_index: maxSection.current,
        p_section_count: sectionCount,
        p_completed: maxSection.current >= sectionCount,
      });
    }

    measure();
    const interval = window.setInterval(() => void send(), 15000);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const onVisibility = () => { if (document.hidden) void send(); };
    const onPageHide = () => void send();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      void send();
    };
  }, [articleId, sectionCount]);

  return null;
}
