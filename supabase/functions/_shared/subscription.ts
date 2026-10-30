export type Subscriber={entitlements?:Record<string,{expires_date?:string|null;product_identifier?:string;grace_period_expires_date?:string|null}>,subscriptions?:Record<string,{expires_date?:string|null;grace_period_expires_date?:string|null;period_type?:string;is_sandbox?:boolean;billing_issues_detected_at?:string|null}>};
export function subscriptionState(subscriber:Subscriber,now:number,allowSandbox=false){
 const entitlement=subscriber.entitlements?.premium;
 const sub=entitlement?.product_identifier?subscriber.subscriptions?.[entitlement.product_identifier]:undefined;
 const expired={provider:'revenuecat',status:'expired',access_until:new Date(0).toISOString()};
 if(!entitlement||!sub||(!allowSandbox&&sub.is_sandbox))return expired;
 const parsed=(date?:string|null)=>date?Date.parse(date):NaN;
 const expiry=parsed(entitlement.expires_date),grace=parsed(sub.grace_period_expires_date||entitlement.grace_period_expires_date);
 // Only renewable subscriptions are sold. Never infer lifetime access from absent dates.
 if(!Number.isFinite(expiry))return expired;
 const until=Math.max(expiry,Number.isFinite(grace)?grace:expiry);
 return {provider:'revenuecat',status:until<=now?'expired':expiry<=now&&grace>now?'grace':sub.period_type==='trial'?'trialing':'active',access_until:new Date(until).toISOString()};
}
