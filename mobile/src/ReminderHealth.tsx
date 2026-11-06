import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Linking,Platform,StyleSheet,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {Feather} from '@expo/vector-icons';
import {Text} from './Text';
import {FadeIn,PressableScale,haptic} from './motion';
import {alarmStatus,requestAlarmPermission,type AlarmStatus} from './alarm';
import {healthRows,restartState,type HealthAction,type HealthRow,type RestartCheck} from './reminderHealthRules';

// Plain pass/fail reminder check. Each failed row has a button to the right phone setting.
// Wording never promises reminders always arrive: phones can still delay them.
const C={ink:'#193D31',muted:'#5E6E66',green:'#2D6554',soft:'#EDF2E9',red:'#B3261E',redSoft:'#FDF0EE',line:'#E4E8DF',amber:'#8A5A00',amberSoft:'#FFF4DC'};
const TEST_ID='daystead:test',RESTART_ID='daystead:restart-test',RESTART_KEY='daystead.restartCheck',RESTART_MINUTES=3;
const android=Platform.OS==='android';

// Loaded only when needed, so a development build made before expo-battery was added still starts.
async function batteryRestricted():Promise<boolean|null>{
 if(!android)return null;
 try{const Battery=await import('expo-battery');return await Battery.isBatteryOptimizationEnabledAsync()}catch{return null}
}
async function readRestart(){try{const v=await AsyncStorage.getItem(RESTART_KEY);return v?JSON.parse(v) as {dueAt:number;result?:'passed'|'failed'}:null}catch{return null}}
const content=(body:string)=>({title:'DayStead reminder',body,sound:'default' as const});

