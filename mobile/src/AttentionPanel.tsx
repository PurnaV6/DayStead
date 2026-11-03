import React,{useEffect,useState} from 'react';
import {Alert,Platform,Pressable,StyleSheet,View} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {CountUp,FadeIn,PressableScale,PulseOnce} from './motion';
import {Text} from './Text';
import DateTimePicker from '@react-native-community/datetimepicker';
import {supabase} from './supabase';
import {attentionStart,isMissed,occurrences,pounds} from './domain';
import type {Schedule,Completion,Occurrence} from './domain';
export function AttentionPanel({userId,schedules,done,now,onComplete,busy}:{userId:string;schedules:Schedule[];done:Completion[];now:Date;onComplete:(o:Occurrence,status:string)=>Promise<void>;busy:boolean}){
 const [dismissed,setDismissed]=useState<string[]>([]),[payday,setPayday]=useState(''),[savedPayday,setSavedPayday]=useState(''),[ready,setReady]=useState(false),[saving,setSaving]=useState(false),[all,setAll]=useState(false),[undo,setUndo]=useState<string|null>(null),[picking,setPicking]=useState(false);
 // Local calendar date, not toISOString(): in UK summer time a local midnight is the previous day in UTC.
 const ymd=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const todayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const pickPayday=(selected:Date)=>{const value=ymd(selected);setPayday(value);void persist(dismissed,value)};
 useEffect(()=>{let active=true;supabase.from('daystead_preferences').select('*').eq('user_id',userId).maybeSingle().then(({data,error})=>{if(!active)return;if(error){Alert.alert('Preferences unavailable',error.message);return}setDismissed(data?.dismissed||[]);setPayday(data?.payday||'');setSavedPayday(data?.payday||'');setReady(true)});return()=>{active=false}},[userId]);
 async function persist(keys:string[],date:string){setSaving(true);try{const {error}=await supabase.from('daystead_preferences').upsert({user_id:userId,dismissed:keys.slice(-500),payday:date||null});if(error)throw error;setDismissed(keys.slice(-500));setSavedPayday(date);return true}catch(e){Alert.alert('Could not save',(e as Error).message);return false}finally{setSaving(false)}}
 const start=new Date(now.getFullYear(),now.getMonth(),1),end=new Date(+now+3*86400000);
 // Unpaid bills from the last 35 days stay here, so a bill missed late last month is not lost on the 1st.
 const items=occurrences(schedules,attentionStart(now),end,done).filter(o=>!o.status);
 const today=items.filter(o=>o.at.toDateString()===now.toDateString());
 const attention=items.filter(o=>!dismissed.includes(o.key)&&(o.schedule.kind==='bill'||o.at.toDateString()===now.toDateString())).sort((a,b)=>Number(isMissed(b,now))-Number(isMissed(a,now))||Number(!!b.schedule.priority)-Number(!!a.schedule.priority)||+a.at-+b.at);
 const missedCount=attention.filter(o=>isMissed(o,now)).length;
 const dateEnd=savedPayday?new Date(savedPayday+'T23:59:59'):null;
 const beforePayday=dateEnd&&dateEnd>=now?occurrences(schedules,start,dateEnd,done).filter(o=>o.schedule.kind==='bill'&&!o.status):[];
 const doses=today.filter(o=>o.schedule.kind==='medicine').length,appts=today.filter(o=>o.schedule.kind==='appointment').length,todos=today.filter(o=>o.schedule.kind==='todo').length;
 const soon=items.filter(o=>o.schedule.kind==='bill'&&o.at>=now).reduce((n,o)=>n+(o.schedule.amount_pence||0),0);
 const when=(d:Date)=>d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})+(d.getHours()||d.getMinutes()?', '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'');
 const paydayLong=savedPayday?new Date(savedPayday+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}):'';
 return <View style={{gap:14}}>
  <View style={a.card}>
   <Text style={a.heading}>Today at a glance</Text>
   <View style={a.stats}>
    {([[doses,doses===1?'dose to record':'doses to record'],[appts,appts===1?'appointment':'appointments'],[todos,todos===1?'to-do':'to-dos']] as [number,string][]).map(([n,label])=><View key={label} style={a.stat}><Text style={a.statNumber}>{n}</Text><Text style={a.statLabel}>{label}</Text></View>)}
   </View>
   <Text style={a.body}>{soon?<><Text style={{fontWeight:'600'}}>{pounds(soon)}</Text> in unpaid bills due in the next 3 days.</>:'No unpaid bills due in the next 3 days.'}</Text>
  </View>
  <View style={a.titleRow}><Text style={a.heading}>Needs your attention</Text>{attention.length>0&&<Text style={a.small}>{attention.length} {attention.length===1?'item':'items'}</Text>}</View>
  {missedCount>0&&<Text style={a.missedNote}>{missedCount} missed {missedCount===1?'item':'items'}, shown first</Text>}
  {attention.slice(0,all?attention.length:3).map((o,i)=>{const missed=isMissed(o,now);const verb=o.schedule.kind==='bill'?'Mark paid':o.schedule.kind==='medicine'?'Mark taken':'Mark done';return <FadeIn key={o.key} delay={Math.min(i,6)*55}><View style={[a.item,missed&&a.missed]}>
   {missed&&<View accessible accessibilityLabel={o.schedule.kind==='bill'?'Missed payment':'Missed dose'} style={a.tagRow}><PulseOnce id={o.key} style={a.dot}/><Text style={a.tag}>{o.schedule.kind==='bill'?'Missed · not marked paid':'Missed dose · not marked taken'}</Text></View>}
   <View style={a.itemTop}>
    <View style={{flex:1,gap:3}}><Text style={a.itemTitle}>{o.schedule.priority?'★ ':''}{o.schedule.title}</Text><Text style={a.small}>{when(o.at)}{o.schedule.for_person?' · For '+o.schedule.for_person:''}</Text></View>
    {o.schedule.kind==='bill'&&<Text style={a.amount}>{pounds(o.schedule.amount_pence||0)}</Text>}
    <Pressable accessibilityRole="button" accessibilityLabel={'Dismiss '+o.schedule.title+' from your attention list'} hitSlop={6} disabled={!ready||saving} style={a.dismiss} onPress={()=>void persist([...dismissed,o.key],savedPayday).then(ok=>{if(ok)setUndo(o.key)})}><Feather name="x" size={18} color="#718078"/></Pressable>
   </View>
   <PressableScale accessibilityRole="button" disabled={busy} style={[a.action,busy&&{opacity:.45}]} onPress={()=>void onComplete(o,o.schedule.kind==='bill'?'paid':o.schedule.kind==='medicine'?'taken':'completed')}><Text style={a.actionText}>{verb}</Text></PressableScale>
  </View></FadeIn>})}
  {attention.length>3&&<Pressable accessibilityRole="button" onPress={()=>setAll(!all)} style={a.linkRow}><Text style={a.link}>{all?'Show fewer':'View all '+attention.length}</Text></Pressable>}
  {!attention.length&&<View style={a.calm}><Text style={a.itemTitle}>You’re all caught up</Text><Text style={a.small}>Nothing needs your attention right now.</Text></View>}
  {undo&&<View style={a.undo}><Text style={{color:'white',flex:1}}>Card dismissed</Text><Pressable accessibilityRole="button" disabled={saving} hitSlop={8} onPress={()=>void persist(dismissed.filter(k=>k!==undo),savedPayday).then(ok=>{if(ok)setUndo(null)})}><Text style={{color:'#E9B44C',fontWeight:'700'}}>Undo</Text></Pressable></View>}
  <Text style={a.small}>Dismissing a card does not complete it or turn off its reminders.</Text>
  <View style={a.payday}>
   <Text style={a.heading}>Money needed before payday</Text>
   <Pressable accessibilityRole="button" accessibilityLabel="Choose your next payday" disabled={!ready||saving} onPress={()=>setPicking(!picking)} style={a.picker}><Text style={{color:'#193D31',flex:1}}>{payday?'Payday · '+new Date(payday+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long'}):'Choose your next payday'}</Text><Text style={a.link}>{picking?'Done':saving?'Saving…':'Change'}</Text></Pressable>
   {picking&&<DateTimePicker value={payday?new Date(payday+'T12:00:00'):todayStart} mode="date" display={Platform.OS==='ios'?'inline':'calendar'} minimumDate={todayStart} maximumDate={new Date(+todayStart+366*86400000)} accentColor="#2D6554" onChange={(event,selected)=>{if(Platform.OS==='android')setPicking(false);if(event.type==='dismissed'||!selected)return;pickPayday(selected)}}/>}
   {dateEnd&&dateEnd>=now?<><CountUp id="payday" style={a.bigNumber} value={beforePayday.reduce((n,o)=>n+(o.schedule.amount_pence||0),0)} format={pounds}/><Text style={a.small}>Unpaid bills you have entered, from the start of this month up to and including {paydayLong}. Based on your bills, not your bank balance. Bills missed before this month are not included.</Text></>:<Text style={a.body}>Set your next payday to see how much to keep aside.</Text>}
  </View>
 </View>;
}

const a=StyleSheet.create({
 card:{backgroundColor:'white',borderWidth:1,borderColor:'#E4E8DF',borderRadius:22,padding:20,gap:14},
 heading:{fontSize:18,fontWeight:'600',color:'#193D31'},
 body:{fontSize:15,lineHeight:22,color:'#193D31'},
 small:{fontSize:13,lineHeight:19,color:'#5E6E66'},
 stats:{flexDirection:'row',flexWrap:'wrap',gap:8},
 stat:{flexDirection:'row',alignItems:'baseline',gap:6,backgroundColor:'#F7F7F0',borderRadius:18,paddingHorizontal:14,paddingVertical:8},
 statNumber:{fontSize:20,fontWeight:'700',color:'#193D31'},
 statLabel:{fontSize:14,color:'#193D31'},
 titleRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline',marginTop:4},
 missedNote:{color:'#B3261E',fontWeight:'600',fontSize:14},
 item:{backgroundColor:'white',borderRadius:22,padding:18,gap:12,borderWidth:1,borderColor:'#E4E8DF'},
 missed:{backgroundColor:'#FDF0EE',borderColor:'#E8B4AC',borderLeftWidth:6,borderLeftColor:'#B3261E'},
 tagRow:{flexDirection:'row',alignItems:'center',gap:8},
 dot:{width:10,height:10,borderRadius:5,backgroundColor:'#B3261E'},
 tag:{color:'#B3261E',fontWeight:'700',fontSize:12},
 itemTop:{flexDirection:'row',alignItems:'flex-start',gap:10},
 itemTitle:{fontSize:16,fontWeight:'600',color:'#193D31'},
 amount:{fontSize:16,fontWeight:'600',color:'#193D31'},
 dismiss:{width:44,height:44,marginTop:-10,marginRight:-10,alignItems:'center',justifyContent:'center'},
 action:{minHeight:44,borderRadius:22,backgroundColor:'#EDF2E9',alignItems:'center',justifyContent:'center'},
 actionText:{color:'#193D31',fontWeight:'600',fontSize:15},
 linkRow:{minHeight:44,justifyContent:'center'},
 link:{color:'#2D6554',fontWeight:'600',fontSize:15},
 calm:{backgroundColor:'#EDF2E9',borderRadius:22,padding:18,gap:4},
 undo:{flexDirection:'row',alignItems:'center',backgroundColor:'#193D31',borderRadius:16,paddingHorizontal:16,minHeight:48},
 payday:{backgroundColor:'#E3EBDF',padding:20,borderRadius:22,gap:12},
 picker:{backgroundColor:'white',paddingHorizontal:16,minHeight:50,borderRadius:14,flexDirection:'row',alignItems:'center'},
 bigNumber:{fontSize:34,fontWeight:'600',color:'#193D31',letterSpacing:-1},
});
