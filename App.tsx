import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { NavigationContainer } from '@react-navigation/native';

import { ThemeProvider } from './src/design-system';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { ROUTES } from './src/navigation/routes';
import { useAuthStore } from './src/stores/authStore';
import { useQueueStore } from './src/stores/queueStore';
import {
  setupAndroidChannels,
  registerForPushNotifications,
  addNotificationResponseListener,
} from './src/services/pushNotifications';

// Bildirime tıklanınca ilgili ekrana git.
function routeNotification(data: Record<string, unknown>) {
  if (!navigationRef.isReady()) return;
  const deliveryId = typeof data.deliveryId === 'string' ? data.deliveryId : undefined;
  if (!deliveryId) return;
  const kind = data.kind;
  if (kind === 'delivery_completed' || kind === 'delivery_failed') {
    navigationRef.navigate(ROUTES.DELIVERY_DETAIL, { deliveryId });
  } else {
    navigationRef.navigate(ROUTES.TRACK, { deliveryId });
  }
}

// Fontlar + oturum geri yükleme bitene kadar splash açık kalsın.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const restore = useAuthStore((s) => s.restore);
  const restoring = useAuthStore((s) => s.restoring);

  // Açılışta token'dan oturumu geri yükle + çevrimdışı kuyruğu başlat.
  useEffect(() => {
    restore();
    useQueueStore.getState().init();
  }, [restore]);

  // Push: kanallar + izin/kayıt + tıklama yönlendirmesi.
  useEffect(() => {
    setupAndroidChannels();
    registerForPushNotifications();
    return addNotificationResponseListener(routeNotification);
  }, []);

  const ready = (fontsLoaded || Boolean(fontError)) && !restoring;

  const onLayoutRootView = useCallback(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return null; // Splash görünmeye devam eder.
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider preference="system">
            <NavigationContainer ref={navigationRef}>
              <RootNavigator />
            </NavigationContainer>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
