import React,{useEffect,useState} from 'react';
import {Alert,BackHandler,Platform,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {supabase} from './supabase';

// First-run guide shown after sign-up: payday, first bill, reminders. Every step can be skipped.
// It replaces the tabs (it is not a Modal) so the bill form's own Modal can open on top of it.
const C={ink:'#193D31',muted:'#718078',paper:'#F7F7F0',green:'#2D6554',line:'#E4E8DF',soft:'#EDF2E9',picked:'#DDEBDD'};
// Local calendar date, not toISOString(): in UK summer time a local midnight is the previous day in UTC.
const ymd=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const STEPS=3;

type Props={userId:string;firstBill:string|null;remindersOn:boolean;templates:[string,string][];onAddBill:(template?:[string,string])=>void;onTurnOnReminders:()=>Promise<void>;onClose:()=>void};

export function SetupGuide({userId,firstBill,remindersOn,templates,onAddBill,onTurnOnReminders,onClose}:Props){
 const [step,setStep]=useState(0),[payday,setPayday]=useState(''),[picking,setPicking]=useState(Platform.OS==='ios'),[saving,setSaving]=useState(false),[asking,setAsking]=useState(false);
 const now=new Date(),todayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 useEffect(()=>{let active=true;supabase.from('daystead_preferences').select('payday').eq('user_id',userId).maybeSingle().then(({data})=>{if(active&&data?.payday&&new Date(data.payday+'T23:59:59')>=new Date())setPayday(p=>p||data.payday)});return()=>{active=false}},[userId]);
 // Android back goes to the previous step; on the first step it closes the guide.
 useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(step>0)setStep(step-1);else onClose();return true});return()=>sub.remove()},[step,onClose]);
 const next=()=>{if(step<STEPS-1)setStep(step+1);else onClose()};
 async function savePayday(){
  if(!payday){next();return}
  setSaving(true);
  // Only the payday column is sent, so an existing row keeps its dismissed cards.
  try{const {error}=await supabase.from('daystead_preferences').upsert({user_id:userId,payday});if(error)throw error;next()}
  catch(e){Alert.alert('Could not save your payday',(e as Error).message+' You can set it later on the Today page.')}
  finally{setSaving(false)}
 }
 async function reminders(){setAsking(true);try{await onTurnOnReminders()}finally{setAsking(false)}}
 const paydayLabel=payday?new Date(payday+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}):'';
 return <View style={g.overlay} accessibilityViewIsModal>
  <View style={g.top}>
   <Text style={g.eyebrow}>STEP {step+1} OF {STEPS}</Text>
   <Pressable accessibilityRole="button" accessibilityLabel="Skip setup" onPress={onClose} style={g.skipAll}><Text style={g.link}>Skip setup</Text></Pressable>
  </View>
  <View style={g.bars} accessible accessibilityLabel={`Step ${step+1} of ${STEPS}`}>{Array.from({length:STEPS},(_,i)=><View key={i} style={[g.bar,i<=step&&{backgroundColor:C.green}]}/>)}</View>
  <ScrollView contentContainerStyle={g.body}>
   {step===0&&<>
    <Text style={g.title} accessibilityRole="header">When are you next paid?</Text>
    <Text style={g.text}>Daystead adds up the bills due before then, so you know how much to keep aside.</Text>
    {Platform.OS!=='ios'&&<Pressable accessibilityRole="button" accessibilityLabel={payday?'Payday '+paydayLabel+'. Change':'Choose your next payday'} onPress={()=>setPicking(true)} style={g.field}><Text style={{color:C.ink,fontSize:15}}>{payday?paydayLabel:'Choose your next payday'}</Text><Text style={g.link}>{payday?'Change':'Choose'}</Text></Pressable>}
    {picking&&<DateTimePicker value={payday?new Date(payday+'T12:00:00'):new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)} mode="date" display={Platform.OS==='ios'?'inline':'calendar'} minimumDate={todayStart} maximumDate={new Date(+todayStart+366*86400000)} accentColor={C.green} onChange={(event,selected)=>{if(Platform.OS==='android')setPicking(false);if(event.type==='dismissed'||!selected)return;setPayday(ymd(selected))}}/>}
    {Platform.OS==='ios'&&!!payday&&<Text style={g.text}>Payday: {paydayLabel}</Text>}
    <Primary title={saving?'Saving…':'Save and continue'} disabled={!payday||saving} onPress={()=>void savePayday()}/>
   </>}
   {step===1&&<>
    <Text style={g.title} accessibilityRole="header">Add your first bill</Text>
    {firstBill?<View style={g.doneBox}><Text style={g.doneText}>✓ {firstBill} added</Text><Text style={g.text}>Add more any time with the + button.</Text></View>:<>
     <Text style={g.text}>Pick a common one to start. You add the amount and the date it is due.</Text>
     <View style={g.chips}>{templates.map(t=><Pressable key={t[0]} accessibilityRole="button" accessibilityLabel={'Add '+t[0]} onPress={()=>onAddBill(t)} style={g.chip}><Text style={{color:C.ink,fontSize:15}}>{t[0]}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel="Add a different bill" onPress={()=>onAddBill()} style={g.chip}><Text style={{color:C.green,fontSize:15,fontWeight:'600'}}>Something else</Text></Pressable></View>
    </>}
    {firstBill&&<Primary title="Continue" onPress={next}/>}
   </>}
   {step===2&&<>
    <Text style={g.title} accessibilityRole="header">Turn on reminders</Text>
    <Text style={g.text}>We remind you 3 days before a bill is due, and at each medicine time you set.</Text>
    <Text style={g.text}>Reminders say “Daystead reminder”, so your lock screen never shows what a bill or medicine is.</Text>
    {remindersOn?<><View style={g.doneBox}><Text style={g.doneText}>✓ Reminders are on for this phone</Text></View><Primary title="Finish" onPress={onClose}/></>:<Primary title={asking?'Please wait…':'Turn on reminders'} disabled={asking} onPress={()=>void reminders()}/>}
   </>}
   <View style={g.footer}>
    {step>0?<Pressable accessibilityRole="button" onPress={()=>setStep(step-1)} style={g.textButton}><Text style={g.link}>Back</Text></Pressable>:<View/>}
    {!(step===1&&firstBill)&&!(step===2&&remindersOn)&&<Pressable accessibilityRole="button" accessibilityLabel={step===STEPS-1?'Skip for now and finish':'Skip this step'} onPress={next} style={g.textButton}><Text style={g.link}>Skip for now</Text></Pressable>}
   </View>
   <Text style={g.small}>You can change all of this later.</Text>
  </ScrollView>
 </View>;
}

function Primary({title,onPress,disabled=false}:{title:string;onPress:()=>void;disabled?:boolean}){return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[g.primary,disabled&&{opacity:.45}]}><Text style={{color:'white',fontWeight:'600',fontSize:15}}>{title}</Text></Pressable>}

