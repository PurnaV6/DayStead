export type Kind = 'bill' | 'medicine' | 'appointment';
export type Schedule = { id:string; user_id:string; kind:Kind; title:string; category:string; amount_pence:number|null; due_at:string; repeat_rule:'none'|'daily'|'weekly'|'monthly'; end_at:string|null; notes:string; version:number; dose_minutes?:number[]|null };
export type Completion = {schedule_id:string; occurrence_at:string; status:string};
export type Occurrence = {schedule:Schedule; at:Date; key:string; status?:string};
export const pounds=(pence:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(pence/100);
export function occurrences(schedules:Schedule[], from:Date, to:Date, completions:Completion[]=[]):Occurrence[]{
 const result:Occurrence[]=[];
 const done=new Map(completions.map(c=>[c.schedule_id+'|'+new Date(c.occurrence_at).toISOString(),c.status]));
 for(const s of schedules){
  const start=new Date(s.due_at);
  if(!Number.isFinite(+start)) continue;
  const end=s.end_at?new Date(Math.min(+to,+new Date(s.end_at))):to;
  let n=0;
  // Jump close to the requested window, then use calendar arithmetic to preserve local times.
  if(s.repeat_rule==='daily')n=Math.max(0,Math.floor((+from-+start)/86400000)-2);
  if(s.repeat_rule==='weekly')n=Math.max(0,Math.floor((+from-+start)/604800000)-2);
  if(s.repeat_rule==='monthly')n=Math.max(0,(from.getFullYear()-start.getFullYear())*12+from.getMonth()-start.getMonth()-1);
  for(let i=0;i<5000;i++,n++){
   const at=new Date(start);
   if(s.repeat_rule==='daily')at.setDate(start.getDate()+n);
   if(s.repeat_rule==='weekly')at.setDate(start.getDate()+7*n);
   if(s.repeat_rule==='monthly'){
    at.setDate(1);at.setMonth(start.getMonth()+n);
    at.setDate(Math.min(start.getDate(),new Date(at.getFullYear(),at.getMonth()+1,0).getDate()));
   }
   const multiple=s.kind==='medicine'&&s.dose_minutes?.length;
   const dayStart=new Date(at);dayStart.setHours(0,0,0,0);
   if((multiple?dayStart:at)>end)break;
   const doses=multiple?[...new Set(s.dose_minutes)].sort((a,b)=>a-b).map(minutes=>{const dose=new Date(at);dose.setHours(Math.floor(minutes/60),minutes%60,0,0);return dose}):[at];
   for(const dose of doses){
    const key=s.id+'|'+dose.toISOString();
    if(dose>=from&&dose<=end&&dose>=start)result.push({schedule:s,at:dose,key,status:done.get(key)});
   }
   if(s.repeat_rule==='none')break;
  }
 }
 return result.sort((a,b)=>+a.at-+b.at);
}
export function monthBills(schedules:Schedule[], month:Date, completions:Completion[]=[]){
 return occurrences(schedules,new Date(month.getFullYear(),month.getMonth(),1),new Date(month.getFullYear(),month.getMonth()+1,1,0,0,0,-1),completions).filter(o=>o.schedule.kind==='bill');
}
export function plannedAlerts(items:Occurrence[], now:Date){
 return items.filter(o=>!o.status).flatMap(o=>{
  const offsets=o.schedule.kind==='medicine'?[10,5,0]:o.schedule.kind==='bill'?[4320]:[60,10];
  return offsets.map(minutes=>({occurrence:o,at:new Date(+o.at-minutes*60000),minutes}));
 }).filter(a=>a.at>now).sort((a,b)=>+a.at-+b.at);
}

export function todayMedicines(items:Occurrence[], now:Date){
 return items.filter(o=>o.schedule.kind==='medicine'&&o.at.toDateString()===now.toDateString());
}
export function formatDoseTime(minutes:number){
 const hour=Math.floor(minutes/60);return `${hour%12||12}:${String(minutes%60).padStart(2,'0')} ${hour<12?'AM':'PM'}`;
}
