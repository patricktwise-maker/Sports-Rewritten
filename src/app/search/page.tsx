import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articleHref, createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Sports Rewritten",
  description: "Search Sports Rewritten alternate sports history timelines.",
  robots: { index:false, follow:true },
};

type Article={
 id:string;
 title:string;
 slug:string;
 subtitle:string|null;
 excerpt:string|null;
 sport:string;
 scenario_type:string;
 estimated_read_time:number|null;
 published_at:string|null;
};

type Tag = { name:string; slug:string };
type TagLink = { article_id:string; tags:Tag|Tag[]|null };

function normalizeTag(value:Tag|Tag[]|null){
 if(Array.isArray(value)) return value[0]??null;
 return value;
}

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=""}=await searchParams;
 const term=q.trim();
 const needle=term.toLowerCase();
 const supabase=createPublicSupabaseClient();

 const [{data:articleData},{data:tagLinkData}]=await Promise.all([
  supabase.from("articles")
   .select("id,title,slug,subtitle,excerpt,sport,scenario_type,estimated_read_time,published_at")
   .eq("status","published")
   .order("published_at",{ascending:false})
   .limit(200),
  supabase.from("article_tags")
   .select("article_id,tags(name,slug)")
 ]);

 const allArticles=(articleData??[]) as Article[];
 const tagsByArticle=new Map<string,Tag[]>();

 for(const row of (tagLinkData??[]) as TagLink[]){
  const tag=normalizeTag(row.tags);
  if(!tag) continue;
  const current=tagsByArticle.get(row.article_id)??[];
  current.push(tag);
  tagsByArticle.set(row.article_id,current);
 }

 const articles=(term
  ? allArticles.filter(article=>{
     const searchable=[
      article.title,
      article.subtitle,
      article.excerpt,
      article.sport,
      article.scenario_type,
      ...(tagsByArticle.get(article.id)??[]).map(tag=>tag.name)
     ].filter(Boolean).join(" ").toLowerCase();
     return searchable.includes(needle);
    })
  : allArticles
 ).slice(0,40);

 return <><Header/><main className="shell" style={{padding:"54px 0 80px"}}><p className="goldKicker">SEARCH THE MULTIVERSE</p><h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 20px"}}>Search</h1>
 <form action="/search" style={{display:"flex",gap:10,maxWidth:760}}><input name="q" defaultValue={term} placeholder="Player, team, sport, scenario, tag…" style={{flex:1,padding:14,background:"#091013",border:"1px solid rgba(255,255,255,.2)",color:"white",font:"inherit"}}/><button className="redButton">Search</button></form>
 <p style={{color:"#9ca7ab",marginTop:18}}>{term?`${articles.length} result${articles.length===1?"":"s"} for “${term}”`:`${articles.length} published timeline${articles.length===1?"":"s"}`}</p>
 <div style={{display:"grid",gap:14,marginTop:24}}>{articles.map(a=>{const tags=tagsByArticle.get(a.id)??[];return <article key={a.id} style={{borderTop:"1px solid rgba(255,255,255,.12)",padding:"22px 0"}}><p className="goldKicker">{a.sport} · {a.scenario_type}</p><h2 style={{margin:"6px 0 8px"}}><Link href={articleHref(a.sport,a.slug)}>{a.title}</Link></h2><p style={{color:"#aeb7bb",lineHeight:1.65,maxWidth:820}}>{a.excerpt||a.subtitle}</p>{tags.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,margin:"12px 0"}}>{tags.map(tag=><Link key={tag.slug} href={`/search?q=${encodeURIComponent(tag.name)}`} style={{fontSize:12,border:"1px solid rgba(209,170,87,.35)",padding:"5px 8px",color:"#d1aa57"}}>{tag.name}</Link>)}</div>}{a.estimated_read_time&&<small>{a.estimated_read_time} min read</small>}</article>})}</div>
 </main><Footer/></>;
}
