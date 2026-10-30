import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import {Occurrence, plannedAlerts} from './domain';

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
export function reconcileReminders(items:Occurrence[], enabled:boolean){
 const run=async()=>{
  await Notifications.cancelAllScheduledNotificationsAsync();
  if(!enabled)return {count:0,through:null};
  const permission=await Notifications.getPermissionsAsync();
  if(!permission.granted)return {count:0,through:null};
  // Bounded development queue. A production server scheduler is required before launch.
  const alerts=plannedAlerts(items,new Date()).slice(0,48);
  for(const alert of alerts)await Notifications.scheduleNotificationAsync({
   identifier:alert.occurrence.key+'|'+alert.minutes,
   content:{title:'Daystead reminder',body:'You have a scheduled item. Open Daystead to review it.',sound:'default',data:{scheduleId:alert.occurrence.schedule.id,occurrenceAt:alert.occurrence.at.toISOString()}},
   trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:alert.at,channelId:'daystead'}
  });
  return {count:alerts.length,through:alerts.at(-1)?.at??null};
 };
 const result=pending.then(run,run);pending=result.then(()=>{},()=>{});return result;
}
export async function snooze(item:Occurrence){
 if(!(await Notifications.getPermissionsAsync()).granted)throw new Error('Allow phone notifications before snoozing.');
 await Notifications.scheduleNotificationAsync({content:{title:'Daystead reminder',body:'Your snoozed item is ready to review.',sound:'default',data:{scheduleId:item.schedule.id}},trigger:{type:Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,seconds:300,channelId:'daystead'}});
}
