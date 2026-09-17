import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createPublicSupabaseClient, sportSlug } from "@/lib/supabase-public";
import { CommentsSection } from "./CommentsSection";
import styles from "./article.module.css";

type Article = {
  id:string; title:string; slug:string; subtitle:string|null; excerpt:string|null; sport:string; scenario_type:string;
  hero_image_url:string|null; hero_image_alt:string|null; estimated_read_time:number|null; seo_title:string|null;
  seo_description:string|null; author_name:string|null; published_at:string|null; access_level:"free"|"premium";
};
type Section = { id:string; heading:string; body:string; is_premium:boolean; display_order:number; section_type:string };

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
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title:"Article Not Found | Sports Rewritten" };
  return {
    title: article.seo_title || `${article.title} | Sports Rewritten`,
    description: article.seo_description || article.excerpt || undefined,
    openGraph: {
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
  const { data: sectionData } = await supabase.from("article_sections")
    .select("id,heading,body,is_premium,display_order,section_type")
    .eq("article_id", article.id)
    .order("display_order", { ascending:true });
  const sections = (sectionData ?? []) as Section[];
  const jsonLd={
    "@context":"https://schema.org",
    "@type":"Article",
    headline:article.title,
    description:article.seo_description||article.excerpt||undefined,
    author:{"@type":"Person",name:article.author_name||"Sports Rewritten"},
    datePublished:article.published_at||undefined,
    image:article.hero_image_url||undefined,
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
      <CommentsSection articleId={article.id}/>
    </main>
    <Footer />
  </>;
}
