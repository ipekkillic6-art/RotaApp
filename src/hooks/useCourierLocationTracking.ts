import { useEffect } from 'react';
import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Kurye konum takibi — PİL DOSTU.
 *
 * Konum dinleyicisi YALNIZCA `enabled` (aktif teslimat + çevrimiçi) iken açılır;
 * teslimat bitince veya kurye çevrimdışı olunca kapatılır. Sürekli arka plan
 * takibi yok — teslimat cihazın pilini bitirmemeli.
 */
export function useCourierLocationTracking(enabled: boolean, onLocation?: (coords: Coords) => void) {
  useEffect(() => {
    if (!enabled) return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 25, timeInterval: 10_000 },
        (pos) => onLocation?.({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      );
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled, onLocation]);
}