const g=StyleSheet.create({
 overlay:{flex:1,backgroundColor:C.paper,paddingTop:12},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:22},
 eyebrow:{fontSize:12,letterSpacing:1.5,color:C.muted,fontWeight:'600'},
 skipAll:{minHeight:44,minWidth:44,justifyContent:'center',paddingHorizontal:4},
 bars:{flexDirection:'row',gap:6,paddingHorizontal:22,marginTop:4},
 bar:{flex:1,height:4,borderRadius:2,backgroundColor:C.line},
 body:{padding:22,gap:16,paddingBottom:40},
 title:{fontSize:30,fontWeight:'700',letterSpacing:-.5,color:C.ink},
 text:{fontSize:15,lineHeight:22,color:C.ink},
 small:{fontSize:12,color:C.muted,textAlign:'center'},
 link:{color:C.green,fontWeight:'600',fontSize:15},
 field:{backgroundColor:'white',borderWidth:1,borderColor:C.line,borderRadius:14,minHeight:52,paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 chips:{flexDirection:'row',flexWrap:'wrap',gap:10},
 chip:{minHeight:44,justifyContent:'center',paddingHorizontal:16,borderRadius:22,backgroundColor:'white',borderWidth:1,borderColor:C.line},
 doneBox:{backgroundColor:C.soft,borderRadius:18,padding:16,gap:6},
 doneText:{fontSize:16,fontWeight:'600',color:C.green},
 primary:{minHeight:50,borderRadius:14,backgroundColor:C.green,alignItems:'center',justifyContent:'center',paddingHorizontal:16},
 footer:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 textButton:{minHeight:44,minWidth:44,justifyContent:'center'},
});
