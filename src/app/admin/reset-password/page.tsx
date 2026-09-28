"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

export default function AdminResetPasswordPage(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [recoveryReady,setRecoveryReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    void inspect();
    const {data}=supabase.auth.onAuthStateChange((event)=>{
      if(event==="PASSWORD_RECOVERY"||event==="SIGNED_IN") void inspect();
    });
    return()=>data.subscription.unsubscribe();
  },[]);

  async function inspect(){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
      setRecoveryReady(false);
      return;
    }

    const {data:profile}=await supabase
      .from("profiles")
      .select("role,is_active,application_status")
      .eq("id",user.id)
      .maybeSingle();

    setRecoveryReady(Boolean(
      profile?.is_active &&
      profile?.application_status==="approved" &&
      (profile?.role==="admin"||profile?.role==="editor")
    ));
  }

  async function requestReset(e:FormEvent){
    e.preventDefault();
    setBusy(true);
    setMessage("");

    await supabase.auth.resetPasswordForEmail(email,{
      redirectTo:"https://sportsrewritten.com/admin/reset-password"
    });

    setBusy(false);
    setMessage("If that email belongs to a newsroom account, a password-reset link has been sent.");
  }

  async function updatePassword(e:FormEvent){
    e.preventDefault();
    setMessage("");

    if(password.length<12){
      setMessage("Use at least 12 characters for newsroom passwords.");
      return;
    }

    if(password!==confirm){
      setMessage("The new passwords do not match.");
      return;
    }

    setBusy(true);
    const {error}=await supabase.auth.updateUser({password});
    setBusy(false);

    if(error){
      setMessage("Unable to update the password. Request a fresh recovery link and try again.");
      return;
    }

    setPassword("");
    setConfirm("");
    setMessage("Password updated. Sign in again and complete MFA before entering newsroom tools.");
    await supabase.auth.signOut();
    setRecoveryReady(false);
  }

  return <main className="shell" style={{padding:"54px 0 80px",maxWidth:760}}>
    <p className="goldKicker">NEWSROOM SECURITY</p>
    <h1 style={{fontSize:"clamp(42px,7vw,72px)",margin:"8px 0 14px"}}>Reset Staff Password</h1>

    {recoveryReady
      ? <form onSubmit={updatePassword} style={{display:"grid",gap:14,border:"1px solid rgba(255,255,255,.14)",background:"#11181b",padding:24}}>
          <p style={{color:"#aeb7bb",lineHeight:1.65}}>Choose a new newsroom password. Use at least 12 characters and avoid reusing a password from another service.</p>
          <label>New password
            <input type="password" autoComplete="new-password" minLength={12} value={password} onChange={e=>setPassword(e.target.value)} required style={{display:"block",width:"100%",padding:12,marginTop:6,boxSizing:"border-box"}}/>
          </label>
          <label>Confirm new password
            <input type="password" autoComplete="new-password" minLength={12} value={confirm} onChange={e=>setConfirm(e.target.value)} required style={{display:"block",width:"100%",padding:12,marginTop:6,boxSizing:"border-box"}}/>
          </label>
          <button className="redButton" disabled={busy}>{busy?"Updating…":"Update Password"}</button>
        </form>
      : <form onSubmit={requestReset} style={{display:"grid",gap:14,border:"1px solid rgba(255,255,255,.14)",background:"#11181b",padding:24}}>
          <p style={{color:"#aeb7bb",lineHeight:1.65}}>Enter your newsroom email address. The response is intentionally generic so this page does not reveal whether an account exists.</p>
          <label>Email
            <input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required style={{display:"block",width:"100%",padding:12,marginTop:6,boxSizing:"border-box"}}/>
          </label>
          <button className="goldButton" disabled={busy}>{busy?"Sending…":"Send Password Reset Link"}</button>
        </form>}

    {message&&<p style={{marginTop:18,padding:12,border:"1px solid rgba(255,255,255,.14)"}}>{message}</p>}
    <p style={{marginTop:24}}><Link href="/admin">← Editorial Dashboard</Link></p>
  </main>;
}
