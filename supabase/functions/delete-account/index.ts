// Deploy as delete-daystead-account. Never accept a user ID from the request body.
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const authorization=req.headers.get('Authorization');
 if(!authorization?.startsWith('Bearer '))return json({error:'Sign in required'},401);
 const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!anon||!service)return json({error:'Account service unavailable'},503);
 try{
  const auth=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:authorization}});
  if(!auth.ok)return json({error:'Session expired. Sign in again.'},401);
  const user=await auth.json();
  if(!user.id)return json({error:'Invalid account'},401);
  const body=await req.json();if(body.confirmation!=='DELETE')return json({error:'Deletion confirmation required'},400);
  // Cascading FKs remove the caller's schedules, completion history and subscription row.
  const result=await fetch(url+'/auth/v1/admin/users/'+encodeURIComponent(user.id),{method:'DELETE',headers:{apikey:service,Authorization:'Bearer '+service}});
  if(!result.ok)return json({error:'Account could not be deleted. Please retry.'},502);
  return json({deleted:true});
 }catch{return json({error:'Account service unavailable. Please retry.'},503)}
});
