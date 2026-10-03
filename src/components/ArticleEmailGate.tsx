"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

const UNLOCK_KEY = "sports-rewritten-email-unlocked";

export function ArticleEmailGate({
  articleId,
  children,
}: {
  articleId: string;
  children: ReactNode;
}) {
  const [ready,setReady]=useState(false);
  const [unlocked,setUnlocked]=useState(false);
  const [email,setEmail]=useState("");
  const [marketing,setMarketing]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    setUnlocked(localStorage.getItem(UNLOCK_KEY)==="true");
    setReady(true);
  },[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true);
    setMessage("");

    const supabase=createPublicSupabaseClient();
    const {error}=await supabase.from("reader_email_leads").insert({
      email:email.trim().toLowerCase(),
      first_article_id:articleId,
      first_path:window.location.pathname,
      marketing_consent:marketing
    });

    if(error){
      setMessage("Unable to continue. Please try again.");
      setBusy(false);
      return;
    }

    localStorage.setItem(UNLOCK_KEY,"true");
    setUnlocked(true);
    setBusy(false);
  }

  if(!ready)return null;
  if(unlocked)return <>{children}</>;

  return <div role="dialog" aria-modal="true" aria-labelledby="reader-email-title" style={{
    position:"fixed",inset:0,zIndex:9999,display:"grid",placeItems:"center",
    background:"rgba(3,8,10,.9)",backdropFilter:"blur(8px)",padding:20
  }}>
    <div style={{
      width:"min(520px,100%)",border:"1px solid rgba(209,170,87,.48)",
      background:"#0a1418",padding:"30px 28px"
    }}>
      <p style={{margin:"0 0 8px",color:"#d1aa57",fontSize:11,fontWeight:900,letterSpacing:1.2,textTransform:"uppercase"}}>
        ENTER THE SPORTS MULTIVERSE
      </p>
      <h2 id="reader-email-title" style={{margin:"0 0 12px",fontFamily:"Impact,'Arial Narrow',sans-serif",fontSize:36,lineHeight:1}}>
        Read Sports Rewritten
      </h2>
      <p style={{margin:"0 0 20px",color:"#aeb7bb",lineHeight:1.6}}>
        Enter your email to continue reading. You only need to do this once on this device.
      </p>
      <form onSubmit={submit} style={{display:"grid",gap:11}}>
        <input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
          style={{width:"100%",padding:"13px 12px",border:"1px solid #35444a",background:"#050c0f",color:"#fff",fontSize:15}}/>
        <label style={{display:"flex",gap:9,alignItems:"flex-start",color:"#9ca7ab",fontSize:11,lineHeight:1.45}}>
          <input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} style={{marginTop:2}}/>
          Send me occasional Sports Rewritten updates and new timeline alerts.
        </label>
        <button disabled={busy} style={{border:0,background:"#b52228",color:"#fff",padding:"13px 16px",fontWeight:900,textTransform:"uppercase",cursor:"pointer"}}>
          {busy?"Opening Article…":"Continue Reading"}
        </button>
      </form>
      {message&&<p style={{color:"#e6b86c",fontSize:12,margin:"12px 0 0"}}>{message}</p>}
      <p style={{margin:"16px 0 0",color:"#738187",fontSize:10,lineHeight:1.5}}>
        We use your email to manage reader access. Marketing messages are optional. See our <Link href="/privacy" style={{color:"#d1aa57"}}>Privacy Policy</Link>.
      </p>
    </div>
  </div>;
}
