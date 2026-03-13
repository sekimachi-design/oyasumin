import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBedtimeReminder(targetTime: string) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hours, minutes] = targetTime.split(':').map(Number);

  // Notify 30 minutes before target
  let reminderHour = hours;
  let reminderMinute = minutes - 30;
  if (reminderMinute < 0) {
    reminderMinute += 60;
    reminderHour -= 1;
    if (reminderHour < 0) reminderHour += 24;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'おやすみん',
      body: 'そろそろおやすみ準備の時間だよ',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminderHour,
      minute: reminderMinute,
    },
  });
}

export async function cancelAll() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
