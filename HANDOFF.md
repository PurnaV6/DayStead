# Daystead: start-here brief for a new chat

Paste this into a new chat, or say "read HANDOFF.md in PurnaV6/DayStead".

**What it is.** Daystead by Provifi ("Your day, in order.") is a UK subscription app that puts bill reminders with "money needed before payday", medication reminders (including alarm-style alerts) and appointments/to-dos in one place. Owner: Purna Vemula.

**Where everything is**
- Repo: https://github.com/PurnaV6/DayStead. Work on a branch and open a pull request; do not push to `main`.
- `mobile/` is the real app (Expo + Supabase). It is what ships. Tested by Purna in Expo Go (development mode, not a store build).
- `web/` is the website on Vercel, auto-deployed from `main`: https://web-mwdx.vercel.app
- `supabase/` has edge functions (account deletion, owner metrics, RevenueCat webhook) and SQL. Live Supabase project: `jlhhzmngotahugxjrdnk`.
- Root `App.tsx` and `src/` are a legacy local-only prototype. Do not ship or extend it.
- Read first: `release/LAUNCH.md` (status and blockers), `PRODUCT_SPEC.md` (product and build order), `mobile/launch-status.json` (launch checklist, all items false).

**Market research** (`research/market-2026-10.md`): no verified app combines bills, meds and appointments; £3.99 is at or below comparable apps; launch with unpaid carers via councils and carers centres; paid ads won't pay back at this price; lead with the annual plan because monthly churn is the main revenue risk.

**Team agents** (in `.claude/agents/`): `developer` (code changes via PR), `tester` (independent QA), `ceo` (strategy and priorities), `cfo` (pricing and unit economics).

**Done so far**
- Mobile: Supabase sign-in, bills/medicines/appointments/to-dos, recurrence with month-end and UK clock-change handling, Today briefing, native alarm module, payday calendar on Today, RevenueCat paywall code (not live), data export and account deletion. Typecheck, lint and 11 tests pass.
- Web: sign-in preview, sample dashboard (responsive, priority alert banner), pricing/privacy/terms/support pages, account deletion page, `/#/verified` page for email confirmation and password reset.
- Backend: deletion, owner metrics and webhook functions deployed; subscription sync SQL applied.

**Open decisions for Purna**
1. **Price.** App and website show £3.99/month or £35.99/year; `PRODUCT_SPEC.md` and `LAUNCH.md` say £4.99/£49.99. Pick one and update all four places.
2. **Delete the legacy root app** so nobody runs or ships the wrong one.

**Known gaps (highest first)**
1. The live database tables (`daystead_schedules`, `daystead_completions`, `daystead_subscriptions`, `daystead_preferences`) are not fully defined in the repo, so row-level security and cascade deletes cannot be reviewed and the backend cannot be rebuilt. Export the schema into `supabase/` (`supabase db dump --schema public`).
2. In Supabase, add `https://web-mwdx.vercel.app/**` to Authentication > URL Configuration > Redirect URLs, or email links may be ignored.
3. Supabase leaked-password protection is off.
4. Reminder reliability on a physical phone (background refresh, course endings, subscription expiry) is untested. Do not market as a reliable alarm yet.
5. No store accounts, RevenueCat project, real support email, or reviewed privacy/terms yet.
6. Web dashboard Bills, Medicines and Appointments tabs are placeholders.

**Rules.** No em dashes in user-facing text. Money in pence. Calendar dates from local date parts, not `toISOString()`. Never mark a launch checklist item true without evidence. Never put secret keys in the repo or in `EXPO_PUBLIC_*` variables.
