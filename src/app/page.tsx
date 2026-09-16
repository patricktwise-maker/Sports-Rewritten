import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { articles as prototypeArticles, sports } from "@/lib/content";
import { articleHref, createPublicSupabaseClient } from "@/lib/supabase-public";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PublishedArticle = {
  id:string; title:string; slug:string; sport:string; scenario_type:string; excerpt:string|null;
  estimated_read_time:number|null; featured:boolean; published_at:string|null; hero_image_url:string|null;
};

async function getPublishedArticles() {
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from("articles")
    .select("id,title,slug,sport,scenario_type,excerpt,estimated_read_time,featured,published_at,hero_image_url")
    .eq("status", "published")
    .order("published_at", { ascending:false })
    .limit(12);
  return (data ?? []) as PublishedArticle[];
}

export default async function Home() {
  const published = await getPublishedArticles();
  const featured = published.find((a) => a.featured) ?? published[0] ?? null;
  const latest = featured ? published.filter((a) => a.id !== featured.id).slice(0,5) : [];
  const hasLiveStories = published.length > 0;

  return (
    <>
      <Header />
      <main>
        <section className="hero shell">
          <div className="heroStory">
            <div className="heroBackdrop" aria-hidden="true"><span className="fieldLine l1"/><span className="fieldLine l2"/><span className="stadiumGlow"/></div>
            <div className="heroCopy">
              <p className="eyebrow">FEATURED TIMELINE</p>
              {featured ? <>
                <h1>{featured.title}</h1>
                <p className="heroDeck">{featured.excerpt || "A Sports Rewritten timeline built from research, plausible divergence, and the consequences that follow."}</p>
                <div className="heroMeta"><span>{featured.sport.toUpperCase()}</span><span>{featured.estimated_read_time || 1} MIN READ</span><span>{featured.scenario_type.toUpperCase()}</span></div>
                <Link className="redButton" href={articleHref(featured.sport, featured.slug)}>Explore This Timeline →</Link>
              </> : <>
                <h1>WHAT IF JOE HAMILTON<br/><span>WAS BORN 20 YEARS LATER?</span></h1>
                <p className="heroDeck">A Heisman-caliber quarterback arrives in an era built for his skill set. We rebuild his recruiting, college career, NFL evaluation, and the ripple effects that follow.</p>
                <div className="heroMeta"><span>COLLEGE FOOTBALL</span><span>22 MIN READ</span><span>FOUNDING STORY</span></div>
                <Link className="redButton" href="/college-football/what-if-joe-hamilton-was-born-20-years-later">Explore This Timeline →</Link>
              </>}
            </div>
            <div className="heroArt" aria-label="Editorial art placeholder">
              {featured?.hero_image_url ? <img src={featured.hero_image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <><div className="playerSilhouette">7</div><p>ORIGINAL EDITORIAL ART</p></>}
            </div>
          </div>
          <aside className="heroRail">
            <div className="panel pollPanel">
              <p className="goldKicker">THE NEXT TIMELINE</p><h2>What should we rewrite next?</h2>
              {['What if the Bulls drafted Melo?','What if Bo Jackson never got hurt?','What if Alabama never hired Saban?','What if Seattle kept Griffey?'].map((x) => <label className="pollOption" key={x}><input type="radio" name="poll"/> <span>{x}</span></label>)}
              <button className="redButton full" type="button">Vote Now</button>
            </div>
            <div className="panel dynasty"><p className="goldKicker">FROM THE MULTIVERSE</p><h2>DYNASTY<br/>ARCHITECT</h2><p>Read the timeline. Then build your own.</p><a className="goldButton" href="#">Explore the Game</a></div>
          </aside>
        </section>

        <section className="shell sectionBlock"><div className="sectionHeading"><h2>{hasLiveStories ? "NEW THIS WEEK" : "COMING TO SPORTS REWRITTEN"}</h2><a href="#vault">View the archive →</a></div><div className="storyGrid">
          {hasLiveStories ? latest.map((article, i) => <article className="storyCard" key={article.id}><div className={`storyArt art${i+1}`}>{article.hero_image_url ? <img src={article.hero_image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span>{article.sport.split(' ').map(w=>w[0]).join('').slice(0,3)}</span>}</div><p className="storySport">{article.sport}</p><h3><Link href={articleHref(article.sport, article.slug)}>{article.title}</Link></h3><p className="storyMeta">{article.estimated_read_time || 1} min • {article.scenario_type}</p></article>) :
          prototypeArticles.slice(1).map((article, i) => <article className="storyCard" key={article.title}><div className={`storyArt art${i+1}`}><span>{article.sport.split(' ').map(w=>w[0]).join('').slice(0,3)}</span></div><p className="storySport">{article.sport}</p><h3>{article.title}</h3><p className="storyMeta">{article.read} • Alternate Timeline</p></article>)}
        </div></section>

        <section className="splitSection shell">
          <div id="categories" className="browse panel"><div className="sectionHeading"><h2>BROWSE BY SPORT</h2></div><div className="categoryGrid">{sports.map((sport, i)=><a href="#vault" className="categoryCard" key={sport}><span className={`categoryIcon c${i}`}>{sport.split(' ').map(w=>w[0]).join('').slice(0,3)}</span><strong>{sport}</strong><small>Explore →</small></a>)}</div></div>
          <div className="panel mostRead"><p className="goldKicker">{hasLiveStories ? "LATEST TIMELINES" : "MOST READ"}</p>{hasLiveStories ? published.slice(0,5).map((a,i)=><Link href={articleHref(a.sport,a.slug)} className="ranked" key={a.id}><strong>{i+1}</strong><span>{a.title}</span></Link>) : prototypeArticles.slice(0,5).map((a,i)=><a href={a.slug} className="ranked" key={a.title}><strong>{i+1}</strong><span>{a.title}</span></a>)}</div>
        </section>

        <section id="vault" className="vault shell"><div><p className="eyebrow">THE VAULT</p><h2>ONE CHANGE.<br/><span>AN ENTIRE SPORTS WORLD MOVES.</span></h2><p>Every Sports Rewritten feature joins a growing archive of alternate drafts, careers, dynasties, recruiting decisions, injuries, trades, free agency moves, life decisions, and era shifts.</p></div><a className="outlineButton" href="#">Enter the Vault →</a></section>

        <section id="membership" className="membership shell"><div><p className="goldKicker">MEMBERSHIP</p><h2>ENTER THE SPORTS MULTIVERSE.</h2><p>Full premium archive, weekly timelines, member voting, and founding-member access.</p></div><div className="priceBox"><span>Founding members</span><strong>$2.99<small>/month</small></strong><a className="goldButton" href="#">Become a Founding Member</a></div></section>
      </main>
      <Footer />
    </>
  );
}
