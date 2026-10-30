# Daystead launch preparation

## Canonical source

`mobile/` is the Supabase-backed application Purna tested on iPhone, including custom medicine times and safe-area fixes. `web/` is the existing Vite demonstration website. The root-level Expo application is a different legacy local-storage prototype and MUST NOT be submitted to stores. EAS builds must run from `mobile/`.

## Implemented in this branch

- Monthly/yearly paywall with UK preview prices £4.99/£49.99. Live offers, currency and prices come from the store; do not relabel foreign currency as GBP.
- RevenueCat purchase, restore, account-linked app user IDs, status refresh and manage/cancel subscription. Native purchase testing requires a signed development build, not Expo Go. Cancelled purchases do not grant paid access.
- Data export and password-confirmed account deletion; explicit warning that deletion does not cancel store billing. Supabase account deletion function checks caller identity server-side and never accepts a target user ID.
- In-app privacy/terms/help information and public web routes `/#/privacy`, `/#/terms`, `/#/support`, `/#/pricing`, `/#/delete-account` (pre-release drafts).
- Authenticated RevenueCat webhook re-fetches authoritative subscription state. Duplicate deliveries are safe and older overlapping observations cannot overwrite newer subscription rows. Anonymous and sandbox identities cannot grant production entitlements.
- Production EAS pre-install check fails until launch requirements are explicitly completed. Do not mark checklist entries true without evidence.

## Owner configuration required

1. Register Apple Developer and Google Play accounts under the chosen legal identity. Confirm `com.provifi.daystead` identifiers before registering store apps. Set up owner Expo/EAS project inside `mobile/`.
2. Create RevenueCat project and iOS/Android apps. Define `premium` entitlement. Attach monthly and annual auto-renewable subscriptions to a default offering. Set UK prices to £4.99 and £49.99. Configure any one-month trial only if wanted and supported; app makes no unconditional trial promise.
3. Set public SDK keys in EAS: `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`. Enable billing only for signed sandbox testing first using `EXPO_PUBLIC_ENABLE_BILLING=true`. Never put secret API keys in Expo public variables.
4. Deploy `supabase/subscription-sync.sql` on the existing project `jlhhzmngotahugxjrdnk`. Deploy `revenuecat-webhook`, with its own authentication and JWT gateway disabled. Set server-only `REVENUECAT_SECRET_KEY` and a long unique `REVENUECAT_WEBHOOK_AUTH`; configure the exact same Authorization header in RevenueCat. Register the function HTTPS endpoint. Keep `REVENUECAT_ALLOW_SANDBOX` unset in production. Use a separate backend/RevenueCat app for testing.
5. Deploy `supabase/functions/delete-account/index.ts` as `delete-daystead-account`. Its body verifies the caller with Supabase Auth before any privileged deletion. The standard Supabase server secrets must be available. Verify an unauthenticated call returns 401 and deletion only affects a disposable test user.
6. Set real support email and reviewed public policy URLs: `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_TERMS_URL`. Domain purchase alone does not provide email. Configure verified transactional email and Auth redirects.

## Remaining release blockers — this branch is NOT store-ready

- Reminder queue still has a 48-alert bound. Reminder preference now persists per account on each phone. Background queue replenishment, sleeping-device edits, course endings and subscription-expiry cancellation must pass physical-device tests before charging users. Do not market this build as a reliable alarm service.
- SDK entitlement gating is integrated for scheduling; the full server-enforced billing and seven-day failed-renewal policy still needs store setup, reconciliation and device tests. Store-granted access must be honoured; do not assume both stores offer an identical seven-day grace configuration.
- Preserve historical occurrence records on recurring edits and support correcting paid/taken reports. Existing whole-schedule edits remain limited.
- Draft privacy/terms must be reviewed and completed with actual operator contact, retention, health-data handling, provider list and rights/transfer details. Account deletion must address downstream billing-processor records where appropriate. Google Play requires an external account-deletion request route as well as in-app controls; the new `/#/delete-account` route provides password-confirmed self-service deletion and must be tested using a disposable account before release.
- Harden session storage, configure leaked-password checks and restore-tested backups. Finish consent/permissions onboarding.
- Connect monitoring and restricted owner reporting. A read-only owner dashboard is available at `/#/owner`. Set `DAYSTEAD_OWNER_IDS` to the approved Supabase user UUID(s) in server secrets. The endpoint denies all accounts until this is configured. It exposes aggregate counts only; use RevenueCat and store settlement reports for revenue, refunds and payouts.
- Final app icon, screenshots, support URLs, review account and privacy/data-safety/health declarations. Run accessibility checks and both platforms' purchase, renewal, cancellation, refund, restore, offline and reminder tests.
- Complete `mobile/launch-status.json` based on evidence, then run `npm run release:check`. Only then build and submit for review. Signing, payments, developer-account fees and store approval remain owner/provider steps.

## Validation commands

```
cd mobile
npm ci
npm run typecheck
npm run lint
TZ=Europe/London npm test
npm run export:native
npm run release:check  # expected to fail until release blockers are resolved
```

From repository root: `node --experimental-strip-types --test release/tests/subscription.test.ts`.

## Backend deployment status

On 30 October 2026, `delete-daystead-account`, `daystead-owner-metrics` and `revenuecat-webhook` were deployed to `jlhhzmngotahugxjrdnk`; subscription-sync SQL was applied. All three reject unauthenticated requests with HTTP 401. Function gateway JWT verification is disabled because each function implements its own caller or webhook authentication. Owner allowlist and RevenueCat secrets remain unset, so owner metrics and billing ingestion stay closed. Successful deletion and real purchases have not been exercised against real accounts.

Supabase advisory: leaked-password protection remains disabled. Configure before release: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No row-policy warnings were reported.
