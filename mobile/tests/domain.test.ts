import {test} from 'node:test';
import assert from 'node:assert/strict';
import {occurrences,monthBills,plannedAlerts,todayMedicines,nativeAlarmCandidates} from '../src/domain.ts';
import type {Schedule} from '../src/domain.ts';
const base:Schedule={id:'bill1',user_id:'u1',kind:'bill',title:'Rent',category:'Rent',amount_pence:95000,due_at:new Date(2026,0,31,9).toISOString(),repeat_rule:'monthly',end_at:null,notes:'',version:1};
test('month end recurrence clamps February and returns to March 31',()=>{
 const items=occurrences([base],new Date(2026,1,1),new Date(2026,3,1));
 assert.deepEqual(items.map(o=>[o.at.getMonth(),o.at.getDate()]),[[1,28],[2,31]]);
});
test('completion belongs to one occurrence, not future monthly payments',()=>{
 const feb=monthBills([base],new Date(2026,1,1))[0];
 const items=occurrences([base],new Date(2026,1,1),new Date(2026,3,1),[{schedule_id:base.id,occurrence_at:feb.at.toISOString(),status:'paid'}]);
 assert.equal(items[0].status,'paid');assert.equal(items[1].status,undefined);
});
test('three alerts for medicine and no alerts for a completed dose',()=>{
 const med={...base,kind:'medicine' as const,repeat_rule:'none' as const,due_at:new Date(2026,1,1,12).toISOString()};
 const items=occurrences([med],new Date(2026,1,1),new Date(2026,1,2));
 assert.deepEqual(plannedAlerts(items,new Date(2026,1,1,11)).map(a=>a.minutes),[10,5,0]);
 assert.equal(plannedAlerts([{...items[0],status:'taken'}],new Date(2026,1,1,11)).length,0);
});
test('course end excludes future doses and daily recurrence keeps clock time across DST',()=>{
 const med={...base,kind:'medicine' as const,repeat_rule:'daily' as const,due_at:new Date(2026,2,28,8).toISOString(),end_at:new Date(2026,2,30,23,59).toISOString()};
 const items=occurrences([med],new Date(2026,2,28),new Date(2026,3,2));
 assert.equal(items.length,3);assert.ok(items.every(o=>o.at.getHours()===8));
});
test('bill reminder is three days before and past alerts are not rescheduled',()=>{
 const items=monthBills([base],new Date(2026,0,1));
 const alerts=plannedAlerts(items,new Date(2026,0,1));
 assert.equal(alerts[0].at.getDate(),28);
 assert.equal(plannedAlerts(items,new Date(2026,0,30)).length,0);
});

test('custom medicine times repeat every day and stay independently completable',()=>{
 const med={...base,kind:'medicine' as const,repeat_rule:'daily' as const,due_at:new Date(2026,9,29,0).toISOString(),dose_minutes:[7*60+15,13*60+40,22*60+5]};
 const items=occurrences([med],new Date(2026,9,29),new Date(2026,9,30,23,59,59));
 assert.equal(items.length,6);
 assert.deepEqual(items.slice(0,3).map(o=>[o.at.getHours(),o.at.getMinutes()]),[[7,15],[13,40],[22,5]]);
 const done=occurrences([med],new Date(2026,9,29),new Date(2026,9,30,23,59,59),[{schedule_id:med.id,occurrence_at:items[0].at.toISOString(),status:'taken'}]);
 assert.equal(done.filter(o=>o.status==='taken').length,1);
 assert.equal(plannedAlerts(items,new Date(2026,9,29,0)).length,18);
});

test('Today only shows same-day medicine doses, including midnight boundaries',()=>{
 const med={...base,kind:'medicine' as const,repeat_rule:'daily' as const,due_at:new Date(2026,9,28,0).toISOString(),dose_minutes:[0,8*60,14*60,20*60,1439]};
 const now=new Date(2026,9,29,12);
 const all=occurrences([med,base],new Date(2026,9,28),new Date(2026,10,30));
 const today=todayMedicines(all,now);
 assert.equal(today.length,5);assert.ok(today.every(o=>o.at.toDateString()===now.toDateString()));
 assert.equal(todayMedicines(all,new Date(2026,9,30,0)).length,5);
});

test('multi-time schedules respect course end, deduplicate times and preserve DST clock times',()=>{
 const med={...base,kind:'medicine' as const,repeat_rule:'daily' as const,due_at:new Date(2026,2,28,0).toISOString(),dose_minutes:[480,840,1200,480],end_at:new Date(2026,2,30,14).toISOString()};
 const items=occurrences([med],new Date(2026,2,28),new Date(2026,3,2));
 assert.equal(items.length,8);assert.equal(new Set(items.map(o=>o.key)).size,8);
 assert.deepEqual(items.map(o=>o.at.getHours()),[8,14,20,8,14,20,8,14]);
});

test('legacy medicine records retain their exact single occurrence timestamp',()=>{
 const med={...base,kind:'medicine' as const,repeat_rule:'daily' as const,due_at:new Date(2026,9,29,8,12,34).toISOString(),dose_minutes:null};
 const items=occurrences([med],new Date(2026,9,29),new Date(2026,9,29,23,59));
 assert.equal(items.length,1);assert.equal(items[0].at.toISOString(),med.due_at);
});


test('native alarms include only explicitly selected uncompleted medication occurrences',()=>{
 const med={...base,kind:'medicine' as const,reminder_mode:'alarm' as const,repeat_rule:'daily' as const,dose_minutes:[480,840]};
 const items=occurrences([med],new Date(2026,1,1),new Date(2026,1,3));
 const candidates=nativeAlarmCandidates([...items,{...items[0],schedule:{...med,reminder_mode:'gentle'}},{...items[0],schedule:base}],2);
 assert.equal(candidates.length,2);assert.ok(candidates[0].at<=candidates[1].at);
 assert.equal(nativeAlarmCandidates(items.map(o=>({...o,status:'taken'}))).length,0);
 assert.equal(nativeAlarmCandidates(items).length,items.length);
});
test('to-do recurrence and completion use the same occurrence identity as appointments',()=>{
 const todo={...base,kind:'todo' as const,repeat_rule:'weekly' as const};
 const items=occurrences([todo],new Date(2026,0,31),new Date(2026,1,15));
 const completed=occurrences([todo],new Date(2026,0,31),new Date(2026,1,15),[{schedule_id:todo.id,occurrence_at:items[0].at.toISOString(),status:'completed'}]);
 assert.equal(completed[0].status,'completed');assert.equal(completed[1].status,undefined);
});
