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
  seo_description:string|null; author_name:string|null; published_at:string|null;
};
type Section = { id:string; heading:string; body:string; is_premium:boolean; display_order:number };

async function getArticle(slug:string) {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from("articles")
    .select("id,title,slug,subtitle,excerpt,sport,scenario_type,hero_image_url,hero_image_alt,estimated_read_time,seo_title,seo_description,author_name,published_at")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  return data as Article | null;
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
    .select("id,heading,body,is_premium,display_order")
    .eq("article_id", article.id)
    .order("display_order", { ascending:true });
  const sections = (sectionData ?? []) as Section[];

  return <>
    <Header />
    <main className={`shell ${styles.articleShell}`}>
      <article>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{article.sport} · {article.scenario_type}</p>
          <h1 className={styles.title}>{article.title}</h1>
          {article.subtitle && <p className={styles.subtitle}>{article.subtitle}</p>}
          <div className={styles.meta}>
            <span>By {article.author_name || "Sports Rewritten"}</span>
            {article.estimated_read_time && <span>{article.estimated_read_time} min read</span>}
            {article.published_at && <span>{new Date(article.published_at).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</span>}
          </div>
          {article.hero_image_url && <img className={styles.heroImage} src={article.hero_image_url} alt={article.hero_image_alt || article.title}/>} 
        </header>
        {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
        {sections.map((section, index) => <section className={styles.section} key={section.id}>
          <div className={styles.sectionNumber}>{String(index + 1).padStart(2,"0")}</div>
          <div>
            <h2>{section.heading}{section.is_premium && <span className={styles.premium}>PREMIUM</span>}</h2>
            <p>{section.body}</p>
          </div>
        </section>)}
      </article>
      <CommentsSection articleId={article.id}/>
    </main>
    <Footer />
  </>;
}
