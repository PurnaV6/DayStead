import React,{useEffect,useState} from 'react';
import {AppState,Linking,Pressable,Text,View} from 'react-native';
import type {CustomerInfo,PurchasesPackage} from 'react-native-purchases';
import {billingConfigured,connectBilling,freeTrialLabel,iosTrialEligibility,priceForEntitlement,getBillingInfo,hasPremium,premiumId,purchasePlan,restorePurchases,watchBilling} from './billing';
import {setTrialWarning} from './notifications';
export function useBilling(userId?:string){
 const [state,setState]=useState<{userId?:string;info:CustomerInfo|null;plans:PurchasesPackage[];eligible:Record<string,boolean>;error:string;loading:boolean}>({info:null,plans:[],eligible:{},error:'',loading:false});
 useEffect(()=>{
  if(!userId||!billingConfigured)return;
  let active=true,stop:undefined|(()=>void),refreshing=false;
  const refresh=async()=>{if(refreshing)return;refreshing=true;try{
   const offers=await connectBilling(userId);const next=await getBillingInfo();
   const plans=offers.current?.availablePackages.filter(p=>p.packageType==='MONTHLY'||p.packageType==='ANNUAL')||[];
   // If Apple can't answer, show no trial rather than risk promising one the store won't give.
   const eligible=await iosTrialEligibility(plans).catch(()=>({}));
   if(active){setState({userId,info:next,plans,eligible,error:'',loading:false});if(!stop)stop=watchBilling(info=>{if(active)setState(previous=>({...previous,userId,info}))})}
  }catch(e){if(active)setState(previous=>({...previous,userId,error:e instanceof Error?e.message:'Unable to load subscriptions.',loading:false,info:previous.userId===userId?previous.info:null}))}finally{refreshing=false}};
  void refresh();const sub=AppState.addEventListener('change',value=>{if(value==='active')void refresh()});
  return()=>{active=false;stop?.();sub.remove()};
 },[userId]);
 const matching=state.userId===userId;
 const info=matching?state.info:null;
 const plans=matching?state.plans:[];
 // Warn 3 days before a free trial turns into a charge. Cleared when not trialling, already cancelled, or signed out.
 const trialing=info?.entitlements.active[premiumId];
 const trialEnd=trialing?.periodType==='TRIAL'&&trialing.willRenew&&trialing.expirationDate?trialing.expirationDate:null;
 const trialPrice=priceForEntitlement(plans,trialing?.productIdentifier)||'the subscription price';
 useEffect(()=>{void setTrialWarning(trialEnd?{endsAt:new Date(trialEnd),price:trialPrice}:null).catch(()=>{})},[trialEnd,trialPrice]);
 return {info,plans,eligible:matching?state.eligible:{},error:matching?state.error:'',loading:billingConfigured&&!!userId&&!matching,setInfo:(next:CustomerInfo)=>setState(previous=>({...previous,userId,info:next})),active:hasPremium(info)};
}
// Preview builds have no store products; these mirror the planned UK prices.
const previewPlans=[{identifier:'monthly',packageType:'MONTHLY',product:{priceString:'£3.99',price:3.99,currencyCode:'GBP'}},{identifier:'annual',packageType:'ANNUAL',product:{priceString:'£35.99',price:35.99,currencyCode:'GBP'}}];
// "£11.89 (25%)": what a year of monthly payments costs over the annual plan, in the store's currency.
function savingLabel(monthly?:{price:number;currencyCode:string},annual?:{price:number;currencyCode:string}){
 if(!monthly||!annual||monthly.currencyCode!==annual.currencyCode)return null;
 const saved=monthly.price*12-annual.price;
 if(saved<=0)return null;
 const amount=new Intl.NumberFormat('en-GB',{style:'currency',currency:annual.currencyCode}).format(saved);
 return `${amount} (${Math.round(saved/(monthly.price*12)*100)}%)`;
}
export function BillingPanel({billing}: {billing:ReturnType<typeof useBilling>}){
 const [selected,setSelected]=useState('ANNUAL'),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const plan=billing.plans.find(p=>p.packageType===selected);
 const entitlement=billing.info?.entitlements.all[premiumId];
 // Stores give intro trials to first-time subscribers only, so anyone with any past
 // entitlement is not offered one (the store would charge them immediately).
 const subscribedBefore=!!entitlement;
 // Preview builds have no store products, so show the planned offer.
 const trialFor=(p:PurchasesPackage|{packageType:string})=>subscribedBefore?null:billingConfigured?freeTrialLabel(p as PurchasesPackage,billing.eligible[(p as PurchasesPackage).product.identifier]):'1 month free';
 const selectedTrial=plan?trialFor(plan):billingConfigured||subscribedBefore?null:'1 month free';
 const inTrial=billing.active&&entitlement?.periodType==='TRIAL'&&!!entitlement.expirationDate;
 const trialEndDay=inTrial?new Date(entitlement!.expirationDate!).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
 const trialPrice=priceForEntitlement(billing.plans,entitlement?.productIdentifier);
 const shown=billingConfigured?billing.plans:previewPlans;
 const annualSaving=savingLabel(shown.find(p=>p.packageType==='MONTHLY')?.product,shown.find(p=>p.packageType==='ANNUAL')?.product);
 const run=async(restore=false)=>{setBusy(true);setMessage('');try{const info=restore?await restorePurchases():(await purchasePlan(plan!)).customerInfo;billing.setInfo(info);setMessage(hasPremium(info)?'Premium access is active.':'No active subscription was found. If a purchase is pending, access will update after the store confirms it.')}catch(e){if(!(e as {userCancelled?:boolean}).userCancelled)setMessage(e instanceof Error?e.message:'The store could not complete this request.')}finally{setBusy(false)}};
 const button=(label:string,action:()=>void,disabled=false)=><Pressable accessibilityRole="button" disabled={disabled} onPress={action} style={{padding:16,borderRadius:14,backgroundColor:disabled?'#DCE2D9':'#2D6554',alignItems:'center'}}><Text style={{color:disabled?'#56635B':'white',fontWeight:'600'}}>{label}</Text></Pressable>;
 return <View style={{backgroundColor:'white',padding:20,borderRadius:22,gap:16}}>
  <Text style={{fontSize:22,fontWeight:'600',color:'#193D31'}}>Daystead Premium</Text>
  <Text>Bill and medicine schedules, appointments and monthly bill insights.</Text>
  <Text>{!billingConfigured?'Preview · no payment will be taken':billing.loading?'Checking your subscription…':billing.active?'Premium active':'No active subscription'}</Text>
  {inTrial?<View style={{backgroundColor:'#EDF2E9',padding:14,borderRadius:12,gap:6}}><Text style={{fontWeight:'600',color:'#193D31'}}>Free trial ends {trialEndDay}</Text><Text>{entitlement!.willRenew?`You'll be charged ${trialPrice||'the subscription price'} that day unless you cancel before it ends. We'll remind you 3 days before.`:"You've cancelled, so you won't be charged. You keep access until the trial ends."}</Text></View>:!!entitlement?.expirationDate&&<Text>{billing.active?'Access until':'Last access ended'}: {new Date(entitlement.expirationDate).toLocaleDateString('en-GB')}</Text>}
  {!!entitlement?.billingIssueDetectedAt&&<Text style={{color:'#A95348'}}>Your store reported a payment problem. Update your payment method below. Access follows your confirmed store entitlement.</Text>}
  {(billingConfigured?billing.plans:previewPlans).map(p=><Pressable accessibilityRole="radio" accessibilityState={{checked:selected===p.packageType}} key={p.identifier} onPress={()=>setSelected(p.packageType)} style={{padding:18,borderWidth:2,borderColor:selected===p.packageType?'#2D6554':'#E4E8DF',borderRadius:14}}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8}}><Text style={{fontSize:19,fontWeight:'600'}}>{p.product.priceString} / {p.packageType==='ANNUAL'?'year':'month'}</Text>{p.packageType==='ANNUAL'&&!!annualSaving&&<View style={{backgroundColor:'#DDEBDD',borderRadius:20,paddingHorizontal:10,paddingVertical:4}}><Text style={{color:'#193D31',fontWeight:'600',fontSize:12}}>Save {annualSaving}</Text></View>}</View><Text>{trialFor(p)?`${billingConfigured?'':'Planned: '}${trialFor(p)}, then billed ${p.packageType==='ANNUAL'?'yearly':'monthly'}`:p.packageType==='ANNUAL'?'Billed yearly':'Billed monthly'}</Text></Pressable>)}
  {billingConfigured&&!billing.loading&&!billing.plans.length&&<Text>Subscriptions are unavailable. Please try again later.</Text>}
  {button(!billingConfigured?'Purchases awaiting store setup':selectedTrial&&!billing.active?`Try ${selectedTrial}`:'Continue with selected plan',()=>void run(),!billingConfigured||busy||billing.loading||!plan)}
  {button('Restore purchases',()=>void run(true),!billingConfigured||busy||billing.loading)}
  {button('Manage or cancel subscription',()=>{const url=billing.info?.managementURL;if(url)void Linking.openURL(url).catch(()=>setMessage('Unable to open your store. Manage subscriptions in your Apple or Google account settings.'))},!billing.info?.managementURL||busy)}
  <Text style={{fontSize:12,lineHeight:19,color:'#617168'}}>Subscriptions renew automatically unless cancelled through your store. Payment and any eligible introductory offer are confirmed in the store purchase sheet. Cancellation normally retains access until the paid period ends. Deleting your Daystead account does not cancel store billing.</Text>
  {!!selectedTrial&&!billing.active&&<Text style={{fontSize:12,lineHeight:19,color:'#617168'}}>{billingConfigured?'':'Planned launch offer: '}New subscribers get {selectedTrial}. Cancel any time before the trial ends and you won’t be charged. Your store confirms whether you’re eligible before you subscribe.</Text>}
  {!billingConfigured&&<Text style={{fontSize:12}}>Proposed UK prices in GBP. Live billing displays the price, currency and trial supplied by your store.</Text>}
  {!!(message||billing.error)&&<Text accessibilityLiveRegion="polite">{message||billing.error}</Text>}
 </View>;
}