export function ReminderHealth(){
 const [notifications,setNotifications]=useState<boolean|null>(null),[alarm,setAlarm]=useState<AlarmStatus|null>(null),[battery,setBattery]=useState<boolean|null>(null);
 const [testReceived,setTestReceived]=useState<boolean|null>(null),[testSending,setTestSending]=useState(false),[restart,setRestart]=useState<RestartCheck>('not-started');
 const testTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const check=useCallback(async()=>{
  try{setNotifications((await Notifications.getPermissionsAsync()).granted)}catch{setNotifications(null)}
  if(android){try{setAlarm(await alarmStatus())}catch{setAlarm(null)}setBattery(await batteryRestricted())}
  setRestart(restartState(await readRestart(),Date.now()));
 },[]);
 // Check on open, and again when the user comes back from phone settings.
 useEffect(()=>{
  const first=setTimeout(()=>void check(),0);
  const sub=AppState.addEventListener('change',s=>{if(s==='active')void check()});
  const got=Notifications.addNotificationReceivedListener(n=>{if(n.request.identifier===TEST_ID){if(testTimer.current)clearTimeout(testTimer.current);setTestSending(false);setTestReceived(true);haptic.success()}});
  return()=>{clearTimeout(first);sub.remove();got.remove();if(testTimer.current)clearTimeout(testTimer.current)};
 },[check]);

 async function sendTest(){
  if(!(await Notifications.getPermissionsAsync()).granted){setNotifications(false);return}
  setTestReceived(null);setTestSending(true);
  await Notifications.scheduleNotificationAsync({identifier:TEST_ID,content:content('Test: your reminder arrived.'),trigger:{type:Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,seconds:5,channelId:'daystead'}});
  // If the app was in the background the listener may miss it, so also look in the notification tray.
  testTimer.current=setTimeout(()=>{void Notifications.getPresentedNotificationsAsync().then(list=>list.some(n=>n.request.identifier===TEST_ID)).catch(()=>false).then(found=>{setTestSending(false);setTestReceived(t=>t||found)})},20000);
 }
 async function startRestart(){
  if(!(await Notifications.getPermissionsAsync()).granted){setNotifications(false);return}
  const dueAt=Date.now()+RESTART_MINUTES*60000;
  await Notifications.scheduleNotificationAsync({identifier:RESTART_ID,content:content('Restart check: this reminder arrived. Open DayStead to finish.'),trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(dueAt),channelId:'daystead'}});
  await AsyncStorage.setItem(RESTART_KEY,JSON.stringify({dueAt}));setRestart('waiting');
 }
 async function answerRestart(result:'passed'|'failed'){
  const stored=await readRestart();await AsyncStorage.setItem(RESTART_KEY,JSON.stringify({dueAt:stored?.dueAt||Date.now(),result}));
  if(result==='passed')haptic.success();setRestart(result);
 }
 async function act(kind:HealthAction){
  haptic.tap();
  try{
   if(kind==='notifications')await Linking.openSettings();
   else if(kind==='alarms')setAlarm(await requestAlarmPermission());
   else if(kind==='battery'){try{await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS')}catch{await Linking.openSettings()}}
   else if(kind==='test')await sendTest();
   else await startRestart();
  }catch{setTestSending(false)}
 }

 const rows=healthRows({android,notifications,alarm,batteryRestricted:battery,testReceived,testSending,restart});
 const failed=rows.filter(r=>r.state==='fail').length,allPass=rows.every(r=>r.state==='pass');
 return <View style={h.card}>
  <Text style={h.title} accessibilityRole="header">Reminder check</Text>
  <Text style={h.summary} accessibilityLiveRegion="polite">{allPass?'Everything looks good on this phone.':failed?`${failed} ${failed===1?'thing needs':'things need'} your attention.`:'A few quick checks on this phone.'}</Text>
  <View style={{gap:10}}>{rows.map(r=><Row key={r.key} row={r} onAct={kind=>void act(kind)} onAnswer={r.key==='restart'&&restart==='ask'?a=>void answerRestart(a):undefined}/>)}</View>
  <Text style={h.note}>Phones can still delay reminders, for example in Do Not Disturb or battery saver.</Text>
 </View>;
}

function Row({row,onAct,onAnswer}:{row:HealthRow;onAct:(k:HealthAction)=>void;onAnswer?:(a:'passed'|'failed')=>void}){
 const tone=row.state==='pass'?{icon:'check-circle' as const,color:C.green,bg:C.soft,label:'Passed'}:row.state==='fail'?{icon:'alert-circle' as const,color:C.red,bg:C.redSoft,label:'Needs attention'}:{icon:'help-circle' as const,color:C.amber,bg:C.amberSoft,label:'To check'};
 return <FadeIn trigger={row.state}><View style={[h.row,{backgroundColor:tone.bg}]} accessible={!row.action&&!onAnswer} accessibilityLabel={`${tone.label}: ${row.title}. ${row.detail}`}>
  <Feather name={tone.icon} size={22} color={tone.color} style={{marginTop:1}}/>
  <View style={{flex:1,gap:4}}>
   <Text style={h.rowTitle}>{row.title}</Text>
   <Text style={h.rowDetail}>{row.detail}</Text>
   {onAnswer?<View style={h.answers}><Small label="Yes, it arrived" onPress={()=>onAnswer('passed')} primary/><Small label="No" onPress={()=>onAnswer('failed')}/></View>
    :row.action&&<View style={h.answers}><Small label={row.action.label} hint={row.title} onPress={()=>onAct(row.action!.kind)} primary={row.state==='fail'}/></View>}
  </View>
 </View></FadeIn>;
}
function Small({label,onPress,primary=false,hint}:{label:string;onPress:()=>void;primary?:boolean;hint?:string}){
 return <PressableScale accessibilityRole="button" accessibilityHint={hint} onPress={onPress} style={[h.small,primary&&{backgroundColor:C.green,borderColor:C.green}]}><Text style={{color:primary?'white':C.ink,fontWeight:'600',fontSize:14}}>{label}</Text></PressableScale>;
}

const h=StyleSheet.create({
 card:{backgroundColor:'white',borderWidth:1,borderColor:C.line,borderRadius:22,padding:20,gap:12},
 title:{fontSize:18,fontWeight:'700',color:C.ink},
 summary:{fontSize:15,lineHeight:22,color:C.ink},
 row:{flexDirection:'row',gap:12,borderRadius:16,padding:14,alignItems:'flex-start'},
 rowTitle:{fontSize:15,fontWeight:'600',color:C.ink},
 rowDetail:{fontSize:13,lineHeight:19,color:C.muted},
 answers:{flexDirection:'row',gap:8,flexWrap:'wrap',marginTop:6},
 small:{minHeight:44,borderRadius:22,paddingHorizontal:16,justifyContent:'center',backgroundColor:'white',borderWidth:1,borderColor:C.line},
 note:{fontSize:12,lineHeight:18,color:C.muted},
});
