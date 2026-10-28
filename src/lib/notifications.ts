import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Schedules a one-off local notification at a specific date/time. Returns the notification id, used later to cancel it. */
export async function scheduleOneOff(
  title: string,
  body: string,
  fireDate: Date,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
}

/** Schedules a notification that repeats daily at a fixed hour/minute. */
export async function scheduleDailyRepeating(
  title: string,
  body: string,
  hour: number,
  minute: number,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function cancelScheduled(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function isPushAvailable(): boolean {
  // Local notifications work in Expo Go on a real device for both platforms;
  // iOS Simulator cannot receive push but calendar/date triggers still fire.
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
