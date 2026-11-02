import React,{useEffect,useState,useSyncExternalStore,type ReactNode} from 'react';
import {AccessibilityInfo,Animated,Dimensions,Easing,Pressable,View,type PressableProps,type StyleProp,type TextStyle,type ViewStyle} from 'react-native';
import {Text} from '../Text';
import * as Haptics from 'expo-haptics';

// DayStead's shared motion kit. Same feel as the website: quick, calm ease-out movement,
// transform and opacity only, nothing bouncy, and everything turns off with Reduce Motion.
export const ease={out:Easing.bezier(0.22,1,0.36,1),soft:Easing.bezier(0.33,1,0.68,1)};
export const t={press:140,ui:240,enter:380,sheet:320};

// The phone's Reduce Motion setting, read once and shared by every animated element.
let reducedNow=false;
const listeners=new Set<()=>void>();
const setReduced=(v:boolean)=>{reducedNow=v;listeners.forEach(l=>l())};
AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(()=>{});
AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);
const subscribe=(l:()=>void)=>{listeners.add(l);return()=>{listeners.delete(l)}};
export function useReducedMotion(){return useSyncExternalStore(subscribe,()=>reducedNow,()=>false)}

// Small physical feedback on key moments. Failures are ignored: haptics are a nice-to-have.
export const haptic={
 tap:()=>{void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})},
 select:()=>{void Haptics.selectionAsync().catch(()=>{})},
 success:()=>{void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{})},
};

// A Pressable that gives slightly under the finger. Use it for buttons, tiles and chips.
// The style (position, flex, size) stays on the touchable itself, so the tap area matches what you see.
const AnimatedPressable=Animated.createAnimatedComponent(Pressable);
export function PressableScale({style,children,scaleTo=0.97,onPressIn,onPressOut,...props}:Omit<PressableProps,'style'|'children'>&{style?:StyleProp<ViewStyle>;children?:ReactNode;scaleTo?:number}){
 const scale=useState(()=>new Animated.Value(1))[0];
 const reduced=useReducedMotion();
 const to=(v:number,d:number)=>Animated.timing(scale,{toValue:v,duration:reduced?0:d,easing:ease.out,useNativeDriver:true}).start();
 return <AnimatedPressable {...props} style={[style,{transform:[{scale}]}]} onPressIn={e=>{to(scaleTo,t.press);onPressIn?.(e)}} onPressOut={e=>{to(1,t.ui);onPressOut?.(e)}}>{children}</AnimatedPressable>;
}

// Content that fades and rises in when it first appears, or when `trigger` changes (for example the tab).
export function FadeIn({children,trigger,delay=0,style}:{children:ReactNode;trigger?:unknown;delay?:number;style?:StyleProp<ViewStyle>}){
 const v=useState(()=>new Animated.Value(0))[0];
 // The delay is fixed when the content first appears, so a card that moves up a list does not fade again.
 const [firstDelay]=useState(delay);
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced){v.setValue(1);return}
  v.setValue(0);
  const a=Animated.timing(v,{toValue:1,duration:t.enter,delay:firstDelay,easing:ease.out,useNativeDriver:true});a.start();
  return()=>a.stop();
 },[trigger,reduced,firstDelay,v]);
 return <Animated.View style={[style,{opacity:v,transform:[{translateY:v.interpolate({inputRange:[0,1],outputRange:[10,0]})}]}]}>{children}</Animated.View>;
}

// A bottom sheet that slides up over a soft backdrop. Render it inside a transparent Modal with
// animationType="none" and visible={mounted}; it slides in when open turns true and unmounts after sliding away.
export function useSheet(open:boolean){
 const v=useState(()=>new Animated.Value(0))[0];
 const reduced=useReducedMotion();
 const [mounted,setMounted]=useState(open),[prevOpen,setPrevOpen]=useState(open);
 // Show as soon as it opens (React's "adjust state when a prop changes" pattern); the slide-away below unmounts it.
 if(open!==prevOpen){setPrevOpen(open);if(open)setMounted(true)}
 useEffect(()=>{
  if(open){Animated.timing(v,{toValue:1,duration:reduced?0:t.sheet,easing:ease.out,useNativeDriver:true}).start();return}
  Animated.timing(v,{toValue:0,duration:reduced?0:t.ui,easing:ease.soft,useNativeDriver:true}).start(({finished})=>{if(finished)setMounted(false)});
 },[open,reduced,v]);
 return {
  mounted,
  backdrop:{opacity:v},
  sheet:{transform:[{translateY:v.interpolate({inputRange:[0,1],outputRange:[Dimensions.get('window').height,0]})}]},
 };
}

// For code outside components (for example before a layout animation).
export const isReducedMotion=()=>reducedNow;

