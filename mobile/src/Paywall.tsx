import React from 'react';
import {Image,ScrollView,StyleSheet,View} from 'react-native';
import type {PurchasesPackage} from 'react-native-purchases';
import {freeTrialLabel} from './billing';
import {Text} from './Text';
import {BillingPanel,useBilling} from './BillingPanel';
import {AccountTools} from './AccountTools';
import {FadeIn,PressableScale} from './motion';

// Shown instead of the app when billing is live and the account has no active free month or
// subscription. Records stay saved; the user can start the free month, restore a purchase,
// export their data, delete their account or sign out.
export function Paywall({billing,email,busy,onSignOut,onDeleted}:{billing:ReturnType<typeof useBilling>;email:string;busy:boolean;onSignOut:()=>void;onDeleted:()=>void}){
 const subscribedBefore=!!billing.info?.entitlements.all.premium;
 // Only promise a free month when the store actually offers one to this person (same rule as BillingPanel).
 const trialLabel=subscribedBefore?null:billing.plans.map(plan=>freeTrialLabel(plan as PurchasesPackage,billing.eligible[plan.product.identifier])).find(Boolean)||null;
 const trial=!!trialLabel,month=trialLabel==='1 month free';
 return <ScrollView contentContainerStyle={p.content}>
  <FadeIn style={{gap:18}}>
   <View style={p.brand}><Image source={require('../assets/logo-mark.png')} style={{width:36,height:35}} accessibilityIgnoresInvertColors/><Text style={p.logo}>DayStead.</Text></View>
   <Text style={p.hero} accessibilityRole="header">{subscribedBefore?'Welcome back':trial?(month?'Start your free month':'Start your free trial'):'Choose your plan'}</Text>
   <Text style={p.body}>{subscribedBefore?'Renew your subscription to keep using DayStead. Your bills, medicines and appointments are saved and come straight back.':trial?'Bills, medicine reminders and appointments in one calm app. Try everything free'+(month?' for a month':' ('+trialLabel+')')+'; you pay nothing today and can cancel any time in your app store.':'Bills, medicine reminders and appointments in one calm app. Choose monthly or yearly; you can cancel any time in your app store.'}</Text>
   {!subscribedBefore&&<View style={p.points}>
    {['Money needed before payday, worked out for you','Medicine reminders at the times you set','Private reminders: your lock screen only says "DayStead reminder"',...(trial?['We remind you 3 days before your free '+(month?'month':'trial')+' ends']:[])].map(point=><View key={point} style={p.point}><View style={p.tick}><Text style={{color:'white',fontWeight:'700',fontSize:13}}>✓</Text></View><Text style={[p.body,{flex:1}]}>{point}</Text></View>)}
   </View>}
   <BillingPanel billing={billing}/>
   <AccountTools email={email} onDeleted={onDeleted}/>
   <PressableScale accessibilityRole="button" disabled={busy} onPress={onSignOut} style={[p.signOut,busy&&{opacity:.45}]}><Text style={{color:'#193D31',fontWeight:'600',fontSize:15}}>Sign out</Text></PressableScale>
   <Text style={p.small}>Your records are kept safe while you are not subscribed. You can export or delete them at any time.</Text>
  </FadeIn>
 </ScrollView>;
}

const p=StyleSheet.create({
 content:{padding:22,paddingBottom:48},
 brand:{flexDirection:'row',alignItems:'center',gap:10},
 logo:{fontSize:27,fontWeight:'700',letterSpacing:-1,color:'#193D31'},
 hero:{fontSize:34,lineHeight:41,fontWeight:'600',letterSpacing:-1,color:'#193D31'},
 body:{fontSize:15,lineHeight:23,color:'#193D31'},
 points:{gap:10},
 point:{flexDirection:'row',gap:12,alignItems:'flex-start'},
 tick:{width:24,height:24,borderRadius:12,backgroundColor:'#2D6554',alignItems:'center',justifyContent:'center',marginTop:1},
 signOut:{minHeight:50,borderRadius:25,backgroundColor:'#EDF2E9',alignItems:'center',justifyContent:'center'},
 small:{fontSize:13,lineHeight:19,color:'#5E6E66',textAlign:'center'},
});
