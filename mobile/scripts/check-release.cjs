const fs=require('node:fs');
const path=require('node:path');
const status=JSON.parse(fs.readFileSync(path.join(__dirname,'../launch-status.json'),'utf8'));
const missing=Object.entries(status).filter(([,ready])=>ready!==true).map(([name])=>name);
for(const key of ['EXPO_PUBLIC_REVENUECAT_IOS_KEY','EXPO_PUBLIC_REVENUECAT_ANDROID_KEY','EXPO_PUBLIC_SUPPORT_EMAIL','EXPO_PUBLIC_PRIVACY_URL','EXPO_PUBLIC_TERMS_URL'])if(!process.env[key])missing.push(key);
if(process.env.EXPO_PUBLIC_ENABLE_BILLING!=='true')missing.push('Live billing must be enabled');
if(missing.length){console.error('PRODUCTION RELEASE BLOCKED:\n'+missing.map(x=>' - '+x).join('\n'));process.exit(1)}
console.log('Release checklist complete. Store review and signing are still required.');
