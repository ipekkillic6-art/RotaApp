import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Çevrimiçi/çevrimdışı durumu. ScreenScaffold'ın `offline` prop'unu bu besler,
 * offlineQueue (Faz 5.4) bağlantı dönüşünü bununla dinler.
 */
export function useNetworkStatus(): { online: boolean } {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable null olabilir (henüz belirlenmedi) — o durumu çevrimiçi say.
      setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
    });
    return unsubscribe;
  }, []);

  return { online };
}
