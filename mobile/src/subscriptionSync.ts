import {supabase} from './supabase';
import {billingConfigured} from './billing';

// Asks the server to read this account's store subscription now, instead of waiting for the store's
// webhook. Used after a purchase or restore, and when a save is refused for "no subscription yet".
// Returns true when the server now records access. Never throws: the webhook still catches up later.
export async function syncSubscription():Promise<boolean>{
 if(!billingConfigured)return false;
 try{
  const {data,error}=await supabase.functions.invoke('sync-daystead-subscription',{body:{}});
  return !error&&['trialing','active','grace'].includes(data?.status);
 }catch{return false}
}
