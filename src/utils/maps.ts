/**
 * Harita uygulamasında yol tarifi bağlantıları.
 *
 * Saf fonksiyon — Linking/Platform'a dokunmaz, node --test ile doğrulanır.
 * Açma işini `useOpenDirections` yapar.
 */

export interface DirectionsTarget {
  latitude?: number;
  longitude?: number;
  /** Koordinat yoksa adres metniyle arama yapılır. */
  label?: string;
}

/** Koordinat varsa "41.0766,29.0116"; yoksa adres metni; ikisi de yoksa undefined. */
function destinationOf(target: DirectionsTarget): string | undefined {
  const { latitude, longitude, label } = target;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return `${latitude},${longitude}`;
  }
  return label?.trim() || undefined;
}

/**
 * Denenecek bağlantılar, sırayla.
 *
 * Önce platformun kendi navigasyon uygulaması (kurye için sürüş modu doğrudan
 * açılsın), açılamazsa tarayıcıdaki Google Maps. Hedef bilgisi hiç yoksa boş
 * dizi döner — çağıran taraf kullanıcıya sebebini söyler.
 */
export function directionsUrls(target: DirectionsTarget, os: string): string[] {
  const destination = destinationOf(target);
  if (!destination) return [];

  const encoded = encodeURIComponent(destination);
  // Her iki platformda da çalışan yedek.
  const web = `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;

  if (os === 'ios') {
    // dirflg=d → sürüş tarifi.
    return [`maps://?daddr=${encoded}&dirflg=d`, web];
  }
  if (os === 'android') {
    // google.navigation doğrudan yol tarifini başlatır.
    return [`google.navigation:q=${encoded}&mode=d`, web];
  }
  return [web];
}
