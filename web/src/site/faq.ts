// Help centre content. Answers match how the app works today (mobile/App.tsx, mobile/src/notifications.ts).
export type Topic = { id: string; title: string; items: [string, string][] };

export const TOPICS: Topic[] = [
  {
    id: 'start', title: 'Getting started', items: [
      ['How do I get DayStead?', 'DayStead is a phone app. It is launching first on Android through Google Play, with iPhone to follow. There is no web version: everything happens in the app.'],
      ['What should I add first?', 'When you first open the app, a short guide asks for your payday, your first bill and whether to turn on reminders. Every step can be skipped and you can open the guide again from Account.'],
      ['Can I use it for someone I look after?', 'Yes. When you add a bill, medicine or appointment, choose who it is for: Me, Mum, Dad, Partner, or type a name. Each item then shows who it belongs to.'],
      ['Can I use the same account on two phones?', 'Yes. Sign in with the same email on both. Your records sync, and reminders are set up on each phone you turn them on for.'],
    ],
  },
  {
    id: 'bills', title: 'Bills and payday', items: [
      ['How does "money needed before payday" work?', 'Set your next payday on the Today page. DayStead adds up the bills you have not marked paid from the start of the month up to and including payday. It is based on the bills you enter, not your bank balance.'],
      ['Does DayStead pay my bills or connect to my bank?', 'No. DayStead never moves money and does not connect to your bank. You mark a bill as paid yourself. A Direct Debit date does not confirm that a payment went through.'],
      ['When will I be reminded about a bill?', '3 days before it is due. If it is still not marked paid after the due day, it turns red and you get one more reminder at 9am the next morning.'],
      ['Can I add bills that repeat?', 'Yes. Bills can repeat weekly or monthly, and the quick-add list fills in common UK bills like council tax, energy, water and TV licence. Bills due on the 29th to 31st move to the last day in shorter months.'],
    ],
  },
  {
    id: 'medicines', title: 'Medicines', items: [
      ['When do medicine reminders arrive?', '10 minutes before, 5 minutes before and at the time you set for each dose. You can set several times a day.'],
      ['What is an alarm-style reminder?', 'On Android you can switch a medicine to Alarm. It rings at the dose time even when the phone is locked, until you stop it. Stopping an alarm does not mark the dose as taken; you do that in the app.'],
      ['What happens if I miss a dose?', 'If a dose is not marked taken or skipped within 30 minutes, it turns red in the app and you get one follow-up reminder.'],
      ['Does DayStead give medical advice?', 'No. DayStead records the instructions you were given and reminds you. It does not suggest doses or replace advice from your GP or pharmacist.'],
    ],
  },
  {
    id: 'reminders', title: 'Reminders', items: [
      ['I am not getting reminders. What should I check?', 'Make sure reminders are turned on in the app (Account, Phone reminders), that DayStead is allowed to send notifications in your phone settings, and that battery saving is not stopping it. Open the app now and then so it can refresh upcoming reminders.'],
      ['What does a reminder show on my lock screen?', 'Only "DayStead reminder". It never says the name of a bill or medicine, so nothing private shows on your lock screen.'],
      ['Can I snooze a reminder?', 'Yes, for 5 minutes. Snoozing one dose does not move the doses after it.'],
    ],
  },
  {
    id: 'billing', title: 'Subscription and billing', items: [
      ['How much does DayStead cost?', '1 month free for new subscribers, then £3.99 a month or £35.99 a year. Everything is included in both.'],
      ['Why do I add a card for a free month?', 'Google Play (or the App Store on iPhone) asks for a payment method when the free month starts. You pay £0 that day. If you keep your subscription, the store charges you automatically when the free month ends, then on the same date each month or year.'],
      ['How do I cancel?', 'In Google Play: Profile, Payments and subscriptions, Subscriptions, DayStead, Cancel. On iPhone: Settings, your name, Subscriptions. Cancel at least a day before the free month ends and you will not be charged. Deleting the app or your account does not cancel the subscription.'],
      ['Will I be reminded before I am charged?', 'Yes. The app reminds you 3 days before your free month ends, and the store usually emails you too.'],
      ['How do refunds work?', 'Payments are taken by Google or Apple, so refunds are requested through them. Google Play lets you ask for a refund from your order history.'],
      ['I changed phone. How do I get my subscription back?', 'Sign in with the same DayStead account and the same Google or Apple account, then tap Restore purchases in Account.'],
    ],
  },
  {
    id: 'account', title: 'Account and privacy', items: [
      ['What happens to my data?', 'Your records are stored securely so they can sync to your phones. Medicine records can be health information, so we treat them with extra care and never sell your data. Read the privacy page for the details.'],
      ['How do I export my data?', 'In the app, open Account and choose Export my data. You get a file of everything you have entered.'],
      ['How do I delete my account?', 'In the app, open Account and choose Delete account. This removes your account and all your records. You can also do it from the delete account page on this website.'],
      ['I did not get my confirmation email.', 'Check your spam folder, then try signing in again in the app to send a new one. The link opens a page on this website that tells you to go back to the app.'],
    ],
  },
];
