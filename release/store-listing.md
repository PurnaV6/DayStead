# DayStead: Google Play listing and release guide

Android first. Everything here is ready to paste into Play Console once Purna's developer account is approved. Apple comes later and reuses most of it.

Rules followed: UK English, no em dashes, no medical claims ("reminds you", never "improves adherence" or "keeps you healthy"), no "best" or "number 1", no prices in the title, no competitor names.

---

## 1. Main store listing (Play Console > Grow users > Store presence > Main store listing)

**App name** (limit 30): `DayStead: Bills & Medicines` (27)

Alternatives if Purna prefers: `DayStead: Bills, Meds & Plans` (29), `DayStead` (8, simplest, weaker for search).

**Short description** (limit 80):
`Bills, medicine reminders and appointments in one calm app. Ready for payday.` (77)

**Full description** (limit 4,000):

```
DayStead keeps your bills, medicine reminders and appointments in one calm place, and tells you how much money to keep aside before payday.

Life admin ends up everywhere: a council tax letter on the side, tablets in a box by the kettle, the dentist on the fridge. DayStead puts it all in one list on your phone, in the order it is due.

BILLS, BEFORE PAYDAY
• Add common UK bills in one tap: council tax, energy, water, broadband, TV licence and more
• See how much you need before your next payday, based on the bills you have entered
• A reminder 3 days before each bill is due
• Missed a bill? It turns red and you get one more reminder the next morning
• See where the month goes, and this month against last month

MEDICINE REMINDERS
• Reminders at the times you were prescribed, several times a day if needed
• Optional alarm-style reminder on Android that rings even when your phone is locked
• Mark a dose taken or skipped, or snooze it for 5 minutes without moving the rest of the day
• A dose left unmarked turns red after 30 minutes
DayStead records what you enter. It does not give medical advice or suggest doses.

APPOINTMENTS AND TO-DOS
• GP visits, school forms, renewals and anything else with a date
• Repeat daily, weekly or monthly, with an end date

FOR YOU, OR SOMEONE YOU LOOK AFTER
Add items for Mum, Dad, a partner or a child alongside your own. Every item says who it is for.

PRIVATE BY DESIGN
• Reminders only say "DayStead reminder", so nothing private shows on your lock screen
• Export your data or delete your account from the app at any time
• Payments go through Google Play. DayStead never sees your card details
• Your data is never sold

PRICING
Your first month is free. Then £3.99 a month or £35.99 a year. Google Play asks for a payment method when your free month starts, and you pay nothing that day. We remind you 3 days before the free month ends, and you can cancel any time in Google Play.

DayStead does not make payments, connect to your bank or check your balance. You mark bills paid yourself.

Questions? Visit our help centre at daystead.app/support
```

(About 2,100 characters; room to add a short "What people say" section once real reviews exist. Never invent quotes.)

**Category:** Productivity. Medical is avoided on purpose: it invites stricter review and suggests medical claims DayStead does not make.

**Tags** (choose up to 5 in Play Console): Productivity, Planner, Reminders, Personal finance, Calendar.

**Contact details**
- Email: `support@daystead.app` once the domain and mailbox exist (required before review)
- Website: `https://daystead.app` (until then `https://web-mwdx.vercel.app`)
- Privacy policy: `https://daystead.app/#/privacy` (until then `https://web-mwdx.vercel.app/#/privacy`)

**Keywords to keep in the text** (Google reads the description, there is no keyword box): bill reminder, bills tracker, payday, budget, medicine reminder, medication reminder, pill reminder, appointments, to-do, carer, planner.

---

## 2. Graphics

| Asset | File | Status |
|---|---|---|
| App icon 512×512 PNG | `release/play/icon-512.png` | Ready (logo, white on deep green) |
| Feature graphic 1024×500 | `release/play/feature-graphic-1024x500.png` | Ready |
| Phone screenshots | Taken by Purna on the phone (below) | To do |

**Screenshots plan** (Play needs 2 to 8; aim for 6, portrait, at least 1080px wide). Use tidy sample data in a test account: a few UK bills with round amounts, two medicines "For Mum", one appointment. No real names, emails or medicine you would not want public.

| # | Screen | Caption to add (short, sentence case) |
|---|---|---|
| 1 | Today, with payday set | Your day, in order |
| 2 | Today, "Money needed before payday" card | Know what to keep aside before payday |
| 3 | Bills tab with donut and a red missed bill | Every bill, before it is due |
| 4 | Medicines tab with a taken dose and an alarm one | Reminders at the dose time |
| 5 | Add a bill with the UK quick-add chips | Add council tax, energy and more in one tap |
| 6 | Planner with "For Mum" items | For you, or someone you look after |

Captions can be added on top of the screenshots later by the designer; plain screenshots are allowed and fine for the closed test.

---

## 3. App content declarations (Play Console > Policy > App content)

**Privacy policy:** URL above.

**Ads:** No, the app does not contain ads.

