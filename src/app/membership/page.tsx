import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MembershipAccount } from "./MembershipAccount";

const plans=[
 {name:"Founding Member",price:"$2.99",cadence:"/month",note:"Limited launch pricing for early Sports Rewritten members."},
 {name:"All Access",price:"$4.99",cadence:"/month",note:"Full access to premium timelines and member-only features."},
 {name:"Annual",price:"$49.99",cadence:"/year",note:"A full year of Sports Rewritten premium access."},
];

export default function MembershipPage(){return <><Header/><main className="shell" style={{padding:"54px 0 80px"}}><p className="goldKicker">SPORTS REWRITTEN MEMBERSHIP</p><h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 14px"}}>Enter More Timelines</h1><p style={{maxWidth:760,color:"#aeb7bb",lineHeight:1.7}}>Membership will unlock premium sections, deeper simulations, expanded draft ripples and future member features. Reader accounts are live now; paid checkout will activate after Stripe is connected.</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18,marginTop:32}}>{plans.map(p=><article key={p.name} style={{border:"1px solid rgba(255,255,255,.14)",background:"#11181b",padding:24}}><p className="goldKicker">{p.name}</p><h2 style={{fontSize:40,margin:"8px 0"}}>{p.price}<small style={{fontSize:15,color:"#9ca7ab"}}>{p.cadence}</small></h2><p style={{color:"#aeb7bb",lineHeight:1.6}}>{p.note}</p><button className="goldButton" disabled title="Stripe connection required" style={{opacity:.55,cursor:"not-allowed"}}>Checkout coming online</button></article>)}</div><MembershipAccount/></main><Footer/></>}
