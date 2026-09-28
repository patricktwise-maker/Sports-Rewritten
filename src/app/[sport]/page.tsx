import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { sports } from "@/lib/content";
import { articleHref, createPublicSupabaseClient, sportSlug } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

export async function generateMetadata({params}:{params:Promise<{sport:string}>}):Promise<Metadata>{
  const {sport:slug}=await params;
  const sport=sports.find(s=>sportSlug(s)===slug);
  if(!sport)return {title:{absolute:"Sports Archive | Sports Rewritten"}};
  const canonical=`https://sportsrewritten.com/${slug}`;
  return {
    title:{absolute:`${sport} Alternate History | Sports Rewritten`},
    description:`Explore research-driven ${sport} alternate histories, draft rewrites, career changes, dynasties, and what-if timelines from Sports Rewritten.`,
    alternates:{canonical},
    openGraph:{
      title:`${sport} Alternate History | Sports Rewritten`,
      description:`Explore research-driven ${sport} alternate histories and what-if timelines.`,
      url:canonical,
      type:"website"
    }
  };
}

type Article = {
  id:string; title:string; slug:string; subtitle:string|null; excerpt:string|null;
  sport:string; scenario_type:string; hero_image_url:string|null;
  estimated_read_time:number|null; published_at:string|null
};
type TagLink={article_id:string;tags:{name:string;slug:string}|{name:string;slug:string}[]|null};

export default async function SportArchivePage({params}:{params:Promise<{sport:string}>}) {
  const {sport:slug}=await params;
  const sport=sports.find(s=>sportSlug(s)===slug);
  if(!sport) notFound();

  const supabase=createPublicSupabaseClient();
  const {data}=await supabase.from("articles")
    .select("id,title,slug,subtitle,excerpt,sport,scenario_type,hero_image_url,estimated_read_time,published_at")
    .eq("status","published")
    .eq("sport",sport)
    .order("published_at",{ascending:false});

  const articles=(data??[]) as Article[];
  const articleIds=articles.map(article=>article.id);
  const topicCounts=new Map<string,{name:string;slug:string;count:number}>();

  if(articleIds.length){
    const {data:tagLinks}=await supabase.from("article_tags")
      .select("article_id,tags(name,slug)")
      .in("article_id",articleIds);

    for(const row of (tagLinks??[]) as TagLink[]){
      const tag=Array.isArray(row.tags)?row.tags[0]:row.tags;
      if(!tag?.slug)continue;
      const current=topicCounts.get(tag.slug);
      topicCounts.set(tag.slug,{name:tag.name,slug:tag.slug,count:(current?.count??0)+1});
    }
  }

  const topics=[...topicCounts.values()]
    .filter(topic=>topic.count>=2)
    .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name))
    .slice(0,8);

  const collectionJsonLd={
    "@context":"https://schema.org",
    "@type":"CollectionPage",
    name:`${sport} Alternate History`,
    url:`https://sportsrewritten.com/${slug}`,
    description:`Research-driven ${sport} what-if stories and alternate sports histories from Sports Rewritten.`,
    hasPart:articles.map(article=>({
      "@type":"Article",
      headline:article.title,
      url:`https://sportsrewritten.com${articleHref(article.sport,article.slug)}`
    }))
  };

  return <>
    <Header/>
    <main className="shell" style={{padding:"54px 0 80px"}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(collectionJsonLd)}}/>
      <p className="goldKicker">SPORTS REWRITTEN ARCHIVE</p>
      <h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 12px"}}>{sport}</h1>
      <p style={{maxWidth:760,color:"#aeb7bb",lineHeight:1.7}}>
        Research-driven {sport} alternate histories built around the decisions, injuries, drafts, trades and championship swings that could have changed the sport.
      </p>

      {topics.length>0&&<section style={{marginTop:30}}>
        <p className="goldKicker">EXPLORE {sport.toUpperCase()} TOPICS</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:12}}>
          {topics.map(topic=><Link key={topic.slug} href={`/topics/${topic.slug}`} style={{border:"1px solid rgba(209,170,87,.35)",padding:"8px 11px",color:"#d1aa57"}}>
            {topic.name} ({topic.count})
          </Link>)}
        </div>
      </section>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginTop:34}}>
        {articles.map(a=><article key={a.id} style={{border:"1px solid rgba(255,255,255,.12)",background:"#11181b",padding:20}}>
          {a.hero_image_url&&<img src={a.hero_image_url} alt={a.title} style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",marginBottom:16}}/>}
          <p className="goldKicker">{a.scenario_type}</p>
          <h2 style={{margin:"8px 0 10px"}}><Link href={articleHref(a.sport,a.slug)}>{a.title}</Link></h2>
          <p style={{color:"#aeb7bb",lineHeight:1.65}}>{a.excerpt||a.subtitle}</p>
          <small style={{color:"#7f8a8f"}}>{a.estimated_read_time?`${a.estimated_read_time} min read`:"Sports Rewritten"}</small>
        </article>)}
        {articles.length===0&&<p>No published timelines in this sport yet.</p>}
      </div>
    </main>
    <Footer/>
  </>;
}
