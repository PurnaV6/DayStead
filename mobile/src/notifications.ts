import * as Notifications from 'expo-notifications';
import {alarmStatus,replaceAlarms} from './alarm';
import {Platform} from 'react-native';
import {Occurrence, plannedAlerts, nativeAlarmCandidates} from './domain';

Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:false})});
export async function enableReminders(){
 // AndroidImportance is a runtime enum re-exported by Expo 58; import/namespace misses that .types export.
 // eslint-disable-next-line import/namespace
 if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('daystead',{name:'Daystead reminders',importance:Notifications.AndroidImportance.HIGH,sound:'default'});
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
 await Notifications.scheduleNotificationAsync({identifier:TRIAL_ID,content:{title:'Your free month ends soon',body:`Your Daystead trial ends on ${day}. You'll be charged ${trial.price} then unless you cancel before it ends.`,sound:'default'},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(at),channelId:'daystead'}});
}
// Pass null when there is no trial that will turn into a charge (not trialling, or already cancelled).
export function setTrialWarning(next:{endsAt:Date;price:string}|null){
 trial=next?{endsAt:+next.endsAt,price:next.price}:null;
 const run=async()=>{await Notifications.cancelScheduledNotificationAsync(TRIAL_ID).catch(()=>{});await scheduleTrialWarning();};
 const result=pending.then(run,run);pending=result.then(()=>{},()=>{});return result;
}
export function reconcileReminders(items:Occurrence[], enabled:boolean){
 const run=async()=>{
  await Notifications.cancelAllScheduledNotificationsAsync();
  // A billing notice, not a schedule reminder: kept even when schedule reminders are off.
  await scheduleTrialWarning();
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
   content:{title:'Daystead reminder',body:'You have a scheduled item. Open Daystead to review it.',sound:'default',data:{scheduleId:alert.occurrence.schedule.id,occurrenceAt:alert.occurrence.at.toISOString()}},
   trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:alert.at,channelId:'daystead'}
  });
  return {count:alerts.length,through:alerts.at(-1)?.at??null,alarmNote};
 };
 const result=pending.then(run,run);pending=result.then(()=>{},()=>{});return result;
}
export async function snooze(item:Occurrence){
 if(!(await Notifications.getPermissionsAsync()).granted)throw new Error('Allow phone notifications before snoozing.');
 await Notifications.scheduleNotificationAsync({content:{title:'Daystead reminder',body:'Your snoozed item is ready to review.',sound:'default',data:{scheduleId:item.schedule.id}},trigger:{type:Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,seconds:300,channelId:'daystead'}});
}
