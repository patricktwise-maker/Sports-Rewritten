"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type PlanCode = "founding" | "all_access" | "annual";

export function CheckoutButton({ plan }:{ plan:PlanCode }) {
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function startCheckout(){
    setBusy(true); setMessage("");
    const { data:{ session } } = await supabase.auth.getSession();
    if(!session?.access_token){
      setMessage("Create or sign in to your reader account below first.");
      setBusy(false);
      return;
    }
    try{
      const response=await fetch("/api/stripe/checkout",{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
        body:JSON.stringify({plan}),
      });
      const data=await response.json();
      if(!response.ok||!data.url) throw new Error(data.error||"Unable to start checkout.");
      window.location.href=data.url;
    }catch(error){
      setMessage(error instanceof Error?error.message:"Unable to start checkout.");
      setBusy(false);
    }
  }

  return <div><button className="goldButton" type="button" onClick={()=>void startCheckout()} disabled={busy}>{busy?"Opening secure checkout…":"Choose plan"}</button>{message&&<p style={{fontSize:13,color:"#c9b46f",lineHeight:1.45}}>{message}</p>}</div>;
}
