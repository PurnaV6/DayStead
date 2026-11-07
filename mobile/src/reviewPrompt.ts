import AsyncStorage from '@react-native-async-storage/async-storage';
import {shouldAskForReview} from './domain';

// Shows Google Play's (or Apple's) own review prompt after a good moment. No custom "rate us" screen and
// no rewards, as store rules require. Kept on this phone only; failures are ignored.
const FIRST_USE='daystead.review.firstUse',LAST_ASKED='daystead.review.lastAsked';
const read=async(key:string)=>{const v=Number(await AsyncStorage.getItem(key));return Number.isFinite(v)&&v>0?v:null};

// Remembers when DayStead was first used on this phone, so the prompt waits about a week.
export async function noteAppUse(){
 try{if(!(await read(FIRST_USE)))await AsyncStorage.setItem(FIRST_USE,String(Date.now()))}catch{}
}

// Call only after a good moment (a bill paid or a dose taken on time), never in setup, the paywall or for a missed item.
export async function askForReviewIfDue(){
 try{
  const now=Date.now();
  if(!shouldAskForReview(now,await read(FIRST_USE),await read(LAST_ASKED)))return;
  // Loaded only here, so a development build made before this module was added cannot crash on start.
  const StoreReview=await import('expo-store-review');
  if(!(await StoreReview.isAvailableAsync())||!(await StoreReview.hasAction()))return;
  await AsyncStorage.setItem(LAST_ASKED,String(now));
  // A short pause lets the tick animation finish before the store's sheet appears.
  setTimeout(()=>{void StoreReview.requestReview().catch(()=>{})},1200);
 }catch{}
}
