"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";

type Summary = {
  founding_limit:number;
  founding_claimed:number;
  founding_reserved:number;
  founding_available_slots:number;
  active_memberships:number;
  reader_accounts:number;
};

type Customer = {
  customer_id:string;
  customer_name:string;
  email:string;
  account_created_at:string;
  plan_code:string|null;
  subscription_status:string|null;
  current_period_end:string|null;
  cancel_at_period_end:boolean|null;
  founding_status:string|null;
  founding_claimed_at:string|null;
};

export default function EditorCustomersPage(){
  const [loading,setLoading]=useState(true);
  const [allowed,setAllowed]=useState(false);
  const [summary,setSummary]=useState<Summary|null>(null);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    void load();
    const {data}=supabase.auth.onAuthStateChange(()=>void load());
    return()=>data.subscription.unsubscribe();
  },[]);

  async function load(){
    setLoading(true);
    setMessage("");

    const {data:{user}}=await supabase.auth.getUser();
    if(!user){
      setAllowed(false);
      setLoading(false);
      return;
    }

    const {data:profile,error:profileError}=await supabase
      .from("profiles")
      .select("can_view_customer_data")
      .eq("id",user.id)
      .maybeSingle();

    if(profileError||!profile?.can_view_customer_data){
      setAllowed(false);
      setLoading(false);
      return;
    }

    const [summaryRes,customersRes]=await Promise.all([
      supabase.rpc("get_private_editor_membership_summary"),
      supabase.rpc("get_private_editor_customers")
    ]);

    if(summaryRes.error||customersRes.error){
      setMessage((summaryRes.error||customersRes.error)?.message||"Unable to load private membership data.");
      setLoading(false);
      return;
    }

    setAllowed(true);
    setSummary(summaryRes.data as Summary);
    setCustomers((customersRes.data??[]) as Customer[]);
    setLoading(false);
  }

  if(loading)return <main className="shell" style={{padding:"54px 0 80px"}}><p>Loading private membership data…</p></main>;

  if(!allowed)return <main className="shell" style={{padding:"54px 0 80px"}}>
    <p className="goldKicker">PRIVATE EDITOR ACCESS</p>
    <h1>Customer information is restricted.</h1>
    <p>{message||"This page is available only to the specifically authorized editorial account."}</p>
    <Link className="outlineButton" href="/admin">Return to Editorial Dashboard</Link>
  </main>;

  return <main className="shell" style={{padding:"54px 0 80px"}}>
    <p className="goldKicker">PRIVATE MEMBERSHIP</p>
    <h1 style={{fontSize:"clamp(42px,7vw,72px)",margin:"8px 0 14px"}}>Customers</h1>
    <p style={{color:"#aeb7bb",maxWidth:760,lineHeight:1.65}}>Private customer records and founding membership availability. This information is not shown on public membership pages.</p>
    <p><Link href="/admin">← Editorial Dashboard</Link></p>

    {message&&<p style={{padding:14,border:"1px solid rgba(255,255,255,.15)"}}>{message}</p>}

    {summary&&<section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,margin:"28px 0"}}>
      <article style={{padding:18,background:"#11181b",border:"1px solid rgba(255,255,255,.12)"}}><strong style={{fontSize:32}}>{summary.founding_available_slots}</strong><p>Founding Slots Available</p></article>
      <article style={{padding:18,background:"#11181b",border:"1px solid rgba(255,255,255,.12)"}}><strong style={{fontSize:32}}>{summary.founding_claimed}</strong><p>Founding Members</p></article>
      <article style={{padding:18,background:"#11181b",border:"1px solid rgba(255,255,255,.12)"}}><strong style={{fontSize:32}}>{summary.founding_reserved}</strong><p>Reserved Slots</p></article>
      <article style={{padding:18,background:"#11181b",border:"1px solid rgba(255,255,255,.12)"}}><strong style={{fontSize:32}}>{summary.active_memberships}</strong><p>Active Memberships</p></article>
      <article style={{padding:18,background:"#11181b",border:"1px solid rgba(255,255,255,.12)"}}><strong style={{fontSize:32}}>{summary.reader_accounts}</strong><p>Reader Accounts</p></article>
    </section>}

    <section style={{display:"grid",gap:12}}>
      {customers.length===0&&<p>No reader customer accounts yet.</p>}
      {customers.map(customer=><article key={customer.customer_id} style={{padding:20,background:"#11181b",border:"1px solid rgba(255,255,255,.12)"}}>
        <p className="goldKicker">{customer.plan_code?customer.plan_code.replace("_"," "):"Reader Account"}</p>
        <h2 style={{margin:"6px 0"}}>{customer.customer_name}</h2>
        <p style={{margin:"4px 0"}}>{customer.email}</p>
        <p style={{color:"#aeb7bb",lineHeight:1.6}}>
          Status: {customer.subscription_status??customer.founding_status??"reader"}
          {" · "}Account created {new Date(customer.account_created_at).toLocaleDateString()}
          {customer.current_period_end?" · Current period ends "+new Date(customer.current_period_end).toLocaleDateString():""}
          {customer.cancel_at_period_end?" · Cancels at period end":""}
        </p>
      </article>)}
    </section>
  </main>;
}
