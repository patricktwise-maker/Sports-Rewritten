import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articleHref, createPublicSupabaseClient, sportSlug } from "@/lib/supabase-public";
import { CommentsSection } from "./CommentsSection";
import styles from "./article.module.css";

type Article = {
  id:string; title:string; slug:string; subtitle:string|null; excerpt:string|null; sport:string; scenario_type:string;
  hero_image_url:string|null; hero_image_alt:string|null; estimated_read_time:number|null; seo_title:string|null;
  seo_description:string|null; author_name:string|null; published_at:string|null; access_level:"free"|"premium";
};
type Section = { id:string; heading:string; body:string; is_premium:boolean; display_order:number; section_type:string };
type Related={id:string;title:string;slug:string;sport:string;scenario_type:string;excerpt:string|null;estimated_read_time:number|null};

async function getArticle(slug:string) {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from("articles")
    .select("id,title,slug,subtitle,excerpt,sport,scenario_type,hero_image_url,hero_image_alt,estimated_read_time,seo_title,seo_description,author_name,published_at,access_level")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  return data as Article | null;
}

function sectionAnchor(section:Section,index:number){
  const clean=section.heading.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  return clean||`section-${index+1}`;
}

export async function generateMetadata({ params }:{ params:Promise<{sport:string;slug:string}> }):Promise<Metadata> {
  const { sport, slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title:"Article Not Found | Sports Rewritten" };
  const canonical=`https://sports-rewritten.vercel.app/${sport}/${slug}`;
  return {
    title: article.seo_title || `${article.title} | Sports Rewritten`,
    description: article.seo_description || article.excerpt || undefined,
    alternates:{canonical},
    openGraph: {
      url:canonical,
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || undefined,
      type: "article",
      publishedTime: article.published_at || undefined,
      images: article.hero_image_url ? [{ url: article.hero_image_url, alt: article.hero_image_alt || article.title }] : undefined,
    },
  };
}

export default async function PublishedArticlePage({ params }:{ params:Promise<{sport:string;slug:string}> }) {
  const { sport, slug } = await params;
  const article = await getArticle(slug);
  if (!article || sportSlug(article.sport) !== sport) notFound();

  const supabase = createPublicSupabaseClient();
  const [{ data: sectionData },{data:relatedData}] = await Promise.all([
    supabase.from("article_sections").select("id,heading,body,is_premium,display_order,section_type").eq("article_id", article.id).order("display_order", { ascending:true }),
    supabase.from("articles").select("id,title,slug,sport,scenario_type,excerpt,estimated_read_time").eq("status","published").neq("id",article.id).order("published_at",{ascending:false}).limit(3)
  ]);
  const sections = (sectionData ?? []) as Section[];
  const related=(relatedData??[]) as Related[];
  const jsonLd={
    "@context":"https://schema.org",
    "@type":"Article",
    headline:article.title,
    description:article.seo_description||article.excerpt||undefined,
    author:{"@type":"Person",name:article.author_name||"Sports Rewritten"},
    datePublished:article.published_at||undefined,
    image:article.hero_image_url||undefined,
    mainEntityOfPage:`https://sports-rewritten.vercel.app${articleHref(article.sport,article.slug)}`,
    isAccessibleForFree:article.access_level==="free",
    hasPart:sections.filter(s=>s.is_premium).map(s=>({"@type":"WebPageElement",isAccessibleForFree:false,cssSelector:`#${sectionAnchor(s,s.display_order)}`}))
  };

  return <>
    <Header />
    <main className={`shell ${styles.articleShell}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{article.sport} · {article.scenario_type}</p>
        <h1 className={styles.title}>{article.title}</h1>
        {article.subtitle && <p className={styles.subtitle}>{article.subtitle}</p>}
        <div className={styles.meta}>
          <span>By {article.author_name || "Sports Rewritten"}</span>
          {article.estimated_read_time && <span>{article.estimated_read_time} min read</span>}
          <span>{article.access_level==="premium"?"Premium Feature":"Free Feature"}</span>
          {article.published_at && <span>{new Date(article.published_at).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</span>}
        </div>
        {article.hero_image_url && <img className={styles.heroImage} src={article.hero_image_url} alt={article.hero_image_alt || article.title}/>} 
      </header>
      {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
      <div className={styles.articleLayout}>
        <aside className={styles.toc} aria-label="Article contents">
          <p>IN THIS TIMELINE</p>
          <ol>{sections.map((section,index)=><li key={section.id}><a href={`#${sectionAnchor(section,index)}`}>{section.heading}</a></li>)}</ol>
        </aside>
        <article className={styles.story}>
          {sections.map((section, index) => {
            const typeClass=section.section_type==="reality"?styles.reality:section.section_type==="simulation"?styles.simulation:"";
            const label=section.section_type==="reality"?"Reality Anchor":section.section_type==="simulation"?"Rewritten Timeline":null;
            return <section id={sectionAnchor(section,index)} className={`${styles.section} ${typeClass}`} key={section.id}>
              <div className={styles.sectionNumber}>{String(index + 1).padStart(2,"0")}</div>
              <div>
                {label&&<p className={styles.timelineLabel}>{label}</p>}
                <h2>{section.heading}{section.is_premium && <span className={styles.premium}>PREMIUM</span>}</h2>
                <p>{section.body}</p>
              </div>
            </section>
          })}
        </article>
      </div>
      <section style={{margin:"42px 0",padding:"26px",border:"1px solid rgba(209,170,87,.35)",background:"#11181b"}}><p className="goldKicker">SPORTS REWRITTEN MEMBERSHIP</p><h2 style={{margin:"6px 0 10px"}}>Go deeper into the multiverse.</h2><p style={{color:"#aeb7bb",lineHeight:1.65}}>Reader accounts are live now. Premium checkout will activate when the payment connection is complete.</p><Link className="goldButton" href="/membership">View Membership</Link></section>
      {related.length>0&&<section style={{margin:"48px 0"}}><p className="goldKicker">MORE TIMELINES</p><h2 style={{fontSize:36,margin:"6px 0 18px"}}>Keep rewriting history</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>{related.map(r=><article key={r.id} style={{border:"1px solid rgba(255,255,255,.12)",padding:18,background:"#11181b"}}><small style={{color:"#9ca7ab"}}>{r.sport} · {r.scenario_type}</small><h3><Link href={articleHref(r.sport,r.slug)}>{r.title}</Link></h3>{r.excerpt&&<p style={{color:"#aeb7bb",lineHeight:1.55}}>{r.excerpt}</p>}{r.estimated_read_time&&<small>{r.estimated_read_time} min read</small>}</article>)}</div></section>}
      <CommentsSection articleId={article.id}/>
    </main>
    <Footer />
  </>;
}
