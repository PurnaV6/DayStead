# Daystead backlog

The CEO keeps this list in priority order. The automation cycle (see `AUTOMATION.md`) takes the top unblocked item. Mobile app first.

## Waiting on the owner (agents skip these)
- [ ] Merge PR #9 (red marking for missed items; month comparison chart on the Dashboard) after checking it in Expo Go. [blocked: owner]
- [ ] Run `supabase/for-person.sql` in the Supabase SQL editor so "Who is this for?" saves. [blocked: owner]
- [ ] Supabase: add `https://web-mwdx.vercel.app/**` to Authentication > URL Configuration > Redirect URLs. [blocked: owner]
- [ ] Supabase: turn on leaked-password protection. [blocked: owner]
- [ ] Export the live schema into the repo (`supabase db dump --schema public > supabase/schema.sql`) so row-level security can be reviewed. [blocked: owner]
- [ ] Apple and Google developer accounts, a RevenueCat project, the 1-month free trial offers, and a real support email. [blocked: owner]

## Next up (agents)
1. [ ] **Missed items from earlier months.** Today's "Needs your attention" only looks back to the 1st of this month, so a bill missed in late October disappears on 1 November. Look back 35 days. Depends on PR #9.
2. [ ] **Split `mobile/App.tsx`.** It's one 30KB file. Move each tab into `mobile/src/screens/` with no behaviour change, so later work is safer to review.
3. [ ] **Accessibility pass on mobile.** Screen-reader labels on every icon and button, checked with large text, 44pt touch targets, and AA contrast.
4. [ ] **Reminder tests.** Unit tests for `reconcileReminders` limits: at most 48 alerts plus 12 missed follow-ups plus the trial notice, staying under iOS's limit of 64 pending notifications.
5. [ ] **Friendly offline and error states.** Show clear messages when Supabase can't be reached, instead of raw error text.
6. [ ] **Store listing draft** (CEO and designer). App Store and Google Play title, subtitle, description, keywords and a screenshot plan, saved in `release/store-listing.md`. Wording checked against store rules; no medical claims.
7. [ ] **Launch plan for carers** (CEO and CFO). A partnership outreach list for carers centres and councils, with the cost per paying user each approach would need to beat, saved in `research/`.

## Done
- Bills, medicines, appointments and to-dos; recurrence; payday calendar; alarm-style medicine reminders.
- 1-month free trial paywall code, a 3-day trial-end reminder, and the annual saving badge.
- Quick-add UK bill templates and "Who is this for?" (PR #6).
- A + button on every tab, and a Dashboard tab with the bill total and donut chart (PR #8).
- First-run setup guide on mobile: payday, first bill, reminders; every step skippable (this PR).
