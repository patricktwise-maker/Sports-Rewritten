"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type Stage = "checking" | "signedout" | "denied" | "ready" | "enrolling" | "challenge" | "complete";
type TotpFactor = { id:string; friendly_name?:string|null; status:string };

export default function NewsroomMfaPage(){
  const [stage,setStage]=useState<Stage>("checking");
  const [factorId,setFactorId]=useState("");
  const [qr,setQr]=useState("");
  const [secret,setSecret]=useState("");
  const [code,setCode]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [name,setName]=useState("Newsroom staff");
  const [factors,setFactors]=useState<TotpFactor[]>([]);
  const [enrollmentName,setEnrollmentName]=useState("Sports Rewritten Newsroom");

  const codeClean=useMemo(()=>code.replace(/\s+/g,""),[code]);

  useEffect(()=>{void inspect();},[]);

  async function inspect(){
    setStage("checking");
    setMessage("");

    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
      setStage("signedout");
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
      setStage("denied");
      return;
    }

    setName(profile?.display_name||"Newsroom staff");

    const {data:aal}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const {data:factors,error}=await supabase.auth.mfa.listFactors();
    if(error){
      setMessage(error.message);
      setStage("ready");
      return;
    }

    const verifiedFactors=(factors?.totp??[]).filter(factor=>factor.status==="verified") as TotpFactor[];
    setFactors(verifiedFactors);

    if(aal?.currentLevel==="aal2"){
      setStage("complete");
      return;
    }

    const verified=verifiedFactors[0];
    if(verified){
      setFactorId(verified.id);
      setStage("challenge");
    }else{
      setStage("ready");
    }
  }

  async function startEnrollment(friendlyName="Sports Rewritten Newsroom"){
    setBusy(true);
    setEnrollmentName(friendlyName);
    setMessage("");
    const {data,error}=await supabase.auth.mfa.enroll({
      factorType:"totp",
      friendlyName
    });
    setBusy(false);

    if(error){
      setMessage(error.message);
      return;
    }

    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStage("enrolling");
  }

  async function verify(){
    if(!factorId || codeClean.length<6){
      setMessage("Enter the current six-digit code from your authenticator app.");
      return;
    }

    setBusy(true);
    setMessage("");

    const challenge=await supabase.auth.mfa.challenge({factorId});
    if(challenge.error){
      setBusy(false);
      setMessage(challenge.error.message);
      return;
    }

    const verifyResult=await supabase.auth.mfa.verify({
      factorId,
      challengeId:challenge.data.id,
      code:codeClean
    });

    setBusy(false);

    if(verifyResult.error){
      setMessage(verifyResult.error.message);
      return;
    }

    setCode("");
    setStage("complete");
    setMessage("MFA verified. Your newsroom session is now protected at AAL2.");
    const {data:freshFactors}=await supabase.auth.mfa.listFactors();
    setFactors(((freshFactors?.totp??[]).filter(factor=>factor.status==="verified")) as TotpFactor[]);
  }


  async function removeFactor(target:TotpFactor){
    if(factors.length<=1){
      setMessage("Keep at least one verified authenticator on every newsroom staff account.");
      return;
    }

    if(!window.confirm(`Remove ${target.friendly_name||"this authenticator"} from your newsroom account?`)) return;

    setBusy(true);
    setMessage("");
    const {error}=await supabase.auth.mfa.unenroll({factorId:target.id});
    setBusy(false);

    if(error){
      setMessage(error.message);
      return;
    }

    const remaining=factors.filter(factor=>factor.id!==target.id);
    setFactors(remaining);
    setMessage("Authenticator removed. Your other verified factor remains active.");
  }

  if(stage==="checking")return <main className="shell" style={{padding:"54px 0 80px"}}><p>Checking newsroom security…</p></main>;

  if(stage==="signedout")return <main className="shell" style={{padding:"54px 0 80px"}}>
    <p className="goldKicker">NEWSROOM SECURITY</p>
    <h1>Sign in first</h1>
    <p>Use the Editorial Dashboard to sign in with your newsroom account, then return here to complete MFA.</p>
    <Link className="goldButton" href="/admin">Go to Editorial Dashboard</Link>
  </main>;

  if(stage==="denied")return <main className="shell" style={{padding:"54px 0 80px"}}>
    <p className="goldKicker">NEWSROOM SECURITY</p>
    <h1>Staff access required</h1>
    <p>This MFA setup page is reserved for active Sports Rewritten administrators and editors.</p>
    <Link className="outlineButton" href="/">Return Home</Link>
  </main>;

  if(stage==="complete")return <main className="shell" style={{padding:"54px 0 80px"}}>
    <p className="goldKicker">NEWSROOM SECURITY</p>
    <h1>MFA verified</h1>
    <p>{message||"This session has completed multi-factor authentication."}</p>
    <p style={{color:"#aeb7bb",maxWidth:760,lineHeight:1.65}}>
      Supabase does not issue recovery codes for TOTP. Keep a second verified authenticator on a different device as your backup.
    </p>

    <section style={{display:"grid",gap:12,maxWidth:760,margin:"24px 0"}}>
      {factors.map((factor,index)=><article key={factor.id} style={{border:"1px solid rgba(255,255,255,.14)",background:"#11181b",padding:18}}>
        <p className="goldKicker">{index===0?"AUTHENTICATOR":"BACKUP AUTHENTICATOR"}</p>
        <h3 style={{margin:"6px 0"}}>{factor.friendly_name||`Authenticator ${index+1}`}</h3>
        <p style={{color:"#aeb7bb"}}>Status: {factor.status}</p>
        {factors.length>1&&<button className="outlineButton" type="button" disabled={busy} onClick={()=>void removeFactor(factor)}>Remove Authenticator</button>}
      </article>)}
    </section>

    {factors.length<2&&<button className="goldButton" type="button" disabled={busy} onClick={()=>void startEnrollment("Sports Rewritten Newsroom Backup")}>
      {busy?"Starting setup…":"Add Backup Authenticator"}
    </button>}

    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:20}}>
      <Link className="goldButton" href="/admin">Continue to Editorial Dashboard</Link>
      <Link className="outlineButton" href="/admin/customers">Private Customers</Link>
    </div>
  </main>;

  return <main className="shell" style={{padding:"54px 0 80px"}}>
    <p className="goldKicker">NEWSROOM SECURITY</p>
    <h1 style={{fontSize:"clamp(42px,7vw,72px)",margin:"8px 0 14px"}}>Secure Your Staff Account</h1>
    <p style={{color:"#aeb7bb",maxWidth:760,lineHeight:1.65}}>
      {name}, Sports Rewritten requires time-based one-time-password MFA for newsroom staff.
    </p>

    {stage==="ready"&&<section style={{border:"1px solid rgba(209,170,87,.38)",background:"#11181b",padding:24,maxWidth:720,marginTop:24}}>
      <h2>Step 1: Add an authenticator</h2>
      <p style={{color:"#aeb7bb",lineHeight:1.65}}>
        Use Google Authenticator, Microsoft Authenticator, Authy, 1Password, Apple Passwords, or another TOTP-compatible app.
      </p>
      <button className="goldButton" type="button" disabled={busy} onClick={()=>void startEnrollment()}>
        {busy?"Starting setup…":"Generate Authenticator QR Code"}
      </button>
    </section>}

    {stage==="enrolling"&&<section style={{border:"1px solid rgba(209,170,87,.38)",background:"#11181b",padding:24,maxWidth:720,marginTop:24}}>
      <h2>Step 2: Add the setup key to your authenticator</h2><p className="goldKicker">{enrollmentName}</p>
      <p style={{color:"#aeb7bb",lineHeight:1.65}}>In your authenticator app, choose the option to enter a setup key or secret manually. Use the key below. A QR code is available only as an optional alternative.</p>
      {secret&&<div style={{margin:"18px 0",padding:16,border:"1px solid rgba(209,170,87,.38)",background:"#091013"}}><p style={{margin:"0 0 8px"}}><strong>Manual setup key</strong></p><code style={{display:"block",fontSize:18,wordBreak:"break-all",marginBottom:12}}>{secret}</code><button className="outlineButton" type="button" onClick={()=>void navigator.clipboard.writeText(secret)}>Copy Setup Key</button></div>}
      {qr&&<details style={{margin:"14px 0"}}><summary>Optional: show QR code instead</summary><img src={qr} alt="Sports Rewritten MFA QR code" style={{display:"block",width:220,maxWidth:"100%",background:"white",padding:12,margin:"18px 0"}}/></details>}
      <label style={{display:"grid",gap:6,maxWidth:320}}>Authenticator code
        <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value)} maxLength={8} style={{padding:12,fontSize:18}}/>
      </label>
      <button className="goldButton" style={{marginTop:14}} type="button" disabled={busy} onClick={()=>void verify()}>
        {busy?"Verifying…":"Enable MFA"}
      </button>
    </section>}

    {stage==="challenge"&&<section style={{border:"1px solid rgba(209,170,87,.38)",background:"#11181b",padding:24,maxWidth:720,marginTop:24}}>
      <h2>Verify your authenticator</h2>
      <p style={{color:"#aeb7bb",lineHeight:1.65}}>Enter the current six-digit code from your authenticator app to unlock newsroom tools for this session.</p>
      <label style={{display:"grid",gap:6,maxWidth:320}}>Authenticator code
        <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value)} maxLength={8} style={{padding:12,fontSize:18}}/>
      </label>
      <button className="goldButton" style={{marginTop:14}} type="button" disabled={busy} onClick={()=>void verify()}>
        {busy?"Verifying…":"Verify and Continue"}
      </button>
    </section>}

    {message&&<p style={{marginTop:18,padding:12,border:"1px solid rgba(255,255,255,.14)"}}>{message}</p>}
    <p style={{marginTop:24}}><Link href="/admin">← Editorial Dashboard</Link></p>
  </main>;
}
