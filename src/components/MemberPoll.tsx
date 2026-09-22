"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type PollOption = { id:string; label:string; display_order:number; votes:number };
type PollData = {
  id:string;
  question:string;
  options:PollOption[];
  total_votes:number;
  can_vote:boolean;
  has_voted:boolean;
  selected_option_id:string|null;
};

export function MemberPoll() {
  const [poll,setPoll]=useState<PollData|null>(null);
  const [selected,setSelected]=useState<string>("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    void load();
    const { data }=supabase.auth.onAuthStateChange(()=>void load());
    return ()=>data.subscription.unsubscribe();
  },[]);

  async function load(){
    const { data,error }=await supabase.rpc("get_active_poll");
    if(error){ setMessage("Voting is temporarily unavailable."); return; }
    const next=(data ?? null) as PollData|null;
    setPoll(next);
    setSelected(next?.selected_option_id ?? "");
  }

  async function vote(){
    if(!poll||!selected)return;
    setBusy(true);setMessage("");
    const { data:{ session } }=await supabase.auth.getSession();
    if(!session){
      setMessage("Sign in to your reader account before voting.");
      setBusy(false);
      return;
    }
    const { data,error }=await supabase.rpc("cast_poll_vote",{target_option_id:selected});
    setBusy(false);
    if(error){
      setMessage(error.message.includes("active Sports Rewritten membership") ? "An active membership is required to vote." : error.message);
      return;
    }
    setPoll(data as PollData);
    setMessage("Vote recorded.");
  }

  if(!poll) return <div className="panel pollPanel"><p className="goldKicker">THE NEXT TIMELINE</p><h2>Member voting opens soon.</h2></div>;

  const showResults=poll.has_voted;
  return <div className="panel pollPanel">
    <p className="goldKicker">MEMBER VOTE</p>
    <h2>{poll.question}</h2>
    {poll.options.map(option=>{
      const percent=poll.total_votes>0?Math.round((option.votes/poll.total_votes)*100):0;
      return <label className="pollOption" key={option.id}>
        <input
          type="radio"
          name="member-poll"
          value={option.id}
          checked={selected===option.id}
          onChange={()=>setSelected(option.id)}
          disabled={poll.has_voted||busy}
        />
        <span style={{flex:1}}>{option.label}</span>
        {showResults&&<strong>{percent}%</strong>}
      </label>
    })}
    {!poll.has_voted&&<button className="redButton full" type="button" onClick={()=>void vote()} disabled={busy||!selected}>{busy?"Recording…":"Vote Now"}</button>}
    {poll.has_voted&&<p style={{fontSize:12,color:"#d9b36a",lineHeight:1.5}}>Your vote is locked in. {poll.total_votes} vote{poll.total_votes===1?"":"s"} cast.</p>}
    {!poll.can_vote&&!poll.has_voted&&<p style={{fontSize:12,color:"#aeb7bb",lineHeight:1.5}}>Voting is a member benefit. <Link href="/membership" style={{color:"#d9b36a"}}>Join Sports Rewritten</Link>.</p>}
    {message&&<p style={{fontSize:12,color:"#d9b36a",lineHeight:1.5}}>{message}</p>}
  </div>;
}
