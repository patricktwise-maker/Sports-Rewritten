"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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

export function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/studio")) return;

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        // Fail closed for signed-in users if role lookup fails so staff traffic
        // can never be accidentally counted because of a transient profile error.
        if (error) return;
        if (profile?.role && STAFF_ROLES.has(profile.role)) return;
      }

      await supabase.rpc("record_site_page_view", {
        p_visitor_id: idFor(localStorage, VISITOR_KEY),
        p_session_id: idFor(sessionStorage, SESSION_KEY),
        p_path: pathname,
      });
    })();
  }, [pathname]);

  return null;
}
