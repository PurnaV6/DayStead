const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'GET,OPTIONS'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='GET')return reply({error:'Method not allowed'},405);
 const authorization=req.headers.get('Authorization');if(!authorization?.startsWith('Bearer '))return reply({error:'Sign in required'},401);
 const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 const owners=(Deno.env.get('DAYSTEAD_OWNER_IDS')||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(!url||!anon||!service)return reply({error:'Service unavailable'},503);
 try{
  const auth=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:authorization}});if(!auth.ok)return reply({error:'Sign in required'},401);
  const user=await auth.json();if(!owners.includes(user.id))return reply({error:'Owner access has not been granted to this account'},403);
  const count=async(table:string,filter='')=>{const result=await fetch(url+'/rest/v1/'+table+'?select=*'+filter,{method:'HEAD',headers:{apikey:service,Authorization:'Bearer '+service,Prefer:'count=exact'}});if(!result.ok)throw new Error('Count failed');const value=result.headers.get('content-range')?.split('/')[1];if(!value||value==='*')throw new Error('Count unavailable');return Number(value)};
  const [schedules,reportedCompletions,subscriptions,activeSubscriptions]=await Promise.all([count('daystead_schedules'),count('daystead_completions'),count('daystead_subscriptions'),count('daystead_subscriptions','&status=in.(active,trialing,grace)&access_until=gt.'+encodeURIComponent(new Date().toISOString()))]);
  return reply({schedules,reportedCompletions,subscriptions,activeSubscriptions,updatedAt:new Date().toISOString()});
 }catch{return reply({error:'Unable to load metrics'},503)}
});
