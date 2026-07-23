import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { notificationService } from './notificationService';

/**
 * Push bildirim kurulumu.
 *
 * NOT: Gerçek uzaktan push teslimi Firebase (Android) / APNs (iOS) kimlik
 * bilgilerini gerektirir — bunlar EAS credentials ile eklenir (yol haritası
 * Ek B). Buradaki kod izin akışı, kanallar, token kaydı ve tıklama
 * yönlendirmesini kurar; token simülatörde alınamaz (gerçek cihaz gerekir).
 */

// Ön planda gelen bildirim davranışı.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/** Android bildirim kanalları. */
export async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('delivery', {
    name: 'Teslimat',
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync('task', {
    name: 'Görev',
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.setNotificationChannelAsync('ops', {
    name: 'Operasyon uyarısı',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** İzin ister; verilirse push token'ı alıp sunucuya kaydeder. */
export async function registerForPushNotifications(): Promise<string | null> {
  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return null;

  // Uzaktan push token'ı yalnızca gerçek cihazda alınabilir.
  if (!Device.isDevice) return null;
  try {
    const token = (await Notifications.getDevicePushTokenAsync()).data;
    const value = String(token);
    await notificationService.registerPushToken(value);
    return value;
  } catch {
    // EAS credentials olmadan token alınamayabilir.
    return null;
  }
}

/** Bildirime tıklanınca çağrılır; içeriğin data'sını verir. */
export function addNotificationResponseListener(
  onOpen: (data: Record<string, unknown>) => void,
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    onOpen((response.notification.request.content.data ?? {}) as Record<string, unknown>);
  });
  return () => sub.remove();
}
