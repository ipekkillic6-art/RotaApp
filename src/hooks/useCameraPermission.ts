import { useCameraPermissions } from 'expo-camera';

/**
 * Kamera izni sarmalayıcısı.
 *
 * Paket alım/teslim fotoğrafı ve QR okuma için kamera izni. Reddedilirse
 * ekranlar StateView presetiyle açıklama gösterir; `canAskAgain` false ise
 * kullanıcı Ayarlar'a yönlendirilir.
 */
export function useCameraPermission() {
  const [permission, requestPermission] = useCameraPermissions();
  return {
    granted: permission?.granted ?? false,
    canAskAgain: permission?.canAskAgain ?? true,
    request: requestPermission,
  };
}
