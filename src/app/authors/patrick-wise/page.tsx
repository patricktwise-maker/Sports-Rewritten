import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articleHref, createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patrick Wise | Sports Rewritten",
  description: "Articles by Patrick Wise, author and editor at Sports Rewritten.",
  alternates: { canonical: "https://sportsrewritten.com/authors/patrick-wise" },
  openGraph: {
    title: "Patrick Wise | Sports Rewritten",
    description: "Research-driven alternate sports histories by Patrick Wise.",
    url: "https://sportsrewritten.com/authors/patrick-wise",
    type: "profile",
  },
};

type Article = {
  id:string;
  title:string;
  slug:string;
  sport:string;
  scenario_type:string;
  excerpt:string|null;
  estimated_read_time:number|null;
  published_at:string|null;
};

export default async function PatrickWiseAuthorPage(){
  const supabase=createPublicSupabaseClient();
  const {data}=await supabase
    .from("articles")
    .select("id,title,slug,sport,scenario_type,excerpt,estimated_read_time,published_at")
    .eq("status","published")
    .eq("author_name","Patrick Wise")
    .order("published_at",{ascending:false});

  const articles=(data??[]) as Article[];
  const personJsonLd={
    "@context":"https://schema.org",
    "@type":"Person",
    "@id":"https://sportsrewritten.com/authors/patrick-wise#person",
    name:"Patrick Wise",
    url:"https://sportsrewritten.com/authors/patrick-wise",
    jobTitle:"Author and Editor",
    worksFor:{"@id":"https://sportsrewritten.com/#organization"}
  };

  return <>
    <Header/>
    <main className="shell" style={{maxWidth:960,padding:"56px 0 80px"}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(personJsonLd)}}/>
      <p className="goldKicker">SPORTS REWRITTEN AUTHOR</p>
      <h1 style={{fontSize:"clamp(44px,8vw,76px)",lineHeight:.96,margin:"10px 0 24px"}}>Patrick Wise</h1>
      <p style={{fontSize:20,lineHeight:1.7,color:"#c9d0d3",maxWidth:820}}>
        Patrick Wise writes and edits long-form Sports Rewritten features built around historical research, plausible divergence, roster and transaction logic, and the downstream consequences of one changed sports decision.
      </p>
      <p style={{lineHeight:1.8,color:"#b6c0c4",maxWidth:820}}>
        The editorial method is research first, divergence second, simulation third, storytelling last. Each feature is designed to read as a serious sports magazine story while remaining transparent about the fact that the outcome is hypothetical.
      </p>

      <section style={{marginTop:42}}>
        <p className="goldKicker">PUBLISHED TIMELINES</p>
        <div style={{display:"grid",gap:0,borderTop:"1px solid rgba(255,255,255,.12)"}}>
          {articles.map(article=><article key={article.id} style={{padding:"24px 0",borderBottom:"1px solid rgba(255,255,255,.12)"}}>
            <p className="goldKicker">{article.sport} · {article.scenario_type}</p>
            <h2 style={{margin:"6px 0 8px"}}><Link href={articleHref(article.sport,article.slug)}>{article.title}</Link></h2>
            {article.excerpt&&<p style={{color:"#aeb7bb",lineHeight:1.65,maxWidth:840}}>{article.excerpt}</p>}
            <small>{article.estimated_read_time?article.estimated_read_time+" min read":""}{article.published_at?" · "+new Date(article.published_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}):""}</small>
          </article>)}
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}
