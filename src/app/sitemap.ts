import type { MetadataRoute } from "next";
import { sports } from "@/lib/content";
import { articleHref, createPublicSupabaseClient, sportSlug } from "@/lib/supabase-public";

const base="https://sports-rewritten.vercel.app";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const supabase=createPublicSupabaseClient();
 const {data}=await supabase.from("articles").select("slug,sport,updated_at,published_at").eq("status","published");
 const articles=(data??[]).map((a:any)=>({url:`${base}${articleHref(a.sport,a.slug)}`,lastModified:a.updated_at||a.published_at||new Date(),changeFrequency:"weekly" as const,priority:.8}));
 const sportPages=sports.map(s=>({url:`${base}/${sportSlug(s)}`,changeFrequency:"weekly" as const,priority:.6}));
 return [{url:base,changeFrequency:"daily",priority:1},{url:`${base}/search`,changeFrequency:"weekly",priority:.5},{url:`${base}/vault`,changeFrequency:"daily",priority:.7},...sportPages,...articles];
}
