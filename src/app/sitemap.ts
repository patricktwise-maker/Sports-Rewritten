import type { MetadataRoute } from "next";
import { sports } from "@/lib/content";
import { articleHref, createPublicSupabaseClient, sportSlug } from "@/lib/supabase-public";

const base="https://sportsrewritten.com";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const supabase=createPublicSupabaseClient();

 const {data}=await supabase.from("articles")
   .select("id,slug,sport,updated_at,published_at")
   .eq("status","published");

 const published=data??[];
 const articles=published.map((a:any)=>({
   url:`${base}${articleHref(a.sport,a.slug)}`,
   lastModified:a.updated_at||a.published_at||new Date(),
   changeFrequency:"weekly" as const,
   priority:.8
 }));

 const sportPages=sports.map(s=>({
   url:`${base}/${sportSlug(s)}`,
   changeFrequency:"weekly" as const,
   priority:.6
 }));

 const publishedIds=published.map((a:any)=>a.id);
 let topicPages:MetadataRoute.Sitemap=[];

 if(publishedIds.length>0){
   const {data:tagLinks}=await supabase.from("article_tags")
     .select("article_id,tags(slug)")
     .in("article_id",publishedIds);

   const counts=new Map<string,number>();
   for(const row of (tagLinks??[]) as any[]){
     const tag=Array.isArray(row.tags)?row.tags[0]:row.tags;
     if(!tag?.slug)continue;
     counts.set(tag.slug,(counts.get(tag.slug)??0)+1);
   }

   topicPages=[...counts.entries()]
     .filter(([,count])=>count>=2)
     .map(([slug])=>({
       url:`${base}/topics/${slug}`,
       changeFrequency:"weekly" as const,
       priority:.55
     }));
 }

 return [
   {url:base,changeFrequency:"daily",priority:1},
   {url:`${base}/vault`,changeFrequency:"daily",priority:.7},
   {url:`${base}/membership`,changeFrequency:"monthly",priority:.6},
   {url:`${base}/about`,changeFrequency:"monthly",priority:.5},
   {url:`${base}/authors/patrick-wise`,changeFrequency:"weekly",priority:.6},
   {url:`${base}/contact`,changeFrequency:"monthly",priority:.3},
   {url:`${base}/privacy`,changeFrequency:"yearly",priority:.2},
   {url:`${base}/terms`,changeFrequency:"yearly",priority:.2},
   ...sportPages,
   ...topicPages,
   ...articles
 ];
}
