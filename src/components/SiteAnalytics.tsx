"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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

export function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/studio")) return;
    const supabase = createPublicSupabaseClient();
    void supabase.rpc("record_site_page_view", {
      p_visitor_id: idFor(localStorage, VISITOR_KEY),
      p_session_id: idFor(sessionStorage, SESSION_KEY),
      p_path: pathname,
    });
  }, [pathname]);

  return null;
}
