import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articleHref, createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

type Article={id:string;title:string;slug:string;subtitle:string|null;excerpt:string|null;sport:string;scenario_type:string;estimated_read_time:number|null;published_at:string|null};

export default async function VaultPage(){
 const supabase=createPublicSupabaseClient();
 const {data}=await supabase.from("articles").select("id,title,slug,subtitle,excerpt,sport,scenario_type,estimated_read_time,published_at").eq("status","published").order("published_at",{ascending:false});
 const articles=(data??[]) as Article[];
 return <><Header/><main className="shell" style={{padding:"54px 0 80px"}}><p className="goldKicker">THE VAULT</p><h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 14px"}}>Every Rewritten Timeline</h1><p style={{maxWidth:760,color:"#aeb7bb",lineHeight:1.7}}>The complete Sports Rewritten archive, from era shifts and draft rewrites to careers, dynasties and games that changed everything.</p>
 <div style={{display:"grid",gap:0,marginTop:34,borderTop:"1px solid rgba(255,255,255,.12)"}}>{articles.map((a,i)=><article key={a.id} style={{display:"grid",gridTemplateColumns:"70px minmax(0,1fr)",gap:20,padding:"26px 0",borderBottom:"1px solid rgba(255,255,255,.12)"}}><div style={{fontSize:28,fontWeight:800,color:"#842a2a"}}>{String(i+1).padStart(2,"0")}</div><div><p className="goldKicker">{a.sport} · {a.scenario_type}</p><h2 style={{margin:"6px 0 8px"}}><Link href={articleHref(a.sport,a.slug)}>{a.title}</Link></h2><p style={{color:"#aeb7bb",lineHeight:1.65,maxWidth:860}}>{a.excerpt||a.subtitle}</p><small>{a.estimated_read_time?`${a.estimated_read_time} min read · `:""}{a.published_at?new Date(a.published_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}):""}</small></div></article>)}</div>
 </main><Footer/></>;
}
