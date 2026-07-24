import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import type { Address } from '../types';

/**
 * Koordinat → Address. Haritadan seçilen noktayı adres alanlarına çevirir
 * (useCurrentLocation ile aynı eşleme, ama GPS yerine verilen koordinat).
 */
export function useReverseGeocode() {
  const [loading, setLoading] = useState(false);

  const resolve = useCallback(
    async (latitude: number, longitude: number): Promise<Address | null> => {
      setLoading(true);
      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
        return {
          id: `map-${Math.round(latitude * 1e5)}-${Math.round(longitude * 1e5)}`,
          title: geo?.name ?? 'Seçilen konum',
          fullAddress:
            [geo?.street, geo?.district, geo?.city].filter(Boolean).join(', ') || 'Seçilen konum',
          city: geo?.city ?? geo?.region ?? '',
          district: geo?.district ?? geo?.subregion ?? '',
          latitude,
          longitude,
        };
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { resolve, loading };
}
