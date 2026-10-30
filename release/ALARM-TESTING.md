# Native alarm implementation — PR 3

Medication schedules now have Gentle / Alarm mode. Alarm selection requests native permission. Unsupported OS versions and Expo Go cannot enable it; existing alarm schedules visibly fall back to gentle reminders if permission becomes unavailable.

## What is implemented

- iOS 26+ AlarmKit fixed-date alarms, OS Stop, and a custom LiveActivityIntent that stops then schedules a five-minute snooze. No countdown presentation is used: those require a Widget extension. Stop and Snooze do not report a medicine as taken.
- Android AlarmManager.setAlarmClock, user-granted SCHEDULE_EXACT_ALARM, a mediaPlayback foreground service, looping alarm audio and vibration, Stop/Snooze notification actions, and ten-minute automatic silence. The service does not force full-screen presentation. Alarm volume/DND/device settings still apply.
- Android persists scheduled times and restores future alarms after boot, package replacement or permission grant. Manual force-stop is not bypassed.
- Account sign-out / reminder disable clears the native queue. Completion removes the dose alarm. Advance 10/5-minute reminders stay ordinary notifications.
- Names of medicines are not put on the lock screen.

## Validation status and limits

TypeScript/lint and Metro exports cannot compile or validate Swift/Kotlin. Native module discovery has been checked for both platforms. This environment has no Xcode/iOS SDK or Android SDK. A signed development build and real-device tests are REQUIRED before merging this as a release feature.

Scheduling still retains a finite window (up to 48 native alarms plus up to 48 ordinary notifications); the app displays coverage dates. It is NOT a perpetual scheduler. Background renewal, cross-device cancellation while the app is closed, subscription-expiry reconciliation while closed, and DST/time-zone travel changes need further implementation before public release. Phone-local scheduled alarms are not revoked remotely by signing out another device. Multiple simultaneous Android alarms share one ringing service and Stop silences that shared ringing session; dose records remain separate.

## Device tests

1. Create a medicine dose two minutes ahead, enable phone reminders and Alarm mode. Lock phone / close app. Verify actual sound and vibration at the dose time.
2. Stop: sound stops, dose remains unrecorded. Snooze: sound stops and returns in five minutes, still unrecorded.
3. Mark taken in app: that occurrence's alarm is removed, next dose retained. Delete / edit schedule / sign out / disable reminders and verify pending alarms disappear.
4. iPhone iOS 26+: grant and deny AlarmKit permissions; test Silent/Focus, Stop and custom Snooze. Verify on older iOS that no native alarm is claimed.
5. Android: deny/grant exact alarm and notification permissions; check alarm volume zero, DND, battery saver, reboot, app update and force-stop. Test snooze then reboot.
6. Test two doses at the same time, five-minute snooze crossing midnight, account changes, purchase expiry and large schedules approaching queue capacity.
7. Check privacy on lock screen and screen-reader labels; verify no false 'taken' event is recorded by alarm controls.

On the owner's Mac, from mobile/: npm ci; npx expo run:ios --device (Xcode 26+); npx expo run:android --device (Android SDK). Alternatively configure the EAS project and run npx eas-cli build --profile development for each platform. Expo Go cannot test this module.
