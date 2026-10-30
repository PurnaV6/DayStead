import {subscriptionState} from '../_shared/subscription.ts';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const token=Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
 if(!token||req.headers.get('Authorization')!==token)return json({error:'Unauthorised'},401);
 const apiKey=Deno.env.get('REVENUECAT_SECRET_KEY'),url=Deno.env.get('SUPABASE_URL'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!apiKey||!url||!service)return json({error:'Billing service is not configured'},503);
 try{
  const {event}=await req.json();if(!event?.id||!event?.type)return json({error:'Invalid event'},400);
  if(event.type==='TEST')return json({received:true});
  // Refresh both sides of a transfer. Anonymous RevenueCat IDs are never database owners.
  const ids=[...new Set([event.app_user_id,...(event.transferred_from||[]),...(event.transferred_to||[])].filter((id:unknown)=>typeof id==='string'&&uuid.test(id)))];
  for(const id of ids){
   const observedAt=new Date().toISOString();
   const response=await fetch('https://api.revenuecat.com/v1/subscribers/'+encodeURIComponent(String(id)),{headers:{Authorization:'Bearer '+apiKey}});
   if(!response.ok)return json({error:'Billing lookup failed'},502);
   const data=await response.json();const state=subscriptionState(data.subscriber,Date.now(),Deno.env.get('REVENUECAT_ALLOW_SANDBOX')==='true');
   const result=await fetch(url+'/rest/v1/rpc/apply_daystead_subscription',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:JSON.stringify({p_user_id:id,p_status:state.status,p_until:state.access_until,p_observed_at:observedAt})});
   if(!result.ok)return json({error:'Billing status update failed'},502);
  }
  return json({received:true});
 }catch{return json({error:'Billing service temporarily unavailable'},503)}
});
