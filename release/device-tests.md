# Device test log

Physical-device results reported by the owner. A launch checklist item in `mobile/launch-status.json` only turns true when every test it covers has passed on both Android and iPhone.

## 1 November 2026: Android, development build (EAS), tested by Purna

| # | Test | Result |
|---|---|---|
| 1 | Phone locked: a medicine dose 5 minutes ahead still rings | Pass |
| 2 | App swiped away: the dose still rings | Pass |
| 3 | Dose marked taken early: no alarm for it | Pass |
| 4 | Snooze one dose 5 minutes: only that dose moves | Pass |
| 5 | Bill due in 3 days: reminder arrives; lock screen shows only "Daystead reminder" | Pass |
| 6 | Dose left unmarked: "Missed" follow-up about 30 minutes later | Not tested |
| 7 | Dose marked taken on the website: the phone cancels its reminder after the app is opened | Pass |
| 8 | Phone restarted: the next reminder still arrives | Not tested |

Also confirmed: the native alarm-style medicine alert works on Android in the development build. Expo Go only shows gentle notifications.

**Still needed before `backgroundRemindersAndMultiDeviceTestsPassed` can be true:** tests 6 and 8 on Android, all 8 tests on an iPhone, course end dates stopping reminders, and reminders stopping when a subscription ends.
