# DayStead — by Provifi

A daily life-admin tracker: bills, medication reminders, appointments and simple expense
planning in one app. Built so you always know what's due and how much to keep available
before payday.

## Status: MVP (v1 scope)

This is the first build, deliberately narrow:

- **Bills** — add with quick templates (rent, credit card, utilities, subscriptions),
  track scheduled/paid/overdue status, local reminders before the due date. Confirmed
  amounts are distinguished from estimates.
- **Medications** — dosage schedules with once/twice/three-times-daily templates, daily
  recurring local reminders, mark each dose taken.
- **Appointments** — simple reminders, no live travel/transit integration yet (deferred).
- **Expenses** — manual logging with monthly total and category breakdown. No bank
  integration or AI statement parsing yet (deferred to v2 — see below).
- **Home** — "Today", upcoming payments, and "money needed before payday" (unpaid bills
  due before your next payday, plus your cash buffer).
- **Free vs Plus gating** — free tier capped at 5 bills / 3 medications / 5 appointments
  (`src/lib/plan.ts`). Plus is £2.99/month or £29.99/year. Medications are deliberately
  capped, not unlimited, to preserve the "cheaper than Medisafe, does more" positioning.

## Explicitly NOT in this build (v2, once v1 is validated)

- AI bank statement parsing / auto-categorized expenses
- Open Banking live bank sync
- Live travel updates
- Family/Carer multi-person plan
- Real subscription billing (RevenueCat is not wired up — `PaywallScreen` flips a local
  flag so the free/paid gating logic can be tested end to end)

## Architecture

- **Local-first**: all data lives in AsyncStorage via `src/storage/repository.ts`. No
  backend account is required to run or test this build.
- **`supabase/schema.sql`**: the target schema for when multi-device sync becomes
  necessary. Not applied anywhere yet — `src/lib/supabase.ts` is a dormant client that
  activates once `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set.
- **Reminders**: on-device local notifications only (`src/lib/notifications.ts`,
  `expo-notifications`) — no server-side push infrastructure needed for v1.

## Running it

```bash
npm install
npm run ios      # or: npm run android / npm run web
```

Notifications need a real device or simulator with notification permissions granted —
the app requests permission on first launch.

## Project structure

```
App.tsx                      entry point, wraps the app in AppDataProvider + RootNavigator
src/types/                   data model (Bill, Medication, Appointment, Expense, ...)
src/storage/repository.ts    AsyncStorage persistence — swap this file's internals, not callers, to add a real backend
src/context/AppDataContext.tsx   central state + CRUD + reminder scheduling on save
src/lib/money.ts             upcoming bills, overdue bills, "money needed before payday"
src/lib/plan.ts              free tier limits + Plus pricing constants
src/lib/notifications.ts     local notification scheduling (one-off + daily repeating)
src/lib/supabase.ts          dormant Supabase client for the future backend migration
src/screens/                 one screen per flow, plus an Add* screen for each entity
src/navigation/               bottom tabs (Home/Bills/Medications/Expenses/Settings) + a stack for Add*/Paywall/Appointments
supabase/schema.sql           target Postgres schema + RLS policies for the eventual backend
```

## Next steps toward launch

See the build plan: `/replica-test` next (write the test plan, especially the
scheduled→paid/overdue status edge cases and the free→Plus upgrade gate), then
`/replica-diff` against Medisafe/Actually Done, then real device testing for at least
one full week before `/replica-launch` + `/replica-deploy`.
