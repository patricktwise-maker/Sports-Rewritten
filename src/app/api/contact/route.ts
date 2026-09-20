import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const validTopics = new Set(["general","membership","contributor","editorial","technical"]);

function clean(value:unknown,max:number) {
  return typeof value === "string" ? value.trim().slice(0,max) : "";
}

export async function POST(request:Request) {
  try {
    const body = await request.json();
    const name = clean(body.name,100);
    const email = clean(body.email,320).toLowerCase();
    const topic = clean(body.topic,40);
    const subject = clean(body.subject,160);
    const message = clean(body.message,5000);
    const website = clean(body.website,200);
    const startedAt = Number(body.startedAt || 0);

    if (website) return NextResponse.json({ok:true});
    if (!startedAt || Date.now() - startedAt < 2500) {
      return NextResponse.json({error:"Please wait a moment and try again."},{status:429});
    }
    if (name.length < 2 || subject.length < 2 || message.length < 10 || !validTopics.has(topic)) {
      return NextResponse.json({error:"Please complete all required fields."},{status:400});
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({error:"Enter a valid email address."},{status:400});
    }

    const resendKey = process.env.RESEND_API_KEY;
    const supportEmail = process.env.SUPPORT_EMAIL;
    if (!resendKey || !supportEmail) {
      return NextResponse.json({error:"Contact email is temporarily unavailable."},{status:503});
    }

    const supabase = createServerSupabaseClient();
    const since = new Date(Date.now() - 10*60*1000).toISOString();
    const { count } = await supabase
      .from("contact_submissions")
      .select("id",{count:"exact",head:true})
      .eq("email",email)
      .gte("created_at",since);

    if ((count ?? 0) >= 3) {
      return NextResponse.json({error:"Too many messages were sent recently. Please try again later."},{status:429});
    }

    const { data:submission,error:insertError } = await supabase
      .from("contact_submissions")
      .insert({name,email,topic,subject,message})
      .select("id")
      .single();

    if (insertError || !submission) throw insertError || new Error("Unable to save contact message.");

    const topicLabel:Record<string,string> = {
      general:"General",
      membership:"Membership/Billing",
      contributor:"Contributor",
      editorial:"Editorial",
      technical:"Technical",
    };

    const resendResponse = await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{
        Authorization:`Bearer ${resendKey}`,
        "Content-Type":"application/json",
      },
      body:JSON.stringify({
        from:"Sports Rewritten <no-reply@sportsrewritten.com>",
        to:[supportEmail],
        reply_to:email,
        subject:`[Sports Rewritten ${topicLabel[topic]}] ${subject}`,
        text:[
          `Name: ${name}`,
          `Email: ${email}`,
          `Topic: ${topicLabel[topic]}`,
          "",
          message,
        ].join("\n"),
      }),
    });

    if (!resendResponse.ok) {
      await supabase.from("contact_submissions").update({delivery_status:"failed"}).eq("id",submission.id);
      console.error("Resend contact delivery failed",resendResponse.status,await resendResponse.text());
      return NextResponse.json({error:"Your message was saved, but email delivery failed. Please try again later."},{status:502});
    }

    await supabase.from("contact_submissions").update({delivery_status:"sent"}).eq("id",submission.id);
    return NextResponse.json({ok:true});
  } catch (error) {
    console.error("Contact form error",error);
    return NextResponse.json({error:"Unable to send your message right now."},{status:500});
  }
}
