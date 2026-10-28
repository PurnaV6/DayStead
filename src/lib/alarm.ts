import { Vibration } from 'react-native';
import { scheduleOneOff } from './notifications';

/**
 * Buzzes the device for ~5 seconds and fires an immediate local
 * notification with the system's default sound — works even if the app is
 * backgrounded, unlike an in-app-only alarm. Vibration.vibrate's pattern
 * array alternates [wait, buzz, wait, buzz, ...]; summed to roughly 5s here.
 */
export function triggerAlarm(title: string, body: string): void {
  Vibration.vibrate([0, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500], false);

  // DATE trigger ~1s out — the same scheduling API already proven to work
  // for bill/appointment reminders, used here for a near-immediate fire
  // rather than relying on an undocumented "fire now" trigger shape.
  const fireAt = new Date(Date.now() + 1000);
  scheduleOneOff(title, body, fireAt).catch(() => {
    // Notification permission may be denied — the vibration still ran.
  });
}

export function stopAlarm(): void {
  Vibration.cancel();
}
