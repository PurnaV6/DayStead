import * as Notifications from 'expo-notifications';
import {alarmStatus,replaceAlarms} from './alarm';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Occurrence, plannedAlerts, nativeAlarmCandidates, missedFollowUps} from './domain';

Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:false})});
export async function enableReminders(){
 // AndroidImportance is a runtime enum re-exported by Expo 58; import/namespace misses that .types export.
 // eslint-disable-next-line import/namespace
 if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('daystead',{name:'DayStead reminders',importance:Notifications.AndroidImportance.HIGH,sound:'default'});
 const permission=await Notifications.requestPermissionsAsync();
 return permission.granted;
}
// Serialize reconciliation so rapid refreshes cannot duplicate pending notifications.
let pending=Promise.resolve();
// Trial-end warning. reconcileReminders cancels every scheduled notification, so the
// warning is re-added inside each reconcile run rather than scheduled independently.
const TRIAL_ID='daystead-trial-end',TRIAL_NOTICE_DAYS=3;
let trial:{endsAt:number;price:string}|null=null;
async function scheduleTrialWarning(){
 if(!trial)return;
 const at=trial.endsAt-TRIAL_NOTICE_DAYS*86400000;
 if(at<=Date.now()+60000||!(await Notifications.getPermissionsAsync()).granted)return;
 const day=new Date(trial.endsAt).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
 await Notifications.scheduleNotificationAsync({identifier:TRIAL_ID,content:{title:'Your free month ends soon',body:`Your DayStead trial ends on ${day}. You'll be charged ${trial.price} then unless you cancel before it ends. If you've already cancelled, you won't be charged.`,sound:'default'},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(at),channelId:'daystead'}});
}
// Pass null when there is no trial that will turn into a charge (not trialling, or already cancelled).
export function setTrialWarning(next:{endsAt:Date;price:string}|null){
 trial=next?{endsAt:+next.endsAt,price:next.price}:null;
 const run=async()=>{await Notifications.cancelScheduledNotificationAsync(TRIAL_ID).catch(()=>{});await scheduleTrialWarning();};
 const result=pending.then(run,run);pending=result.then(()=>{},()=>{});return result;
}
// Reminder check notices (a test, and the restart check). Like the trial warning, they are re-added after each
// reconcile cancels everything, so refreshing the app cannot wipe them. At most 2, keeping iOS under 64 pending.
const checks=new Map<string,{at:number;body:string}>();
// The restart check must survive the app being closed and the phone restarting, so it is also saved on the phone.
export const RESTART_ID='daystead:restart-test',RESTART_KEY='daystead.restartCheck',RESTART_BODY='Restart check: this reminder arrived. Open DayStead to finish.';
async function scheduleChecks(){
 try{const v=await AsyncStorage.getItem(RESTART_KEY);const r=v?JSON.parse(v) as {dueAt:number;result?:string}:null;if(r&&!r.result&&!checks.has(RESTART_ID))checks.set(RESTART_ID,{at:r.dueAt,body:RESTART_BODY})}catch{}
 for(const [id,c] of checks){
  if(c.at<=Date.now()+1000){checks.delete(id);continue}
  await Notifications.scheduleNotificationAsync({identifier:id,content:{title:'DayStead reminder',body:c.body,sound:'default'},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(c.at),channelId:'daystead'}});
 }
}
export function scheduleCheckReminder(id:string,at:number,body:string){
 checks.set(id,{at,body});
 const run=async()=>{await Notifications.cancelScheduledNotificationAsync(id).catch(()=>{});await scheduleChecks();};
 const result=pending.then(run,run);pending=result.then(()=>{},()=>{});return result;
}
export function reconcileReminders(items:Occurrence[], enabled:boolean){
 const run=async()=>{
  await Notifications.cancelAllScheduledNotificationsAsync();
  // A billing notice, not a schedule reminder: kept even when schedule reminders are off.
  await scheduleTrialWarning();
  await scheduleChecks();
  if(!enabled){await replaceAlarms([]);return {count:0,through:null,alarmNote:''};}
  const permission=await Notifications.getPermissionsAsync();
  if(!permission.granted){await replaceAlarms([]);return {count:0,through:null,alarmNote:'Notifications are not allowed.'};}
  // Bounded development queue. A production server scheduler is required before launch.
  const status=await alarmStatus();
  const alarmItems=nativeAlarmCandidates(items,items.length);
  const nativeReady=status==='authorized';
  let alarmNote=alarmItems.length&&!nativeReady?'Alarm unavailable ('+status+'); using gentle reminders.':'';
  let nativeItems=nativeReady?alarmItems.slice(0,48):[];
  try { await replaceAlarms(nativeItems.map(o=>({key:o.key,at:+o.at}))); }
  catch(error) { await replaceAlarms([]); nativeItems=[]; alarmNote='Native alarm scheduling failed; using gentle reminders. '+(error instanceof Error?error.message:'Check phone settings.'); }
  if(nativeItems.length)alarmNote=`${nativeItems.length} native alarms retained or scheduled. Alarm coverage through ${nativeItems[nativeItems.length-1].at.toLocaleDateString('en-GB')}.`;
  const nativeKeys=new Set(nativeItems.map(o=>o.key));
  const alerts=plannedAlerts(items,new Date()).filter(a=>!(a.minutes===0&&nativeKeys.has(a.occurrence.key))).slice(0,48);
  for(const alert of alerts)await Notifications.scheduleNotificationAsync({
   identifier:alert.occurrence.key+'|'+alert.minutes,
   content:{title:'DayStead reminder',body:'You have a scheduled item. Open DayStead to review it.',sound:'default',data:{scheduleId:alert.occurrence.schedule.id,occurrenceAt:alert.occurrence.at.toISOString()}},
   trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:alert.at,channelId:'daystead'}
  });
  // One red follow-up if a bill or dose is still unmarked. Wording stays generic, like the other reminders, so the lock screen does not reveal bills or medicines. Capped so the total stays under iOS's 64 pending notifications.
  // The red accent shows on Android; iOS does not allow coloured notifications.
  for(const follow of missedFollowUps(items,new Date()).slice(0,12))await Notifications.scheduleNotificationAsync({
   identifier:follow.occurrence.key+'|missed',
   content:{title:'Missed: DayStead reminder',body:'Something due earlier has not been marked as done. Open DayStead to review it.',sound:'default',color:'#B3261E',data:{scheduleId:follow.occurrence.schedule.id,occurrenceAt:follow.occurrence.at.toISOString()}},
   trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:follow.at,channelId:'daystead'}
  });
  return {count:alerts.length,through:alerts.at(-1)?.at??null,alarmNote};
 };
 const result=pending.then(run,run);pending=result.then(()=>{},()=>{});return result;
}
export async function snooze(item:Occurrence){
 if(!(await Notifications.getPermissionsAsync()).granted)throw new Error('Allow phone notifications before snoozing.');
 await Notifications.scheduleNotificationAsync({content:{title:'DayStead reminder',body:'Your snoozed item is ready to review.',sound:'default',data:{scheduleId:item.schedule.id}},trigger:{type:Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,seconds:300,channelId:'daystead'}});
}
