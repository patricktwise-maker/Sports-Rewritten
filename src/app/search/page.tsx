import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articleHref, createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

type Article={id:string;title:string;slug:string;subtitle:string|null;excerpt:string|null;sport:string;scenario_type:string;estimated_read_time:number|null};

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=""}=await searchParams; const term=q.trim(); const supabase=createPublicSupabaseClient();
 let query=supabase.from("articles").select("id,title,slug,subtitle,excerpt,sport,scenario_type,estimated_read_time").eq("status","published").order("published_at",{ascending:false});
 if(term) query=query.or(`title.ilike.%${term}%,subtitle.ilike.%${term}%,excerpt.ilike.%${term}%,sport.ilike.%${term}%,scenario_type.ilike.%${term}%`);
 const {data}=await query.limit(40); const articles=(data??[]) as Article[];
 return <><Header/><main className="shell" style={{padding:"54px 0 80px"}}><p className="goldKicker">SEARCH THE MULTIVERSE</p><h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 20px"}}>Search</h1>
 <form action="/search" style={{display:"flex",gap:10,maxWidth:760}}><input name="q" defaultValue={term} placeholder="Player, team, sport, scenario…" style={{flex:1,padding:14,background:"#091013",border:"1px solid rgba(255,255,255,.2)",color:"white",font:"inherit"}}/><button className="redButton">Search</button></form>
 <p style={{color:"#9ca7ab",marginTop:18}}>{term?`${articles.length} result${articles.length===1?"":"s"} for “${term}”`:`${articles.length} published timeline${articles.length===1?"":"s"}`}</p>
 <div style={{display:"grid",gap:14,marginTop:24}}>{articles.map(a=><article key={a.id} style={{borderTop:"1px solid rgba(255,255,255,.12)",padding:"22px 0"}}><p className="goldKicker">{a.sport} · {a.scenario_type}</p><h2 style={{margin:"6px 0 8px"}}><Link href={articleHref(a.sport,a.slug)}>{a.title}</Link></h2><p style={{color:"#aeb7bb",lineHeight:1.65,maxWidth:820}}>{a.excerpt||a.subtitle}</p>{a.estimated_read_time&&<small>{a.estimated_read_time} min read</small>}</article>)}</div>
 </main><Footer/></>;
}
