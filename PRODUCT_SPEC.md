# Daystead by Provifi — Product Spec (source of truth)

Tagline: **Your day, in order.**

This supersedes the earlier pricing/scope decisions recorded in README.md and
`src/lib/plan.ts`'s original free-tier model. Where they conflict, this file wins.
Status markers below (`[done]` / `[partial]` / `[not started]`) reflect the mobile
app's actual code as of this commit, not aspiration.

## 1. The application

Daystead is a mobile life-admin app: see what needs doing, know how much money to
keep available, get reminders before things become overdue. Built for ordinary
people managing everyday responsibilities — usable for all sections or only the
ones relevant to a given user.

## 2. Dashboard — must answer three questions immediately

- What needs my attention today?
- What payments are coming up?
- How much money do I need to keep available?

| Element | Status |
|---|---|
| Personal greeting (name + date) | `[partial]` — date shown, no name/account yet |
| Financial summary (scheduled/paid/remaining) | `[partial]` — "money needed before payday" exists; no separate scheduled-vs-paid summary cards |
| Money needed before payday/period | `[done]` (`src/lib/money.ts`) |
| Coloured donut chart by category | `[not started]` |
| Upcoming payments (amount/date/method/status) | `[partial]` — amount/date/status shown, no payment method field yet |
| Medication schedule + recorded responses | `[partial]` — "mark taken" exists, no Snooze/Skip yet |
| Appointments | `[done]` (basic) |
| Quick actions (add bill/medicine/appointment) | `[partial]` — per-screen add buttons exist, no unified quick-add |

## 3. Guided setup (onboarding)

**`[not started]`** in the mobile app. Target flow: Name → Bills → Medicines →
Appointments → Review → Notification setup. Every section skippable. Bill category
picker (rent, mortgage, credit card, insurance, utilities, subscriptions, custom).
Medication time groups (Morning/Afternoon/Evening) alongside exact times. Final
review screen + test notification.

## 4. Bills and payment planning

- Core fields `[done]`: name, category, amount (confirmed/estimate), due date,
  frequency, reminder timing.
- Payment method + payment-account label `[not started]`.
- **Payment states** — current code has `scheduled | paid | overdue` only.
  **Target per this spec: `scheduled | paid | overdue_unconfirmed | failed |
  cancelled`** `[not started — needs a type/schema change]`. Key rule: reaching
  the Direct Debit date never auto-marks paid.
- "This payment only vs. future occurrences" edit `[not started]`.
- Planning view: until payday / 7 days / month, with manual balance →
  projected shortfall `[partial]` — payday-only exists; 7-day/month toggle and
  shortfall projection not built. Balance must show last-updated time `[done]`.
- Must never double-subtract a completed payment or imply untracked spending is
  included — hold this as a correctness constraint for any future change here.

## 5. Medication reminders

- Name, instructions (free text), exact times, frequency, start/end date
  `[done]`.
- **Advance-alert cascade** (e.g. 7:50/7:55/8:00 for an 8:00 dose) `[not
  started]` — current code fires once, at the scheduled time only.
- **Actions: Taken / Snooze / Skip** `[partial]` — only "Taken" exists.
  Dismissing a notification must never count as Taken. Snoozing one occurrence
  must not shift later scheduled times.
- Ending a course cancels its future alerts `[not started]`.
- Explicitly scheduling support only, never dosage recommendations.

## 6. Appointments

Title, date/time, location, notes, advance reminder `[done]`. Reschedule/cancel/
mark-completed actions `[not started]` (currently delete-only).

## 7. MVP vs. public V1

| Stage | Deliverable |
|---|---|
| MVP for testing | Guided setup, dashboard, bills chart/calculations, recurring bills, medication schedules, appointments, working device reminders |
| Public V1 | + subscriptions, purchase restoration, secure backup/recovery, export/deletion, accessibility, support, reliable offline handling |

**The published web dashboard (`web/`) is a design prototype only** — sample
data in the browser, no notifications, no payments, no bank connection. It is
not the mobile MVP.

## 8. Pricing — REVISED, supersedes earlier £2.99/£29.99 plan

| Plan | Price |
|---|---|
| Full-feature trial | 30 days free |
| Monthly | £3.99 |
| Annual | £35.99 |

**No permanent unlimited free tier.** The whole app is paid after the trial.
`src/lib/plan.ts` currently implements the OLD model (free tier capped at 5
bills/3 meds/5 appointments, £2.99/£29.99 Plus) — **this needs to be rewritten**
to a trial-expiry model instead of a feature-cap model. Not yet done.

Failed-renewal handling (banner + exact stop date, 7-day recovery window keeping
reminders live, restore on success, else pause paid features but keep records
readable/exportable) `[not started]`.

These are launch hypotheses, not proven prices — retention and paid renewal
have to validate them, not just stated income goals.

## 9. V2 — only where demand justifies it

Travel planning, expense tracking, statement/receipt imports, suggested
recurring-bill detection, household sharing, bank connections, AI assistance
(reduces typing / proposes entries from natural language like "Add my £25 phone
bill on the 12th every month" — user reviews before saving; money math,
reminder scheduling and subscription status stay rule-governed, never AI-decided).

## 10. Build order

1. Finalise dashboard + setup flows
2. Bill recurrence + financial calculations
3. Device reminders, implemented and tested
4. Medication + appointment flows
5. Backup, subscriptions, account controls
6. Real-world testing through one full billing cycle
7. Launch, then measure paid renewal + support cost

Success signal: do users finish setup, maintain records, return regularly, and
pay to continue — not just "does it sound useful."
