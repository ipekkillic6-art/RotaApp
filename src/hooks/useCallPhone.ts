import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { telUrl } from '../utils/phone';

/**
 * Numarayı telefon uygulamasında açar.
 *
 * Cihaz arama yapamıyorsa (simülatör, iPad) `openURL` HATA FIRLATMAZ — sessizce
 * başarılı döner ve kullanıcı butona bastığında hiçbir şey olmaz. Bu yüzden
 * önce `canOpenURL` ile kontrol edilir; açılamıyorsa numara ekranda gösterilir
 * ki kullanıcı elle arayabilsin.
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
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // Aşağıdaki bilgilendirmeye düş.
    }
    Alert.alert('Bu cihazdan arama yapılamıyor', `${who}: ${phone}`, [{ text: 'Tamam' }]);
  }, []);
}
