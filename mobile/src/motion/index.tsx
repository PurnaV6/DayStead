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
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced){v.setValue(1);return}
  v.setValue(0);
  const a=Animated.timing(v,{toValue:1,duration:t.enter,delay,easing:ease.out,useNativeDriver:true});a.start();
  return()=>a.stop();
 },[trigger,reduced,delay,v]);
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
export function CountUp({value,format,style,duration=650}:{value:number;format:(n:number)=>string;style?:StyleProp<TextStyle>;duration?:number}){
 // Starts at zero so the total counts up when the screen opens, then moves smoothly on each change.
 const v=useState(()=>new Animated.Value(0))[0];
 const [shown,setShown]=useState(0);
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced){v.setValue(value);return}
  const id=v.addListener(({value:n})=>setShown(n));
  const a=Animated.timing(v,{toValue:value,duration,easing:ease.out,useNativeDriver:false});a.start();
  return()=>{a.stop();v.removeListener(id)};
 },[value,reduced,duration,v]);
 return <Text style={style} accessibilityLabel={format(value)}>{format(Math.round(reduced?value:shown))}</Text>;
}

// A small tick that pops in once when an item is marked done.
export function Tick({children}:{children:ReactNode}){
 const v=useState(()=>new Animated.Value(0))[0];
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced){v.setValue(1);return}
  Animated.timing(v,{toValue:1,duration:t.enter,easing:ease.out,useNativeDriver:true}).start();
 },[reduced,v]);
 return <Animated.View style={{opacity:v,transform:[{scale:v.interpolate({inputRange:[0,1],outputRange:[0.6,1]})}]}}>{children}</Animated.View>;
}

// A dot that pulses once when it first appears, then stays still (for missed items).
export function PulseOnce({style}:{style:StyleProp<ViewStyle>}){
 const v=useState(()=>new Animated.Value(0))[0];
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced)return;
  Animated.sequence([Animated.timing(v,{toValue:1,duration:260,easing:ease.out,useNativeDriver:true}),Animated.timing(v,{toValue:0,duration:340,easing:ease.soft,useNativeDriver:true})]).start();
 },[reduced,v]);
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
