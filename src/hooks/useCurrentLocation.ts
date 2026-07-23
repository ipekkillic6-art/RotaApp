import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import type { Address } from '../types';

type PermissionState = 'granted' | 'denied' | 'undetermined';

/**
 * "Güncel konumu kullan" — izin ister, konumu alır, reverse geocode ile
 * Address'e çevirir. İzin reddedilirse `permission='denied'` döner (ekranlar
 * StateView presetiyle bunu gösterir).
 */
export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [error, setError] = useState<string | undefined>();

  const resolve = useCallback(async (): Promise<Address | null> => {
    setLoading(true);
    setError(undefined);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status === 'granted' ? 'granted' : 'denied');
      if (status !== 'granted') {
        setError('Konum izni verilmedi');
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      return {
        id: `loc-${pos.timestamp}`,
        title: geo?.name ?? 'Güncel konum',
        fullAddress:
          [geo?.street, geo?.district, geo?.city].filter(Boolean).join(', ') || 'Güncel konum',
        city: geo?.city ?? geo?.region ?? '',
        district: geo?.district ?? geo?.subregion ?? '',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konum alınamadı');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resolve, loading, permission, error };
}
