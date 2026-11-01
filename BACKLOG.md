# DayStead backlog

The CEO keeps this list in priority order. The automation cycle (see `AUTOMATION.md`) takes the top unblocked item. Mobile app first.

## Waiting on the owner (agents skip these)
- [ ] Supabase: turn on leaked-password protection at launch, when the project moves to Supabase Pro (it is a Pro-only feature). Until then, require lowercase, uppercase and digits under Authentication > Sign In / Providers > Email. [blocked: owner]
- [ ] Export the live schema into the repo (`supabase db dump --schema public > supabase/schema.sql`) so row-level security can be reviewed. [blocked: owner]
- [ ] Finish the device tests in `release/device-tests.md`: tests 6 and 8 on Android, then all 8 on an iPhone. [blocked: owner]
- [ ] **Android first, about £35:** buy `daystead.app` (Vercel, auto-renew on), Google Play developer account ($25), free support email (for example Zoho), RevenueCat project (free). [blocked: owner]
- [ ] **Later:** Apple Developer ($99/year) once Android has its first paying users; UK trademark for DayStead (class 9, £170) before any marketing spend. [blocked: owner]

## Next up (agents)
Mobile only. The website is a showcase page; it changes only when an item says so.

1. [ ] **Missed items from earlier months.** Today's "Needs your attention" only looks back to the 1st of this month, so a bill missed in late October disappears on 1 November. Look back 35 days.
2. [ ] **Google Play listing and Android release build** (CEO, designer, developer). Play Store title, short and full description, screenshots plan and data safety answers in `release/store-listing.md` (no medical claims), and an EAS Android production build profile. Android first; Apple later.
3. [ ] **Subscription required to use the app.** After sign-up the app shows "Start your free month". Google Play (later Apple) asks for the card, checks it, and charges automatically after the free month unless cancelled; DayStead never handles card details. Without an active trial or subscription the app shows only the paywall, Restore purchase, Sign out, Export my data and Delete account; records stay saved and come back on subscribing. Only switches on when billing is enabled, so testing stays open. Add `supabase/require-subscription.sql` (row-level security: read and write records only with an active trial or subscription) for Purna to run at launch.
4. [ ] **Free launch plan for carers** (CEO and CFO). Free promotion only: carers groups, carers centres, Reddit and the survey testers, plus a partnership outreach list for carers centres and councils, with the cost per paying user each approach would need to beat, saved in `research/`.
5. [ ] **Split `mobile/App.tsx`.** It's one 30KB file. Move each tab into `mobile/src/screens/` with no behaviour change, so later work is safer to review.
6. [ ] **Accessibility pass on mobile.** Screen-reader labels on every icon and button, checked with large text, 44pt touch targets, and AA contrast.
7. [ ] **Reminder tests.** Unit tests for `reconcileReminders` limits: at most 48 alerts plus 12 missed follow-ups plus the trial notice, staying under iOS's limit of 64 pending notifications.
8. [ ] **Friendly offline and error states.** Show clear messages when Supabase can't be reached, instead of raw error text.

## Done
- Owner ran `supabase/for-person.sql` and added the website redirect URL in Supabase.
- Bills, medicines, appointments and to-dos; recurrence; payday calendar; alarm-style medicine reminders.
- 1-month free trial paywall code, a 3-day trial-end reminder, and the annual saving badge.
- Quick-add UK bill templates and "Who is this for?" (PR #6).
- A + button on every tab, and a Dashboard tab with the bill total and donut chart (PR #8).
- Red marking for missed bills and doses, and the month comparison chart on the Dashboard (PR #9).
- The website is now the signed-in web version of the app, with the same features as mobile (PR #12).
- First-run setup guide on mobile and the website: payday, first bill, reminders; every step skippable (PR #11).
- Showcase website with Google Play and App Store buttons; the web app was removed (mobile only).
