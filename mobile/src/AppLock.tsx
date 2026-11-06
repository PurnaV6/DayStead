import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Image,StyleSheet,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text} from './Text';
import {FadeIn,PressableScale,haptic} from './motion';
import {shouldRelock} from './domain';

// Optional app lock with the phone's fingerprint, face or PIN. Off by default and kept on this phone only:
// nothing is sent anywhere. It only covers the screen, so reminders keep firing while DayStead is locked.
const KEY='daystead.appLock';
const C={ink:'#193D31',muted:'#5E6E66',paper:'#F7F7F0',green:'#2D6554',line:'#E4E8DF',red:'#B3261E'};

// Loaded only when needed, so a development build made before this module was added still starts.
async function auth(){try{return await import('expo-local-authentication')}catch{return null}}
// True when the phone has a fingerprint, face or screen lock (PIN, pattern or password) set up.
export async function canUseAppLock(){const a=await auth();if(!a)return false;try{return (await a.getEnrolledLevelAsync())>a.SecurityLevel.NONE}catch{return false}}
async function verify(message:string){const a=await auth();if(!a)return false;try{return (await a.authenticateAsync({promptMessage:message,cancelLabel:'Cancel'})).success}catch{return false}}

export function useAppLock(signedIn:boolean){
 const [enabled,setEnabled]=useState<boolean|null>(null),[locked,setLocked]=useState(true);
 const backgroundAt=useRef<number|null>(null),enabledRef=useRef(false),verifying=useRef(false);
 useEffect(()=>{let active=true;AsyncStorage.getItem(KEY).then(v=>{if(!active)return;const on=v==='on';enabledRef.current=on;setEnabled(on);if(!on)setLocked(false)}).catch(()=>{if(active){setEnabled(false);setLocked(false)}});return()=>{active=false}},[]);
 useEffect(()=>{
  const sub=AppState.addEventListener('change',state=>{
   // The phone's own PIN screen can briefly send DayStead to the background; that must not relock it.
   if(verifying.current)return;
   if(state==='background')backgroundAt.current=Date.now();
   else if(state==='active'){if(shouldRelock(enabledRef.current,backgroundAt.current,Date.now()))setLocked(true);backgroundAt.current=null}
  });
  return()=>sub.remove();
 },[]);
 const check=useCallback(async(message:string)=>{verifying.current=true;try{return await verify(message)}finally{verifying.current=false;backgroundAt.current=AppState.currentState==='active'?null:Date.now()}},[]);
 const unlock=useCallback(async()=>{
  // If the phone no longer has a screen lock, the check can never pass. Removing a phone's lock already needs
  // its PIN, so let the user in and turn app lock off rather than shut them out of their own records.
  if(!(await canUseAppLock())){await AsyncStorage.setItem(KEY,'off').catch(()=>{});enabledRef.current=false;setEnabled(false);setLocked(false);return}
  if(await check('Unlock DayStead')){haptic.success();setLocked(false)}
 },[check]);
 const setOn=useCallback(async(on:boolean)=>{
  // Confirm with the phone's own check before turning it on or off, so someone else cannot change it.
  if(!(await check(on?'Turn on app lock':'Turn off app lock')))return false;
  await AsyncStorage.setItem(KEY,on?'on':'off');enabledRef.current=on;setEnabled(on);return true;
 },[check]);
 return {enabled:!!enabled,ready:enabled!==null,locked:signedIn&&(enabled===null||(enabled&&locked)),unlock,setOn};
}

export function LockScreen({ready,onUnlock}:{ready:boolean;onUnlock:()=>Promise<void>}){
 const [asking,setAsking]=useState(false);
 const ask=useCallback(async()=>{setAsking(true);try{await onUnlock()}finally{setAsking(false)}},[onUnlock]);
 // Ask straight away when the lock appears; the button is there if the user cancels.
 useEffect(()=>{if(!ready)return;const t=setTimeout(()=>void ask(),300);return()=>clearTimeout(t)},[ready,ask]);
 return <View style={l.screen}>
  <FadeIn style={l.inner}>
   <Image source={require('../assets/logo-mark.png')} style={{width:56,height:54}} accessibilityIgnoresInvertColors/>
   {ready&&<>
    <Text style={l.title} accessibilityRole="header">DayStead is locked</Text>
    <Text style={l.body}>Use your fingerprint, face or phone PIN to open it. Your reminders still arrive while it is locked.</Text>
    <PressableScale accessibilityRole="button" accessibilityState={{disabled:asking}} disabled={asking} onPress={()=>void ask()} style={[l.button,asking&&{opacity:.45}]}><Text style={{color:'white',fontWeight:'600',fontSize:15}}>{asking?'Please wait…':'Unlock'}</Text></PressableScale>
   </>}
  </FadeIn>
 </View>;
}

export function AppLockSetting({enabled,onChange}:{enabled:boolean;onChange:(on:boolean)=>Promise<boolean>}){
 const [available,setAvailable]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[note,setNote]=useState('');
 useEffect(()=>{let active=true;void canUseAppLock().then(v=>{if(active)setAvailable(v)});return()=>{active=false}},[]);
 async function toggle(){setBusy(true);setNote('');haptic.tap();try{if(!(await onChange(!enabled)))setNote('Not changed. Please try again.')}finally{setBusy(false)}}
 return <View style={l.card}>
  <Text style={l.heading}>App lock</Text>
  <Text style={l.cardBody}>{enabled?'On. DayStead asks for your fingerprint, face or phone PIN when it opens, and after 1 minute away.':'Ask for your fingerprint, face or phone PIN when DayStead opens. Useful on a shared phone.'}</Text>
  {available===false&&!enabled?<Text style={l.small}>Set up a screen lock in your phone settings first. If you have one, this needs the latest version of DayStead.</Text>
   :<PressableScale accessibilityRole="button" accessibilityState={{disabled:busy||available===null}} disabled={busy||available===null} onPress={()=>void toggle()} style={[l.secondary,busy&&{opacity:.45}]}><Text style={{color:C.ink,fontWeight:'600',fontSize:15}}>{busy?'Please wait…':enabled?'Turn off app lock':'Turn on app lock'}</Text></PressableScale>}
  {!!note&&<Text style={[l.small,{color:C.red}]} accessibilityLiveRegion="polite">{note}</Text>}
  <Text style={l.small}>Stays on this phone only. Nothing is sent anywhere.</Text>
 </View>;
}

const l=StyleSheet.create({
 screen:{flex:1,backgroundColor:C.paper,justifyContent:'center',padding:28},
 inner:{alignItems:'center',gap:16},
 title:{fontSize:28,fontWeight:'700',letterSpacing:-.5,color:C.ink,textAlign:'center'},
 body:{fontSize:15,lineHeight:22,color:C.ink,textAlign:'center'},
 button:{minHeight:50,minWidth:200,borderRadius:25,backgroundColor:C.green,alignItems:'center',justifyContent:'center',paddingHorizontal:24,marginTop:8},
 cardBody:{fontSize:15,lineHeight:22,color:C.ink},
 card:{backgroundColor:'white',borderWidth:1,borderColor:C.line,borderRadius:22,padding:20,gap:12},
 heading:{fontSize:18,fontWeight:'700',color:C.ink},
 small:{fontSize:13,lineHeight:19,color:C.muted},
 secondary:{minHeight:50,borderRadius:25,backgroundColor:'#EDF2E9',alignItems:'center',justifyContent:'center',paddingHorizontal:16},
});
