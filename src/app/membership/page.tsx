import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createPublicSupabaseClient } from "@/lib/supabase-public";
import { MembershipAccount } from "./MembershipAccount";
import { CheckoutButton } from "./CheckoutButton";

export const dynamic="force-dynamic";
export const revalidate=0;

type Offer={founding_count:number;founding_limit:number;founding_available:boolean;active_plan:"founding"|"all_access"};

async function getOffer():Promise<Offer>{
 const supabase=createPublicSupabaseClient();
 const {data}=await supabase.rpc("get_membership_offer");
 return (data??{founding_count:0,founding_limit:250,founding_available:true,active_plan:"founding"}) as Offer;
}

export default async function MembershipPage(){
 const offer=await getOffer();
 const plan=offer.founding_available
  ? {code:"founding" as const,name:"Founding Member",price:"$2.99",cadence:"/month",note:`Limited launch pricing for the first ${offer.founding_limit} Sports Rewritten members.`}
  : {code:"all_access" as const,name:"Sports Rewritten Membership",price:"$4.99",cadence:"/month",note:"Full access to premium timelines and member-only features."};

 return <><Header/><main className="shell" style={{padding:"54px 0 80px"}}>
  <p className="goldKicker">SPORTS REWRITTEN MEMBERSHIP</p>
  <h1 style={{fontSize:"clamp(42px,7vw,76px)",margin:"8px 0 14px"}}>Enter More Timelines</h1>
  <p style={{maxWidth:760,color:"#aeb7bb",lineHeight:1.7}}>Membership unlocks premium Sports Rewritten features through secure Stripe Checkout. Create or sign in to a reader account, choose the available plan, and Stripe will handle payment securely.</p>
  <div style={{display:"grid",gridTemplateColumns:"minmax(240px,560px)",gap:18,marginTop:32}}>
   <article style={{border:"1px solid rgba(255,255,255,.14)",background:"rgba(17,24,27,.94)",padding:24}}>
    <p className="goldKicker">{plan.name}</p>
    <h2 style={{fontSize:40,margin:"8px 0"}}>{plan.price}<small style={{fontSize:15,color:"#9ca7ab"}}>{plan.cadence}</small></h2>
    <p style={{color:"#aeb7bb",lineHeight:1.6}}>{plan.note}</p>
    {offer.founding_available&&<p style={{fontSize:13,color:"#d9b36a"}}>{offer.founding_count} of {offer.founding_limit} founding memberships claimed.</p>}
    <CheckoutButton plan={plan.code}/>
   </article>
  </div>
  <MembershipAccount/>
 </main><Footer/></>
}
