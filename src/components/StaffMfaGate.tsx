"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type GateState = "checking" | "pass" | "enroll" | "challenge";

export function StaffMfaGate({children}:{children:ReactNode}){
  const [state,setState]=useState<GateState>("checking");
  const [staffName,setStaffName]=useState("Newsroom staff");
  const [staffSession,setStaffSession]=useState(false);

  useEffect(()=>{
    void sync();
    const {data}=supabase.auth.onAuthStateChange(()=>void sync());
    return()=>data.subscription.unsubscribe();
  },[]);

  async function sync(){
    setState("checking");
    const {data:{user}}=await supabase.auth.getUser();

    if(!user){
      setState("pass");
      return;
    }

    const {data:profile}=await supabase
      .from("profiles")
      .select("display_name,role,is_active,application_status")
      .eq("id",user.id)
      .maybeSingle();

    const isStaff=Boolean(
      profile?.is_active &&
      profile?.application_status==="approved" &&
      (profile?.role==="admin" || profile?.role==="editor")
    );

    if(!isStaff){
      setStaffSession(false);
      setState("pass");
      return;
    }

    setStaffSession(true);
    setStaffName(profile?.display_name||"Newsroom staff");

    const {data:aal,error:aalError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if(aalError){
      setState("enroll");
      return;
    }

    if(aal.currentLevel==="aal2"){
      setState("pass");
      return;
    }

    const {data:factors}=await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp=Boolean(factors?.totp?.some(factor=>factor.status==="verified"));
    setState(hasVerifiedTotp?"challenge":"enroll");
  }


  useEffect(()=>{
    if(!staffSession)return;

    const key="sports-rewritten-staff-last-activity";
    const timeoutMs=30*60*1000;
    let lastWrite=0;

    const markActivity=()=>{
      const now=Date.now();
      if(now-lastWrite<15000)return;
      lastWrite=now;
      localStorage.setItem(key,String(now));
    };

    const checkIdle=async()=>{
      const last=Number(localStorage.getItem(key)||Date.now());
      if(Date.now()-last>timeoutMs){
        localStorage.removeItem(key);
        await supabase.auth.signOut();
        location.href="/admin";
      }
    };

    if(!localStorage.getItem(key))localStorage.setItem(key,String(Date.now()));

    const events=["pointerdown","keydown","scroll","touchstart"];
    events.forEach(event=>window.addEventListener(event,markActivity,{passive:true}));
    const interval=window.setInterval(()=>void checkIdle(),60000);

    void checkIdle();

    return()=>{
      events.forEach(event=>window.removeEventListener(event,markActivity));
      window.clearInterval(interval);
    };
  },[staffSession]);

  if(state==="checking"){
    return <section className="shell" style={{padding:"28px 0 60px"}}>
      <div style={{border:"1px solid rgba(255,255,255,.14)",background:"#11181b",padding:24}}>
        Checking newsroom security…
      </div>
    </section>;
  }

  if(state==="pass") return <>{children}</>;

  return <section className="shell" style={{padding:"28px 0 60px"}}>
    <div style={{border:"1px solid rgba(209,170,87,.38)",background:"#11181b",padding:26,maxWidth:720}}>
      <p className="goldKicker">NEWSROOM SECURITY</p>
      <h2 style={{fontSize:34,margin:"8px 0 12px"}}>Multi-factor authentication required</h2>
      <p style={{color:"#aeb7bb",lineHeight:1.65}}>
        {staffName}, staff accounts require an authenticator code before editorial tools or private customer information can be accessed.
      </p>
      <p style={{color:"#aeb7bb",lineHeight:1.65}}>
        {state==="enroll"
          ?"Set up an authenticator app such as Google Authenticator, Microsoft Authenticator, Authy, 1Password, or Apple Passwords."
          :"Your authenticator is already enrolled. Verify the current six-digit code to continue."}
      </p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:18}}>
        <Link className="goldButton" href="/admin/mfa">{state==="enroll"?"Set Up MFA":"Verify MFA Code"}</Link>
        <button className="outlineButton" type="button" onClick={()=>supabase.auth.signOut()}>Sign Out</button>
      </div>
    </div>
  </section>;
}