**App access:** Login required. Provide a test account for Google's reviewers (email and password of a test DayStead account with sample data, and a note: "Sign in with these details. Subscription is not needed during review" until billing is live; once live, give a test account with an active subscription or note that the free month can be started with a test card).

**Target audience and content:** 18 and over only (money and medicines; keeps the app out of the Families policy). Not designed for children.

**Content rating questionnaire:** Category "Utility, productivity, communication or other". Answer No to violence, sexual content, language, controlled substances (reminders for prescribed medicines are not promotion of drugs), gambling, user-generated content shared with others, and location sharing. Expected rating: PEGI 3 / Everyone.

**News app:** No. **Government app:** No. **Financial features:** declare "None of the above" for loans, crypto and banking; DayStead does not move money. If the form asks about budgeting tools, choose the personal finance or budgeting option.

**Health apps declaration:** Yes, the app has health features. Choose medication reminders or medication management. State that it is not a medical device, gives no medical advice, and only records what the user enters.

**Data safety form:**

| Data type | Collected | Shared | Why | Optional |
|---|---|---|---|---|
| Name | Yes | No | Account management, app functionality | Required |
| Email address | Yes | No | Account management | Required |
| Other financial info (bill names, amounts, due dates, paid status) | Yes | No | App functionality | Required for bills |
| Purchase history (subscription status via Google Play and RevenueCat) | Yes | No | App functionality (access to features) | Required |
| Health info (medicine names, dose times, taken or skipped records) | Yes | No | App functionality | Optional (only if the user adds medicines) |
| Other user-generated content (appointments, to-dos, notes, "who is this for") | Yes | No | App functionality | Optional |
| Location, contacts, photos, device or other IDs, advertising ID | No | | | |

Then answer: data is encrypted in transit (yes, HTTPS); users can request deletion (yes, in the app at Account > Delete account, and at the delete account page on the website); data is not sold; no data is used for advertising. Service providers that process data for us (Supabase for storage, RevenueCat and Google Play for subscriptions) are not "sharing" under Google's definitions.

**Account deletion URL** (required for apps with accounts): `https://daystead.app/#/delete-account` (until then `https://web-mwdx.vercel.app/#/delete-account`).

**Permissions that Google may ask about**

| Permission | Why DayStead needs it | Action in Play Console |
|---|---|---|
| Notifications | All reminders | None |
| Exact alarms (`SCHEDULE_EXACT_ALARM`) | Alarm-style medicine reminders at the exact dose time; the user turns it on per medicine | None needed (user grants it in Android settings). Do not add `USE_EXACT_ALARM`, which needs a declaration. |
| Foreground service, media playback | Plays the alarm sound until the user stops it | **Declaration required**: describe "Plays the user's medicine alarm sound until they stop it" and attach a short screen recording of an alarm ringing and being stopped. See the CTO note below. |
| Run at start-up (`RECEIVE_BOOT_COMPLETED`) | Restores alarms after the phone restarts | None |
| Vibrate | Alarm vibration | None |

---

## 4. CTO notes on the build

- **Version numbers** are now managed by EAS (`cli.appVersionSource: remote`) and go up automatically on every store build, so uploads never clash.
- **Two store build profiles** in `mobile/eas.json`:
  - `playtest`: a Play-ready `.aab` for the internal and closed tests. It is not blocked by the release guard, because testing is not a public release.
  - `production`: the public release. Still blocked by `scripts/check-release.cjs` until every item in `mobile/launch-status.json` is true and billing, privacy, terms and support links are set. The guard was not weakened.
- **Uploads go in as drafts** (`releaseStatus: draft`), so nothing reaches users until Purna presses release in Play Console.
- **Risk to watch:** the alarm uses a "media playback" foreground service. Google sometimes questions this type for alarms. If the declaration is rejected, the fix is a small native change (a different service type, or a full-screen alarm notification). Decide only if Google asks; the closed test will show it early.
- **Signing:** let EAS create and manage the upload key on the first `playtest` build, and enrol in Play App Signing (the default). Never commit keystores or the Google service account file to the repo.

---

## 5. Purna's steps, in order

1. Create the Google Play developer account (personal, $25) and verify your identity.
2. In Play Console: Create app > name "DayStead", default language English (United Kingdom), App, Paid features: "Free" app with in-app purchases, accept the declarations.
3. Fill in section 3 (App content) using the tables above.
4. Paste section 1 (store listing), upload the icon and feature graphic from `release/play/`, then the screenshots.
5. On your computer, in `mobile/`: `npx eas-cli@latest build --platform android --profile playtest`. EAS asks to create a signing key: say yes.
6. Upload the build: `npx eas-cli@latest submit --platform android --profile playtest` (the first time, Play Console may require a manual upload of the `.aab` from the EAS build page to the Internal testing track instead).
7. Internal testing first (you and a friend), then Closed testing with your 12 testers for 14 days, then apply for production.
8. Subscriptions and RevenueCat come after the first upload (Google only allows creating subscriptions once a build exists).
