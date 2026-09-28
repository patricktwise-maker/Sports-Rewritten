import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articleHref, createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";

type Tag={id:string;name:string;slug:string};
type Article={
  id:string;title:string;slug:string;sport:string;scenario_type:string;
  excerpt:string|null;estimated_read_time:number|null;published_at:string|null;
};

async function getTopic(slug:string){
  const supabase=createPublicSupabaseClient();
  const {data:tag}=await supabase.from("tags").select("id,name,slug").eq("slug",slug).maybeSingle();
  if(!tag)return null;

  const {data:links}=await supabase.from("article_tags").select("article_id").eq("tag_id",tag.id);
  const ids=[...new Set((links??[]).map((row:any)=>row.article_id))];

  if(ids.length===0)return {tag:tag as Tag,articles:[] as Article[]};

  const {data:articles}=await supabase.from("articles")
    .select("id,title,slug,sport,scenario_type,excerpt,estimated_read_time,published_at")
    .eq("status","published")
    .in("id",ids)
    .order("published_at",{ascending:false});

  return {tag:tag as Tag,articles:(articles??[]) as Article[]};
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const topic=await getTopic(slug);
  if(!topic)return {title:{absolute:"Topic Not Found | Sports Rewritten"},robots:{index:false,follow:false}};

  const indexable=topic.articles.length>=2;
  const title=`${topic.tag.name} Stories | Sports Rewritten`;
  const description=`Explore Sports Rewritten alternate sports history about ${topic.tag.name}, with research-driven what-if scenarios and long-form simulations.`;
  const canonical=`https://sportsrewritten.com/topics/${topic.tag.slug}`;

  return {
    title:{absolute:title},
    description,
    alternates:{canonical},
    robots:{index:indexable,follow:true},
    openGraph:{title,description,url:canonical,type:"website"}
  };
}

export default async function TopicPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const topic=await getTopic(slug);
  if(!topic)notFound();

  const jsonLd={
    "@context":"https://schema.org",
    "@type":"CollectionPage",
    name:`${topic.tag.name} Stories`,
    description:`Sports Rewritten alternate-history features about ${topic.tag.name}.`,
    url:`https://sportsrewritten.com/topics/${topic.tag.slug}`,
    hasPart:topic.articles.map(article=>({
      "@type":"Article",
      headline:article.title,
      url:`https://sportsrewritten.com${articleHref(article.sport,article.slug)}`
    }))
  };

  return <>
    <Header/>
    <main className="shell" style={{padding:"54px 0 80px"}}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
      <p className="goldKicker">TOPIC</p>
      <h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 16px"}}>{topic.tag.name}</h1>
      <p style={{color:"#aeb7bb",lineHeight:1.65,maxWidth:820}}>
        Explore Sports Rewritten features connected to {topic.tag.name}. Each story starts with a real sports hinge and follows the consequences through a researched alternate history.
      </p>

      <div style={{display:"grid",gap:16,marginTop:30}}>
        {topic.articles.map(article=><article key={article.id} style={{borderTop:"1px solid rgba(255,255,255,.12)",padding:"22px 0"}}>
          <p className="goldKicker">{article.sport} · {article.scenario_type}</p>
          <h2 style={{margin:"6px 0 8px"}}><Link href={articleHref(article.sport,article.slug)}>{article.title}</Link></h2>
          {article.excerpt&&<p style={{color:"#aeb7bb",lineHeight:1.65,maxWidth:840}}>{article.excerpt}</p>}
          {article.estimated_read_time&&<small>{article.estimated_read_time} min read</small>}
        </article>)}
      </div>
    </main>
    <Footer/>
  </>;
}