// A number that counts up (or down) to its new value. `format` turns the number into text.
const counted=new Set<string>();
export function CountUp({id,value,format,style,duration=650}:{id:string;value:number;format:(n:number)=>string;style?:StyleProp<TextStyle>;duration?:number}){
 // Counts up from zero the first time this total appears in a session; after that it starts at its value
 // and only moves smoothly when the value changes, so switching tabs never shows a wrong total.
 const [start]=useState(()=>counted.has(id)?value:0);
 const v=useState(()=>new Animated.Value(start))[0];
 const [shown,setShown]=useState(start);
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced){v.setValue(value);return}
  counted.add(id);
  const sub=v.addListener(({value:n})=>setShown(n));
  const a=Animated.timing(v,{toValue:value,duration,easing:ease.out,useNativeDriver:false});a.start();
  return()=>{a.stop();v.removeListener(sub)};
 },[value,reduced,duration,v,id]);
 return <Text style={style} accessibilityLabel={format(value)}>{format(Math.round(reduced?value:shown))}</Text>;
}

// Items marked done in the last few seconds, so their tick pops only then (not on every screen open).
const justDone=new Map<string,number>();
export const markJustDone=(key:string)=>{justDone.set(key,Date.now())};
// A small tick that pops in when an item has just been marked done.
export function Tick({id,children}:{id:string;children:ReactNode}){
 const [v]=useState(()=>new Animated.Value(1));
 const reduced=useReducedMotion();
 useEffect(()=>{
  const at=justDone.get(id);justDone.delete(id);
  if(reduced||!at||Date.now()-at>5000)return;
  v.setValue(0);
  Animated.timing(v,{toValue:1,duration:t.enter,easing:ease.out,useNativeDriver:true}).start();
 },[reduced,v,id]);
 return <Animated.View style={{opacity:v,transform:[{scale:v.interpolate({inputRange:[0,1],outputRange:[0.6,1]})}]}}>{children}</Animated.View>;
}

// A dot that pulses once the first time an item shows as missed in a session, then stays still.
const pulsed=new Set<string>();
export function PulseOnce({id,style}:{id:string;style:StyleProp<ViewStyle>}){
 const v=useState(()=>new Animated.Value(0))[0];
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced||pulsed.has(id))return;
  pulsed.add(id);
  Animated.sequence([Animated.timing(v,{toValue:1,duration:260,easing:ease.out,useNativeDriver:true}),Animated.timing(v,{toValue:0,duration:340,easing:ease.soft,useNativeDriver:true})]).start();
 },[reduced,v,id]);
 return <Animated.View style={[style,{transform:[{scale:v.interpolate({inputRange:[0,1],outputRange:[1,1.7]})}]}]}/>;
}

// Reveals its content left to right once, like a chart being drawn. `cover` is the background colour behind it.
export function DrawIn({children,cover='white'}:{children:ReactNode;cover?:string}){
 const v=useState(()=>new Animated.Value(0))[0];
 const [w,setW]=useState(0);
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(!w)return;
  if(reduced){v.setValue(1);return}
  Animated.timing(v,{toValue:1,duration:700,easing:ease.out,useNativeDriver:true}).start();
 },[w,reduced,v]);
 return <View onLayout={e=>setW(e.nativeEvent.layout.width)} style={{overflow:'hidden'}}>
  {children}
  {!reduced&&<Animated.View pointerEvents="none" style={{position:'absolute',top:0,bottom:0,left:0,width:w||9999,backgroundColor:cover,transform:[{translateX:v.interpolate({inputRange:[0,1],outputRange:[0,w||9999]})}]}}/>}
 </View>;
}

// Turns gently into place once, like a donut chart filling in.
export function SpinIn({children}:{children:ReactNode}){
 const v=useState(()=>new Animated.Value(0))[0];
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced){v.setValue(1);return}
  Animated.timing(v,{toValue:1,duration:650,easing:ease.out,useNativeDriver:true}).start();
 },[reduced,v]);
 return <Animated.View style={{opacity:v,transform:[{rotate:v.interpolate({inputRange:[0,1],outputRange:['-40deg','0deg']})},{scale:v.interpolate({inputRange:[0,1],outputRange:[0.9,1]})}]}}>{children}</Animated.View>;
}

// Soft placeholder shapes while records load, breathing gently. Static with Reduce Motion.
export function Placeholder({heights=[150,84,84,84]}:{heights?:number[]}){
 const v=useState(()=>new Animated.Value(0))[0];
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced)return;
  const loop=Animated.loop(Animated.sequence([Animated.timing(v,{toValue:1,duration:700,easing:ease.soft,useNativeDriver:true}),Animated.timing(v,{toValue:0,duration:700,easing:ease.soft,useNativeDriver:true})]));
  loop.start();return()=>loop.stop();
 },[reduced,v]);
 return <View accessible accessibilityLabel="Loading your day" style={{gap:14}}>
  {heights.map((h,i)=><Animated.View key={i} style={{height:h,borderRadius:22,backgroundColor:i===0?'#DCE5D9':'#ECEFE7',opacity:v.interpolate({inputRange:[0,1],outputRange:[1,0.55]})}}/>)}
 </View>;
}
