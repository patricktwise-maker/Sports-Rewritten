import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "What If Joe Hamilton Was Born 20 Years Later?",
  description: "Sports Rewritten rebuilds Joe Hamilton's career in the modern football era.",
};

const chapters = [
  ["01", "The Player We Actually Got", "We begin with the real timeline: Hamilton's skill set, production, accolades, limitations, and the football environment that shaped his career."],
  ["02", "The Divergence", "Hamilton is born exactly twenty years later. History stays intact until that single change creates its first measurable consequence."],
  ["03", "Growing Up in the Modern Game", "Quarterback camps, seven-on-seven football, private coaching, modern strength development, recruiting media, NIL, and spread concepts reshape the pathway."],
  ["04", "Modern Recruiting", "We build a defensible recruiting profile, identify scheme fits, assess size concerns, and model which programs would actually prioritize him."],
  ["05", "The College Decision", "The simulation chooses a destination from fit, opportunity, coaching, roster competition, and recruiting context, not from the outcome that makes the best story."],
  ["06", "College Career Simulation", "Season-by-season production, team results, postseason paths, awards, and major ripple effects are reconstructed under the new timeline."],
  ["07", "The NFL Question", "How would today's league evaluate an undersized, productive, mobile quarterback with Hamilton's traits and résumé?"],
  ["08", "The Rewritten Legacy", "The real career and simulated career meet here. We identify which conclusions are strong, which are plausible, and which remain uncertain."],
];

export default function JoeHamiltonArticle() {
  return <><Header/><main className="articlePage"><header className="articleHero shell"><p className="eyebrow">COLLEGE FOOTBALL • BORN IN ANOTHER ERA</p><h1>WHAT IF JOE HAMILTON<br/><span>WAS BORN 20 YEARS LATER?</span></h1><p className="articleDek">The game eventually evolved toward many of the traits Joe Hamilton already possessed. So what happens when one of college football's most productive quarterbacks grows up inside the era seemingly designed for him?</p><div className="articleByline"><span>By Patrick Wise</span><span>22 min read</span><span>Sports Rewritten Simulation</span></div><div className="articleImage"><div className="playerSilhouette large">7</div><p>Original Sports Rewritten editorial illustration will live here.</p></div></header>

<section className="articleBody shell"><aside className="articleAside"><div className="methodCard"><p className="goldKicker">THE DIVERGENCE MODEL</p><strong>Reality remains intact until the divergence.</strong><p>Historical anchors, contextual translation, dependency, uncertainty, and no protected outcomes.</p></div></aside><article className="articleContent"><p className="lead">This prototype establishes the permanent Sports Rewritten article architecture. The completed feature will replace these editorial-development summaries with researched historical reporting, sourced statistics, simulation results, tables, timelines, and analysis.</p>{chapters.map(([number,title,text])=><section className="chapter" key={number}><span className="chapterNumber">{number}</span><div><h2>{title}</h2><p>{text}</p></div></section>)}<div className="paywallPreview"><p className="goldKicker">SPORTS REWRITTEN MEMBERS</p><h2>The full multiverse continues beyond the free preview.</h2><p>When memberships go live, premium sections, full simulations, tables, and archive access will continue here.</p><button className="goldButton">Founding Membership • $2.99/month</button></div></article></section>
</main><Footer/></>;
}
