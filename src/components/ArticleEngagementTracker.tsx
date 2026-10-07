"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase-browser";

const VISITOR_KEY = "sports-rewritten-visitor-id";
const SESSION_KEY = "sports-rewritten-session-id";
const STAFF_ROLES = new Set(["admin", "editor", "contributor"]);

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
    let cancelled = false;
    let stopTracking = () => {};

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        // Fail closed for signed-in users if role lookup fails so staff traffic
        // is never accidentally included in article engagement analytics.
        if (error) return;
        if (profile?.role && STAFF_ROLES.has(profile.role)) return;
      }

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
      const onVisibility = () => {
        if (document.hidden) void send();
      };
      const onPageHide = () => void send();
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pagehide", onPageHide);

      stopTracking = () => {
        window.clearInterval(interval);
        window.removeEventListener("scroll", measure);
        window.removeEventListener("resize", measure);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pagehide", onPageHide);
        void send();
      };
    })();

    return () => {
      cancelled = true;
      stopTracking();
    };
  }, [articleId, sectionCount]);

  return null;
}
