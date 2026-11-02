import React,{useEffect,useState,useSyncExternalStore,type ReactNode} from 'react';
import {AccessibilityInfo,Animated,Dimensions,Easing,Pressable,type PressableProps,type StyleProp,type ViewStyle} from 'react-native';
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
