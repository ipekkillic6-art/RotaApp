import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { telUrl } from '../utils/phone';

/**
 * Numarayı telefon uygulamasında açar.
 *
 * Numara eksik ya da aranamayacak kadar kısaysa sessizce hiçbir şey yapmak
 * yerine sebebini söyler. Arama başarısız olursa numara ekranda gösterilir ki
 * kullanıcı elle arayabilsin (simülatörde arama hep başarısız olur).
 */
export function useCallPhone() {
  return useCallback(async (phone?: string | null, who = 'Numara') => {
    const url = telUrl(phone);
    if (!url) {
      Alert.alert('Aranamadı', `${who} için kayıtlı bir telefon numarası yok.`, [
        { text: 'Tamam' },
      ]);
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Aranamadı', phone ?? '', [{ text: 'Tamam' }]);
    }
  }, []);
}
