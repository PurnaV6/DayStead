# DayStead backlog

The CEO keeps this list in priority order. The automation cycle (see `AUTOMATION.md`) takes the top unblocked item. Mobile app first.

## Waiting on the owner (agents skip these)
- [ ] Supabase: turn on leaked-password protection at launch, when the project moves to Supabase Pro (it is a Pro-only feature). Until then, require lowercase, uppercase and digits under Authentication > Sign In / Providers > Email. [blocked: owner]
- [ ] Export the live schema into the repo (`supabase db dump --schema public > supabase/schema.sql`) so row-level security can be reviewed. [blocked: owner]
- [ ] Finish the device tests in `release/device-tests.md`: tests 6 and 8 on Android, then all 8 on an iPhone. [blocked: owner]
- [ ] **Android first, about £35:** buy `daystead.app` (Vercel, auto-renew on), Google Play developer account ($25), free support email (for example Zoho), RevenueCat project (free). [blocked: owner]
- [ ] **Before launch (free):** run the survey, recruit 12 Google Play testers from it, and reserve @daystead on Instagram and TikTok. [blocked: owner]
- [ ] **Later:** Apple Developer ($99/year) once Android has its first paying users; UK trademark for DayStead (class 9, £170) before any marketing spend. [blocked: owner]

## Next up (agents)
Mobile only. The website is a showcase page; it changes only when an item says so.

1. [ ] **Clearer message when an email is already registered.** After sign-up, show "Check your email. If you already have a DayStead account, sign in or reset your password instead." Keep it the same whether or not the email exists, so nobody can check who uses DayStead.
2. [ ] **Subscription required to use the app.** After sign-up the app shows "Start your free month". Google Play (later Apple) asks for the card, checks it, and charges automatically after the free month unless cancelled; DayStead never handles card details. Without an active trial or subscription the app shows only the paywall, Restore purchase, Sign out, Export my data and Delete account; records stay saved and come back on subscribing. Only switches on when billing is enabled, so testing stays open. Add `supabase/require-subscription.sql` (row-level security: read and write records only with an active trial or subscription) for Purna to run at launch.
3. [ ] **Ask happy users for a Play Store review.** After about 7 days of use, and only after a good moment (for example a bill marked paid or a dose marked taken), show Google Play's own in-app review prompt (`expo-store-review`). Ask at most once every few months, never during setup, a missed item or the paywall. No custom "rate us" screens or rewards for reviews, as store rules require. Add unit tests for the timing rule.
4. [ ] **Plain-language reminder health check** (designer, developer, tester). `mobile/src/ReminderHealth.tsx` already checks notification permission, the pending queue and native alarm permission, and sends a test reminder, but shows one technical status string. Replace it with a pass/fail list: notifications allowed; exact alarms allowed (Android); battery optimisation not restricting DayStead; test reminder received. Each failed row gets a button that opens the right phone settings screen. Add a "check after restart" step (restart the phone, then the app says whether the next reminder arrived), since test 8 in `release/device-tests.md` is untested. Show the check once at the end of the setup guide. Unit-test the status mapping. Copy must not call DayStead a reliable alarm service (see `release/LAUNCH.md`).
5. [ ] **Optional app lock** (CTO for the dependency, designer, developer, tester). Medicine and money data on a shared phone. A Settings switch, off by default, using `expo-local-authentication` (fingerprint, face or device PIN). Locks on open and after 1 minute in the background. Reminders still fire while locked and lock-screen text stays generic. Nothing leaves the phone. Add the answer to the Play data safety notes in `release/store-listing.md`.
6. [ ] **Free launch plan for carers** (business manager, CEO and CFO). Free promotion only: carers groups, carers centres, Reddit and the survey testers, plus a partnership outreach list for carers centres and councils, with the cost per paying user each approach would need to beat, saved in `research/`.
7. [ ] **Split `mobile/App.tsx`.** It's one 30KB file. Move each tab into `mobile/src/screens/` with no behaviour change, so later work is safer to review.
8. [ ] **Accessibility pass on mobile.** Screen-reader labels on every icon and button, checked with large text, 44pt touch targets, and AA contrast.
9. [ ] **Reminder tests.** Unit tests for `reconcileReminders` limits: at most 48 alerts plus 12 missed follow-ups plus the trial notice, staying under iOS's limit of 64 pending notifications.
10. [ ] **Friendly offline and error states.** Show clear messages when Supabase can't be reached, instead of raw error text.
11. [ ] **Swipe to mark paid, taken or snooze** (designer, developer, tester). Check first which of Taken, Snooze and Skip already exist (`release/device-tests.md` shows Taken and Snooze working). Swipe right marks a bill paid or a dose taken; swipe left snoozes a dose 5 minutes. Keep the existing buttons so screen-reader users are not left out. Rules from `PRODUCT_SPEC.md` still apply: dismissing a notification never counts as Taken, and snoozing one dose never moves later doses. 44pt touch targets.

### After launch (only if real users ask; the cycle skips these)
Ideas from reviewing a competing organiser app's public marketing page. Ideas only: do not copy its wording, layout or screenshots. The reminder health check, app lock and swipe actions are in the list above; these two wait.

- [ ] **Android home-screen widget** (CTO, CFO, developer). Shows "Money needed before payday" and the next medicine. Expo has no built-in widget support, so the CTO writes a short note in `research/` on the library or native-module options and the CFO weighs the dependency cost before any code. Medicine names are health data: the widget shows generic text unless the user opts in.
- [ ] **Quick add by typing a sentence** (business manager for common phrasings, developer, tester). A rule-based parser (no AI, works offline) turns "£25 phone bill on the 12th every month" into a pre-filled form that the user reviews before saving, as `PRODUCT_SPEC.md` section 9 requires. Money in pence, dates from local date parts, month-end handled, unit tests, and a fallback to the normal form when the sentence isn't understood.

- [ ] **Wellbeing reminders** (business manager to check demand in the survey, designer, developer, tester). A "Wellbeing" quick-add list in the form: Drink water, Stand and stretch, Take a short walk, Screen break. Uses the existing reminder system as daily repeats at times the user picks, at most about 3 a day each, off by default, paused in one tap, gentle wording. Medicine and bill reminders always keep priority within the phone's pending reminder limit (64 on iPhone). Move up if testers or survey answers ask for it.

Considered and not planned: a general weather screen (every phone has one; needs location and a paid data source; possible later as weather on an appointment day only, if users ask); streaks, badges and wallpapers; cycle tracker, sleep and health dashboards; syncing 13 task apps; a one-time price (the CFO could model it, since running costs are about £53 a month); importing the phone calendar (revisit after launch, because reading the whole calendar adds permission and data safety work).

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
- "Needs your attention" looks back 35 days, so a bill missed late last month stays after the 1st.
- Google Play listing, graphics, data safety answers and Android store build profiles (`release/store-listing.md`).
- Premium motion part 1: shared motion kit (`mobile/src/motion/`), press feedback, haptics, tab fade and a sliding add sheet.
- Premium motion part 2: cards rise in one after another, totals count up, charts draw in, tick and smooth settle on marking, missed dot pulses once, loading placeholders.
- Premium polish pass: Today attention panel rebuilt in the brand style; text at least 12pt with sentence-case labels; consistent radii and pill buttons; active tab highlight.
