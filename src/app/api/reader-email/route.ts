import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function validEmail(value:string){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 320;
}

export async function POST(req:NextRequest){
  try{
    const body=await req.json();
    const email=String(body?.email??"").trim().toLowerCase();
    const articleId=body?.articleId?String(body.articleId):null;
    const path=body?.path?String(body.path).slice(0,500):null;
    const marketingConsent=Boolean(body?.marketingConsent);

    if(!validEmail(email)){
      return NextResponse.json({error:"Please enter a valid email address."},{status:400});
    }

    const supabase=createServerSupabaseClient();
    const {data:existing,error:lookupError}=await supabase
      .from("reader_email_leads")
      .select("id,marketing_consent")
      .eq("email",email)
      .maybeSingle();

    if(lookupError)throw lookupError;

    if(existing?.id){
      const {error}=await supabase
        .from("reader_email_leads")
        .update({
          last_seen_at:new Date().toISOString(),
          marketing_consent:Boolean(existing.marketing_consent)||marketingConsent,
          google_sheet_synced_at:null
        })
        .eq("id",existing.id);
      if(error)throw error;
    }else{
      const {error}=await supabase
        .from("reader_email_leads")
        .insert({
          email,
          first_article_id:articleId,
          first_path:path,
          marketing_consent:marketingConsent,
          google_sheet_synced_at:null
        });
      if(error)throw error;
    }

    return NextResponse.json({ok:true});
  }catch{
    return NextResponse.json({error:"We could not save your email. Please try again."},{status:500});
  }
}
