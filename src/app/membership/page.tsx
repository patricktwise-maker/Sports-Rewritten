import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MembershipAccount } from "./MembershipAccount";
import { CheckoutButton } from "./CheckoutButton";

const plans=[
 {code:"founding" as const,name:"Founding Member",price:"$2.99",cadence:"/month",note:"Limited launch pricing for early Sports Rewritten members."},
 {code:"all_access" as const,name:"All Access",price:"$4.99",cadence:"/month",note:"Full access to premium timelines and member-only features."},
 {code:"annual" as const,name:"Annual",price:"$49.99",cadence:"/year",note:"A full year of Sports Rewritten premium access."},
];

export default function MembershipPage(){return <><Header/><main className="shell" style={{padding:"54px 0 80px"}}><p className="goldKicker">SPORTS REWRITTEN MEMBERSHIP</p><h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 14px"}}>Enter More Timelines</h1><p style={{maxWidth:760,color:"#aeb7bb",lineHeight:1.7}}>Membership unlocks premium Sports Rewritten features through secure Stripe Checkout. Create or sign in to a reader account, choose a plan, and Stripe will handle payment securely.</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18,marginTop:32}}>{plans.map(p=><article key={p.name} style={{border:"1px solid rgba(255,255,255,.14)",background:"#11181b",padding:24}}><p className="goldKicker">{p.name}</p><h2 style={{fontSize:40,margin:"8px 0"}}>{p.price}<small style={{fontSize:15,color:"#9ca7ab"}}>{p.cadence}</small></h2><p style={{color:"#aeb7bb",lineHeight:1.6}}>{p.note}</p><CheckoutButton plan={p.code}/></article>)}</div><MembershipAccount/></main><Footer/></>}
