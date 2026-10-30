# Current launch branch

This is the canonical tested mobile app. See `../release/LAUNCH.md` for the current launch status. Purchase/restore/manage UI, account export/deletion and release guards are implemented. Live billing remains disabled until configured; policy text remains a draft. The older development notes below describe the starting build and are not a launch-readiness claim.

# Daystead mobile — development build

React Native / Expo application for iOS and Android. Shares the Daystead Supabase project (`jlhhzmngotahugxjrdnk`) with future web integration. The existing web dashboard is still a separate sample-data prototype; it is not yet connected to this database.

## Implemented

- Sage/cream mobile dashboard and bottom navigation, email/password login and signup, reset-link handling, name on account.
- Authenticated cloud CRUD for bills, medicines and appointments; row ownership enforced in PostgreSQL. Empty real accounts never receive demo records.
- Daily, weekly and monthly recurrence, optional course end, shorter-month handling, payment/dose reports per occurrence.
- Amounts in integer pence; remaining/total/reported-paid cards, category donut, cumulative current/prior-month bill lines.
- Native date/time controls, editing/deletion and version checks to reject stale writes.
- Opt-in local notification adapter, 3-day bill reminders, medicine alerts at 10/5/0 minutes, generic lock-screen text, in-app snooze.
- Plan selection UI, proposed £4.99/month and £49.99/year. Checkout deliberately disabled; no purchase, trial or billing grace is claimed to be active.
- RevenueCat adapter prepared with configure, offerings, purchase and restore functions, not yet connected to the UI.

## Run and build

Use Node 24 and npm with the committed lockfile:

```sh
cd mobile
npm ci
npm run typecheck
TZ=Europe/London npm test
npm run export:native
npx expo start
```

`expo export` validates JavaScript bundles, not a signed installable binary. `eas.json` defines development, internal Android APK and production profiles. To create signed device builds, connect the owner's Expo account and Apple/Google signing accounts, confirm package IDs `com.provifi.daystead`, then use EAS Build. No EAS project or store listing was created, no signing credentials were requested, and no store submission was made.

## Auth setup before external testing

Allowlist `daystead://auth/callback` in Supabase Auth redirect URLs and set the appropriate Site URL. Configure production SMTP and email templates. Signup/reset UI and deep-link handling are implemented, but email delivery and link round trips have not been tested. Default Supabase email delivery restrictions may block non-team recipients. Do not disable email verification to bypass this. Passwords are managed by Supabase Auth, never stored in public tables.

Session storage currently follows Supabase's AsyncStorage React Native example. Harden session storage with a reviewed encrypted-storage implementation before handling production health data. Only the publishable API key is shipped in the client. Never add a secret/service-role key to mobile code.

## Required work before production

1. **Reminder delivery:** the development queue contains at most 48 future alerts and is rebuilt when the app refreshes. Permission/enable state currently resets at account startup. Implement persistent per-device settings, background/server scheduling, queue replenishment, chosen sound/silent controls, timezone policy and edits across sleeping devices. Test phone reboot, DST, Focus/silent modes, permission denial, offline use and duplicate prevention. This is not a guaranteed alarm or production-ready medication reminder.
2. **Editing and history:** editing currently changes an entire recurring schedule; deleting removes its completion history. Implement stable occurrence records, this-occurrence/future-only edits and retained history before release. Add undo/correction for paid/taken reports, additional bill reminders, cancellation states and proper overdue presentation. Medicines support up to 12 custom times per scheduled day; each dose has its own completion record.
3. **Setup and sync:** finish the guided name → bills → medicines → appointments onboarding. Data is refreshed on app foreground and pull-to-refresh; offline writes and real-time cross-device delivery are not implemented. Define fixed-home vs travelling timezone behaviour.
4. **Payments:** connect owner RevenueCat project, create iOS/Android monthly and annual products, configure a one-month introductory trial if supported/eligible, and a `premium` entitlement. Load localized prices from store offerings. Connect purchase, restore and manage-subscription UI. Set public SDK keys through `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`; never secret keys.
5. **Billing backend:** authenticated, idempotent RevenueCat webhook ingestion must update the read-only subscription table. Validate event identity, replay handling, refunds, billing recovery and paid-through dates. Implement the agreed seven-day grace and exact reminder-stop notice, reconciling it with each store's actual billing state. Current development reminders are not gated by subscriptions; do not activate paid checkout until entitlement enforcement and device reconciliation are complete.
6. **Account/legal:** privacy policy, terms, consent for health data, account deletion, data export, notification previews, support details, final brand/icon assets and accessibility/device QA. The development paywall accurately labels unavailable functionality.

## Validation completed

- TypeScript check and native iOS/Android JavaScript bundle exports.
- Domain tests: month-end recurrence, per-occurrence payment status, medicine alert offsets, course ending/DST and bill lead time.
- Live database transaction test: account A cannot see account B's schedules, account A can insert/read its own schedule, cross-account insertion fails, and authenticated clients cannot insert subscriptions. Temporary users/data rolled back.
- Supabase security advisor reported no database lints after schema creation.

No simulator or physical-device UI test, end-to-end signup test, signed build, store sandbox purchase, or notification delivery test has been completed. All must pass before launch.

## Medicine schedule update

Medicine schedules now accept custom add/edit/remove times. Today separates today's medicine doses from the upcoming bills/appointments list. Existing single-time schedules remain valid; edit one to add more times. Reinstalling or replacing source files does not delete Supabase account data.

Form Close controls now use a modal-local safe-area provider and a fixed header with a 48-point touch target. This layout still needs real-device confirmation.

Latest security advisory: Supabase reports leaked-password protection disabled; enable it before launch: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No row-level security issues were reported.
