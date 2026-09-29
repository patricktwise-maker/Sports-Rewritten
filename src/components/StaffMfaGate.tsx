"use client";

import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

export function StaffMfaGate({children}:{children:ReactNode}){
  const [staffSession,setStaffSession]=useState(false);

  useEffect(()=>{
    void sync();
    const {data}=supabase.auth.onAuthStateChange(()=>void sync());
    return()=>data.subscription.unsubscribe();
  },[]);

  async function sync(){
    const {data:{user}}=await supabase.auth.getUser();

    if(!user){
      setStaffSession(false);
      return;
    }

    const {data:profile}=await supabase
      .from("profiles")
      .select("role,is_active,application_status")
      .eq("id",user.id)
      .maybeSingle();

    setStaffSession(Boolean(
      profile?.is_active &&
      profile?.application_status==="approved" &&
      (profile?.role==="admin" || profile?.role==="editor")
    ));
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

  return <>{children}</>;
}
