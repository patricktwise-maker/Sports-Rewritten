"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

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
    void (async()=>{ const {data:{user}}=await supabase.auth.getUser(); if(user){ const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle(); if(profile?.role==="admin"||profile?.role==="editor"||profile?.role==="contributor") return; } await supabase.rpc("record_site_page_view", {
      p_visitor_id: idFor(localStorage, VISITOR_KEY),
      p_session_id: idFor(sessionStorage, SESSION_KEY),
      p_path: pathname,
    }); })();
  }, [pathname]);

  return null;
}
