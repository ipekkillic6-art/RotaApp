import { useCallback } from 'react';
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

import { ThemeProvider } from './src/design-system';
import { CustomerHomeScreen } from './src/screens/customer/CustomerHomeScreen';
import { deliveries, deliveryHistory } from './src/mocks/deliveries';
import { recentAddresses } from './src/mocks/addresses';

// Fontlar (ileride oturum geri yükleme) bitene kadar splash açık kalsın.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Splash görünmeye devam eder.
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider preference="system">
            {/* GEÇİCİ — Faz 3'te NavigationContainer gelecek */}
            <CustomerHomeScreen
              userName="Deniz Aydın"
              activeDeliveries={[deliveries.onTheWay]}
              recentAddresses={recentAddresses}
              pastDeliveries={deliveryHistory}
              unreadNotifications={3}
            />
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
