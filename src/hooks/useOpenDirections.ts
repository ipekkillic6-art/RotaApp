import { useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { directionsUrls, type DirectionsTarget } from '../utils/maps';
import type { Address } from '../types';

/**
 * Adresi cihazın harita uygulamasında yol tarifiyle açar.
 *
 * Önce platformun kendi navigasyon uygulaması denenir (kurye sürüş modunda
 * doğrudan yola çıksın), açılamazsa tarayıcıdaki Google Maps'e düşülür.
 * Adresin koordinatı varsa o kullanılır — aynı isimli caddeler metin aramada
 * yanlış noktaya götürebiliyor.
 */
export function useOpenDirections() {
  return useCallback(async (address?: Address | null) => {
    const target: DirectionsTarget = {
      latitude: address?.latitude,
      longitude: address?.longitude,
      label: address ? [address.fullAddress, address.district, address.city].filter(Boolean).join(', ') : undefined,
    };

    const urls = directionsUrls(target, Platform.OS);
    if (urls.length === 0) {
      Alert.alert('Yol tarifi açılamadı', 'Bu görevde adres bilgisi yok.', [{ text: 'Tamam' }]);
      return;
    }

    for (const url of urls) {
      try {
        if (await Linking.canOpenURL(url)) {
          await Linking.openURL(url);
          return;
        }
      } catch {
        // Bu bağlantı açılamadı; sıradakini dene.
      }
    }

    Alert.alert('Yol tarifi açılamadı', 'Cihazda uygun bir harita uygulaması bulunamadı.', [
      { text: 'Tamam' },
    ]);
  }, []);
}
