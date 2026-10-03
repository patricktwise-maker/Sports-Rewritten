"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

const UNLOCK_KEY = "sports-rewritten-reader-unlocked";
const EMAIL_KEY = "sports-rewritten-reader-email";

export function ArticleEmailGate({
  articleId,
  articleTitle,
  children,
}: {
  articleId: string;
  articleTitle: string;
  children: ReactNode;
}) {
  const [ready,setReady]=useState(false);
  const [unlocked,setUnlocked]=useState(false);
  const [email,setEmail]=useState("");
  const [marketingConsent,setMarketingConsent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    let active=true;

    async function checkAccess(){
      const {data:{user}}=await supabase.auth.getUser();
      if(!active)return;

      if(user){
        setUnlocked(true);
        setReady(true);
        return;
      }

      setUnlocked(localStorage.getItem(UNLOCK_KEY)==="true");
      setEmail(localStorage.getItem(EMAIL_KEY)??"");
      setReady(true);
    }

    void checkAccess();
    return()=>{active=false};
  },[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try{
      const response=await fetch("/api/reader-email",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          email,
          articleId,
          articleTitle,
          path:window.location.pathname,
          marketingConsent
        })
      });

      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||"Unable to continue.");

      localStorage.setItem(UNLOCK_KEY,"true");
      localStorage.setItem(EMAIL_KEY,email.trim().toLowerCase());
      setUnlocked(true);
    }catch(error){
      setMessage(error instanceof Error?error.message:"Unable to continue.");
    }finally{
      setBusy(false);
    }
  }

  if(!ready)return null;
  if(unlocked)return <>{children}</>;

  return <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="reader-email-title"
    style={{
      position:"fixed",
      inset:0,
      zIndex:9999,
      display:"grid",
      placeItems:"center",
      background:"rgba(3,8,10,.91)",
      backdropFilter:"blur(8px)",
      padding:20
    }}
  >
    <div style={{
      width:"min(540px,100%)",
      border:"1px solid rgba(209,170,87,.48)",
      background:"#0a1418",
      boxShadow:"0 30px 90px rgba(0,0,0,.58)",
      padding:"32px 28px"
    }}>
      <p style={{margin:"0 0 8px",color:"#d1aa57",fontSize:11,fontWeight:900,letterSpacing:1.2,textTransform:"uppercase"}}>
        ENTER THE SPORTS MULTIVERSE
      </p>
      <h2 id="reader-email-title" style={{margin:"0 0 12px",fontFamily:"Impact,'Arial Narrow',sans-serif",fontSize:38,lineHeight:1}}>
        Unlock This Article
      </h2>
      <p style={{margin:"0 0 8px",color:"#d9e0e2",fontWeight:700,lineHeight:1.5}}>
        {articleTitle}
      </p>
      <p style={{margin:"0 0 20px",color:"#aeb7bb",lineHeight:1.6}}>
        Enter your email to read free Sports Rewritten articles and the free preview of premium timelines. You only need to do this once on this device.
      </p>

      <form onSubmit={submit} style={{display:"grid",gap:12}}>
        <label style={{fontSize:10,fontWeight:900,letterSpacing:.7,textTransform:"uppercase",color:"#d7dee0"}}>
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              display:"block",
              boxSizing:"border-box",
              width:"100%",
              marginTop:7,
              padding:"13px 12px",
              border:"1px solid #35444a",
              background:"#050c0f",
              color:"#fff",
              fontSize:15
            }}
          />
        </label>

        <label style={{display:"flex",gap:9,alignItems:"flex-start",color:"#9ca7ab",fontSize:11,lineHeight:1.45}}>
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={e=>setMarketingConsent(e.target.checked)}
            style={{marginTop:2}}
          />
          Send me occasional Sports Rewritten updates and new timeline alerts.
        </label>

        <button
          disabled={busy}
          style={{
            border:0,
            background:"#b52228",
            color:"#fff",
            padding:"13px 16px",
            fontWeight:900,
            textTransform:"uppercase",
            letterSpacing:.7,
            cursor:"pointer"
          }}
        >
          {busy?"Opening Article…":"Continue Reading"}
        </button>
      </form>

      {message&&<p style={{color:"#e6b86c",fontSize:12,margin:"12px 0 0"}}>{message}</p>}

      <p style={{margin:"16px 0 0",color:"#738187",fontSize:10,lineHeight:1.55}}>
        Your email is used to manage reader access. Marketing messages are optional. See our <Link href="/privacy" style={{color:"#d1aa57"}}>Privacy Policy</Link>.
      </p>
    </div>
  </div>;
}
