import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { sports } from "@/lib/content";
import { articleHref, createPublicSupabaseClient, sportSlug } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

type Article = { id:string; title:string; slug:string; subtitle:string|null; excerpt:string|null; sport:string; scenario_type:string; hero_image_url:string|null; estimated_read_time:number|null; published_at:string|null };

export default async function SportArchivePage({params}:{params:Promise<{sport:string}>}) {
  const {sport:slug}=await params;
  const sport=sports.find(s=>sportSlug(s)===slug);
  if(!sport) notFound();
  const supabase=createPublicSupabaseClient();
  const {data}=await supabase.from("articles").select("id,title,slug,subtitle,excerpt,sport,scenario_type,hero_image_url,estimated_read_time,published_at").eq("status","published").eq("sport",sport).order("published_at",{ascending:false});
  const articles=(data??[]) as Article[];
  return <><Header/><main className="shell" style={{padding:"54px 0 80px"}}>
    <p className="goldKicker">SPORTS REWRITTEN ARCHIVE</p><h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 12px"}}>{sport}</h1>
    <p style={{maxWidth:720,color:"#aeb7bb",lineHeight:1.7}}>Alternate histories, draft ripples, career rewrites and championship timelines from the {sport} multiverse.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginTop:34}}>
      {articles.map(a=><article key={a.id} style={{border:"1px solid rgba(255,255,255,.12)",background:"#11181b",padding:20}}>
        {a.hero_image_url&&<img src={a.hero_image_url} alt="" style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",marginBottom:16}}/>}
        <p className="goldKicker">{a.scenario_type}</p><h2 style={{margin:"8px 0 10px"}}><Link href={articleHref(a.sport,a.slug)}>{a.title}</Link></h2>
        <p style={{color:"#aeb7bb",lineHeight:1.65}}>{a.excerpt||a.subtitle}</p><small style={{color:"#7f8a8f"}}>{a.estimated_read_time?`${a.estimated_read_time} min read`:"Sports Rewritten"}</small>
      </article>)}
      {articles.length===0&&<p>No published timelines in this sport yet.</p>}
    </div>
  </main><Footer/></>;
}
