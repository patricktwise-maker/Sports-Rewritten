"use client";

import { FormEvent, useState } from "react";

const topics = [
  ["general","General question"],
  ["membership","Membership or billing"],
  ["contributor","Contributor question"],
  ["editorial","Editorial correction or feedback"],
  ["technical","Technical issue"],
] as const;

export function ContactForm() {
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [ok,setOk]=useState(false);
  const [startedAt]=useState(()=>Date.now());

  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setOk(false);

    const form = new FormData(e.currentTarget);
    const payload = {
      name:String(form.get("name")||""),
      email:String(form.get("email")||""),
      topic:String(form.get("topic")||"general"),
      subject:String(form.get("subject")||""),
      message:String(form.get("message")||""),
      website:String(form.get("website")||""),
      startedAt,
    };

    try {
      const response = await fetch("/api/contact", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send your message.");
      setOk(true);
      setMessage("Message sent. Sports Rewritten will receive it by email.");
      e.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send your message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{display:"grid",gap:14,marginTop:28,border:"1px solid rgba(255,255,255,.14)",background:"#11181b",padding:24}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
        <label>Name<input name="name" required minLength={2} maxLength={100} style={inputStyle}/></label>
        <label>Email<input name="email" type="email" required maxLength={320} style={inputStyle}/></label>
      </div>
      <label>Topic
        <select name="topic" defaultValue="general" style={inputStyle}>
          {topics.map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>Subject<input name="subject" required minLength={2} maxLength={160} style={inputStyle}/></label>
      <label>Message<textarea name="message" required minLength={10} maxLength={5000} rows={7} style={{...inputStyle,resize:"vertical"}}/></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}} />
      <div>
        <button className="redButton" type="submit" disabled={busy}>{busy?"Sending…":"Send Message"}</button>
      </div>
      {message && <p role="status" style={{margin:0,color:ok?"#d8e7d8":"#f3b0b3"}}>{message}</p>}
      <p style={{margin:0,color:"#8f9a9e",fontSize:12,lineHeight:1.5}}>Your email address is used to reply to this message. Do not include passwords, full payment-card numbers, or other sensitive information.</p>
    </form>
  );
}

const inputStyle = {
  display:"block",
  width:"100%",
  marginTop:7,
  padding:12,
  border:"1px solid #39474d",
  borderRadius:5,
  background:"#071014",
  color:"#f3efe7",
  font:"inherit",
} as const;
