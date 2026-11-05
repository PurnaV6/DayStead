// Deploy as sync-daystead-subscription. The app calls it right after a purchase or restore, and when a save
// is refused (code 42501), so a new subscriber does not wait for the RevenueCat webhook.
// It only ever refreshes the signed-in caller's own row: the user ID comes from their session, never the body.
import {subscriptionState} from '../_shared/subscription.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
// Limits RevenueCat lookups per account to protect the shared API limit. Accounts without access get a
// shorter gap, so someone who subscribes just after being refused is not kept waiting.
const GAP_WITH_ACCESS_MS=20_000,GAP_WITHOUT_ACCESS_MS=5_000,MARGIN_MS=3*86_400_000;
// Same rule as public.daystead_has_access() in require-subscription.sql.
const grantsAccess=(status:string,until:string)=>['trialing','active','grace'].includes(status)&&Date.parse(until)+MARGIN_MS>Date.now();
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const authorization=req.headers.get('Authorization');
 if(!authorization?.startsWith('Bearer '))return json({error:'Sign in required'},401);
 const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),apiKey=Deno.env.get('REVENUECAT_SECRET_KEY');
 if(!url||!anon||!service||!apiKey)return json({error:'Billing service is not configured'},503);
 const admin={apikey:service,Authorization:'Bearer '+service};
 try{
  const auth=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:authorization}});
  if(!auth.ok)return json({error:'Session expired. Sign in again.'},401);
  const user=await auth.json();if(!user.id)return json({error:'Invalid account'},401);
  const current=await fetch(url+'/rest/v1/daystead_subscriptions?select=status,access_until,updated_at&user_id=eq.'+encodeURIComponent(user.id),{headers:admin});
  if(!current.ok)return json({error:'Billing status lookup failed'},502);
  const [row]=await current.json() as {status:string;access_until:string;updated_at:string}[];
  if(row){
   const access=grantsAccess(row.status,row.access_until);
   if(Date.now()-Date.parse(row.updated_at)<(access?GAP_WITH_ACCESS_MS:GAP_WITHOUT_ACCESS_MS))return json({status:access?row.status:'expired',access_until:row.access_until});
  }
  const observedAt=new Date().toISOString();
  const response=await fetch('https://api.revenuecat.com/v1/subscribers/'+encodeURIComponent(user.id),{headers:{Authorization:'Bearer '+apiKey}});
  if(!response.ok)return json({error:'Billing lookup failed'},502);
  const data=await response.json();
  const state=subscriptionState(data.subscriber,Date.now(),Deno.env.get('REVENUECAT_ALLOW_SANDBOX')==='true');
  const result=await fetch(url+'/rest/v1/rpc/apply_daystead_subscription',{method:'POST',headers:{...admin,'Content-Type':'application/json'},body:JSON.stringify({p_user_id:user.id,p_status:state.status,p_until:state.access_until,p_observed_at:observedAt})});
  if(!result.ok)return json({error:'Billing status update failed'},502);
  return json({status:state.status,access_until:state.access_until});
 }catch{return json({error:'Billing service temporarily unavailable'},503)}
});
