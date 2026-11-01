# DayStead: start-here brief for a new chat

Paste this into a new chat, or say "read HANDOFF.md in PurnaV6/DayStead".

**What it is.** DayStead by Provifi ("Your day, in order.") is a UK subscription app that puts bill reminders with "money needed before payday", medication reminders (including alarm-style alerts) and appointments/to-dos in one place. Owner: Purna Vemula.

**Mobile first, website kept in step.** The phone app in `mobile/` is the product. Every feature is built there first and then added to the website in the same PR. The website (`web/`, https://web-mwdx.vercel.app) is the signed-in web version: same Supabase account and data, the same 6 tabs, the + button, the charts and the red missed items. Phone-only features (notifications, alarms, store purchases) get a note on the web instead. `web/src/lib/domain.ts` is an exact copy of `mobile/src/domain.ts` (`cd web && npm run check:shared`).

**Price (decided).** 1 month free for new subscribers, then £3.99/month or £35.99/year; no permanent free tier. Cancelling before the trial ends means no charge, and the app reminds users 3 days before. You keep about £2.83/month or £25.49/year per subscriber after VAT and the 15% store fee. Running costs are about £53/month once launched, so break-even is about 22 paying subscribers. Paid ads lose money at this price (about £75 to £370 per paying user against a lifetime value of about £34), so growth must come from partnerships, communities and App Store search.

**Where everything is**
- Repo: https://github.com/PurnaV6/DayStead. Work on a branch and open a pull request; do not push to `main`.
- `mobile/` is the real app (Expo + Supabase). It is what ships. Tested by Purna in Expo Go (development mode, not a store build).
- `web/` is the website on Vercel, auto-deployed from `main`: https://web-mwdx.vercel.app
- `supabase/` has edge functions (account deletion, owner metrics, RevenueCat webhook) and SQL. Live Supabase project: `jlhhzmngotahugxjrdnk`.
- Read first: `release/LAUNCH.md` (status and blockers), `PRODUCT_SPEC.md` (product and build order), `mobile/launch-status.json` (launch checklist, all items false).

**Market research** (`research/market-2026-10.md`): no verified app combines bills, meds and appointments; £3.99 is at or below comparable apps; launch with unpaid carers via councils and carers centres; paid ads won't pay back at this price; lead with the annual plan because monthly churn is the main revenue risk.

**Team agents** (in `.claude/agents/`): `ceo` (strategy and priorities), `cfo` (pricing and unit economics), `designer` (mobile screens, copy and accessibility), `developer` (code changes via PR) and `tester` (independent QA). They run as an automated cycle twice a day: see `AUTOMATION.md`. The prioritised to-do list is `BACKLOG.md`.

**Done so far**
- Mobile: Supabase sign-in, bills/medicines/appointments/to-dos, recurrence with month-end and UK clock-change handling, Today briefing, native alarm module, and the payday calendar on Today.
- Mobile tabs: Today, Dashboard, Bills, Medicines, Planner and Account, with same-size icons. A round + button on every tab adds things.
- Mobile Dashboard: this month's bill total, still to pay, a category donut with the total in the middle, medicines taken today, and plans for the next 7 days.
- Mobile Bills tab: the donut, plus a this month vs last month line chart.
- Mobile extras: one-tap UK bill templates, "Who is this for?" labels, the annual-plan saving badge, RevenueCat paywall code with a 1-month free trial and a 3-day reminder (not live yet), data export and account deletion.
- Mobile checks: typecheck, lint and tests pass.
- Open PR #9: red marking for missed bills and doses, a red follow-up reminder, and the line chart on the Dashboard as well.
- Web: sign-in preview, sample dashboard (responsive, priority alert banner), pricing/privacy/terms/support pages, account deletion page, `/#/verified` page for email confirmation and password reset.
- Backend: deletion, owner metrics and webhook functions deployed; subscription sync SQL applied.

**Known gaps (highest first)**
1. The live database tables (`daystead_schedules`, `daystead_completions`, `daystead_subscriptions`, `daystead_preferences`) are not fully defined in the repo, so row-level security and cascade deletes cannot be reviewed and the backend cannot be rebuilt. Export the schema into `supabase/` (`supabase db dump --schema public`).
2. Run `supabase/for-person.sql` in the Supabase SQL editor so "Who is this for?" can be saved (until then the app asks people to choose "Me").
3. In Supabase, add `https://web-mwdx.vercel.app/**` to Authentication > URL Configuration > Redirect URLs, or email links may be ignored.
4. Supabase leaked-password protection is off.
5. Reminder reliability on a physical phone (background refresh, course endings, subscription expiry) is untested. Do not market as a reliable alarm yet.
6. No store accounts, RevenueCat project, real support email, or reviewed privacy/terms yet.
7. Subscriptions are not yet checked on the website. Once billing goes live, the web must read `daystead_subscriptions` before allowing new schedules, as the phone does with RevenueCat.

**Rules.** No em dashes in user-facing text. Money in pence. Calendar dates from local date parts, not `toISOString()`. Never mark a launch checklist item true without evidence. Never put secret keys in the repo or in `EXPO_PUBLIC_*` variables.
