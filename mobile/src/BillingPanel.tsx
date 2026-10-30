import React,{useEffect,useState} from 'react';
import {AppState,Linking,Pressable,Text,View} from 'react-native';
import type {CustomerInfo,PurchasesPackage} from 'react-native-purchases';
import {billingConfigured,connectBilling,getBillingInfo,hasPremium,premiumId,purchasePlan,restorePurchases,watchBilling} from './billing';
export function useBilling(userId?:string){
 const [state,setState]=useState<{userId?:string;info:CustomerInfo|null;plans:PurchasesPackage[];error:string;loading:boolean}>({info:null,plans:[],error:'',loading:false});
 useEffect(()=>{
  if(!userId||!billingConfigured)return;
  let active=true,stop:undefined|(()=>void),refreshing=false;
  const refresh=async()=>{if(refreshing)return;refreshing=true;try{
   const offers=await connectBilling(userId);const next=await getBillingInfo();
   if(active){setState({userId,info:next,plans:offers.current?.availablePackages.filter(p=>p.packageType==='MONTHLY'||p.packageType==='ANNUAL')||[],error:'',loading:false});if(!stop)stop=watchBilling(info=>{if(active)setState(previous=>({...previous,userId,info}))})}
  }catch(e){if(active)setState(previous=>({...previous,userId,error:e instanceof Error?e.message:'Unable to load subscriptions.',loading:false,info:previous.userId===userId?previous.info:null}))}finally{refreshing=false}};
  void refresh();const sub=AppState.addEventListener('change',value=>{if(value==='active')void refresh()});
  return()=>{active=false;stop?.();sub.remove()};
 },[userId]);
 const matching=state.userId===userId;
 const info=matching?state.info:null;
 return {info,plans:matching?state.plans:[],error:matching?state.error:'',loading:billingConfigured&&!!userId&&!matching,setInfo:(next:CustomerInfo)=>setState(previous=>({...previous,userId,info:next})),active:hasPremium(info)};
}
export function BillingPanel({billing}: {billing:ReturnType<typeof useBilling>}){
 const [selected,setSelected]=useState('ANNUAL'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const plan=billing.plans.find(p=>p.packageType===selected);
 const entitlement=billing.info?.entitlements.all[premiumId];
 const run=async(restore=false)=>{setBusy(true);setMessage('');try{const info=restore?await restorePurchases():(await purchasePlan(plan!)).customerInfo;billing.setInfo(info);setMessage(hasPremium(info)?'Premium access is active.':'No active subscription was found. If a purchase is pending, access will update after the store confirms it.')}catch(e){if(!(e as {userCancelled?:boolean}).userCancelled)setMessage(e instanceof Error?e.message:'The store could not complete this request.')}finally{setBusy(false)}};
 const button=(label:string,action:()=>void,disabled=false)=><Pressable accessibilityRole="button" disabled={disabled} onPress={action} style={{padding:16,borderRadius:14,backgroundColor:disabled?'#DCE2D9':'#2D6554',alignItems:'center'}}><Text style={{color:disabled?'#56635B':'white',fontWeight:'600'}}>{label}</Text></Pressable>;
 return <View style={{backgroundColor:'white',padding:20,borderRadius:22,gap:16}}>
  <Text style={{fontSize:22,fontWeight:'600',color:'#193D31'}}>Daystead Premium</Text>
  <Text>Bill and medicine schedules, appointments and monthly bill insights.</Text>
  <Text>{!billingConfigured?'Preview · no payment will be taken':billing.loading?'Checking your subscription…':billing.active?'Premium active':'No active subscription'}</Text>
  {!!entitlement?.expirationDate&&<Text>{billing.active?'Access until':'Last access ended'}: {new Date(entitlement.expirationDate).toLocaleDateString('en-GB')}</Text>}
  {!!entitlement?.billingIssueDetectedAt&&<Text style={{color:'#A95348'}}>Your store reported a payment problem. Update your payment method below. Access follows your confirmed store entitlement.</Text>}
  {(billingConfigured?billing.plans:[{identifier:'monthly',packageType:'MONTHLY',product:{priceString:'£4.99'}},{identifier:'annual',packageType:'ANNUAL',product:{priceString:'£49.99'}}]).map(p=><Pressable accessibilityRole="radio" accessibilityState={{checked:selected===p.packageType}} key={p.identifier} onPress={()=>setSelected(p.packageType)} style={{padding:18,borderWidth:2,borderColor:selected===p.packageType?'#2D6554':'#E4E8DF',borderRadius:14}}><Text style={{fontSize:19,fontWeight:'600'}}>{p.product.priceString} / {p.packageType==='ANNUAL'?'year':'month'}</Text><Text>{p.packageType==='ANNUAL'?'Billed annually':'Billed monthly'}</Text></Pressable>)}
  {billingConfigured&&!billing.loading&&!billing.plans.length&&<Text>Subscriptions are unavailable. Please try again later.</Text>}
  {button(billingConfigured?'Continue with selected plan':'Purchases awaiting store setup',()=>void run(),!billingConfigured||busy||billing.loading||!plan)}
  {button('Restore purchases',()=>void run(true),!billingConfigured||busy||billing.loading)}
  {button('Manage or cancel subscription',()=>{const url=billing.info?.managementURL;if(url)void Linking.openURL(url).catch(()=>setMessage('Unable to open your store. Manage subscriptions in your Apple or Google account settings.'))},!billing.info?.managementURL||busy)}
  <Text style={{fontSize:12,lineHeight:19,color:'#617168'}}>Subscriptions renew automatically unless cancelled through your store. Payment and any eligible introductory offer are confirmed in the store purchase sheet. Cancellation normally retains access until the paid period ends. Deleting your Daystead account does not cancel store billing.</Text>
  {!billingConfigured&&<Text style={{fontSize:12}}>Proposed UK prices in GBP. Live billing displays the price and currency supplied by your store; no introductory trial is promised until configured.</Text>}
  {!!(message||billing.error)&&<Text accessibilityLiveRegion="polite">{message||billing.error}</Text>}
 </View>;
}
