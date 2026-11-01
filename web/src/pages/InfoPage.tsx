import {Link} from 'react-router-dom';
import Layout from '../site/Layout';
const pages={
 pricing:{title:'DayStead Premium',body:'UK launch plans: 1 month free for new subscribers, then £3.99 per month or £35.99 per year. Cancel any time before your free month ends and you will not be charged; the app reminds you 3 days before. These are proposed prices; purchases are not yet available. The app shows the actual store price before purchase. Subscriptions renew until cancelled through Apple or Google, and trial eligibility is confirmed by the store.'},
 privacy:{title:'Privacy information',body:'DayStead is operated by Purna Vemula under the Provifi brand. The mobile app stores account details, bills, medication schedules, appointments and your reported history using Supabase. Medication records can reveal health information. Store billing will be handled by Apple or Google with RevenueCat. We do not receive full payment card details. Data export and account deletion controls are available in the mobile app. This pre-release notice requires final contact, retention and international-transfer details before public launch.'},
 terms:{title:'Terms',body:'DayStead is an organisational reminder tool. It does not make payments, verify bank balances, prescribe treatment or verify medicine use. Users enter and check their own information. Reminder delivery depends on phone settings and operating-system conditions. Subscription terms and eligible offers will be shown before purchase. Deleting your account does not cancel an Apple or Google subscription. Final consumer terms are pending before launch.'},
 support:{title:'Help & support',body:'For reminders, check notification permissions in your phone settings. For sync, refresh your schedules after reconnecting. For subscriptions, use Restore purchases or Manage subscription in the mobile app. The production support mailbox is not yet configured. Do not send passwords, full card numbers or medication details in a bug report.'},
 'delete-account':{title:'Delete your DayStead account',body:'In the mobile app, open Account → Delete account. Review the warning, enter your password and confirm deletion. Export records you want to keep first. Deletion removes your DayStead account and linked schedule/history records; it does not cancel store billing. Manage your Apple or Google subscription separately. A web-based deletion-request channel and verified support contact are still required before Google Play launch.'},
};
export default function InfoPage({page}:{page:keyof typeof pages}){
 const info=pages[page];
 return <Layout>
  <section className="bg-[var(--field)]"><div className="max-w-[1320px] mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-14"><h1 className="display text-[52px] sm:text-[80px]"><span className="line"><span>{info.title}</span></span></h1></div></section>
  <section className="max-w-[1320px] mx-auto px-5 md:px-8 py-16 md:py-24 grid lg:grid-cols-[1fr_2fr] gap-10">
   <nav aria-label="Policies" className="flex lg:flex-col flex-wrap gap-3 text-[17px]">{(['privacy','terms','delete-account'] as const).map(key=><Link key={key} to={'/'+key} className={`link-u self-start ${key===page?'font-semibold':''}`}>{pages[key].title}</Link>)}<Link to="/support" className="link-u self-start">Help centre</Link></nav>
   <div className="flex flex-col gap-6 max-w-[65ch]"><p className="text-[16px] font-semibold text-[var(--soft-ink)]">Pre-release. DayStead is not yet accepting payments.</p><p className="text-[19px] leading-[1.7]">{info.body}</p></div>
  </section>
 </Layout>;
}
