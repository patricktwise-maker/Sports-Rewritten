import type { MetadataRoute } from "next";

export default function robots():MetadataRoute.Robots{
 return {rules:{userAgent:"*",allow:"/",disallow:["/admin","/studio"]},sitemap:"https://sportsrewritten.com/sitemap.xml"};
}
