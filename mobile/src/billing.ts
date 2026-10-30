import {Platform} from 'react-native';
import Purchases,{CustomerInfo, PurchasesPackage} from 'react-native-purchases';
const key=Platform.OS==='ios'?process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY:process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
export const billingConfigured=Boolean(key)&&process.env.EXPO_PUBLIC_ENABLE_BILLING==='true';
export const premiumId='premium';
let configuredUser:string|null=null;
export async function connectBilling(userId:string){
 if(!billingConfigured||!key)throw new Error('Store billing is not enabled in this build.');
 if(!configuredUser){Purchases.configure({apiKey:key,appUserID:userId});configuredUser=userId;}
 else if(configuredUser!==userId){await Purchases.logIn(userId);configuredUser=userId;}
 return Purchases.getOfferings();
}
export const getBillingInfo=()=>Purchases.getCustomerInfo();
export const hasPremium=(info:CustomerInfo|null)=>Boolean(info?.entitlements.active[premiumId]);
export async function purchasePlan(plan:PurchasesPackage){
 if(!configuredUser||!billingConfigured)throw new Error('Connect store billing first.');
 return Purchases.purchasePackage(plan);
}
export async function restorePurchases(){
 if(!configuredUser||!billingConfigured)throw new Error('Connect store billing first.');
 return Purchases.restorePurchases();
}
export const watchBilling=(listener:(info:CustomerInfo)=>void)=>{
 Purchases.addCustomerInfoUpdateListener(listener);
 return()=>Purchases.removeCustomerInfoUpdateListener(listener);
};
