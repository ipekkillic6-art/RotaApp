/**
 * Koordinat yardımcıları.
 *
 * Domain nesnelerinde (Address, Courier) enlem/boylam opsiyoneldir. Haritaya
 * ancak İKİSİ de doluyken nokta verilebilir; yarım koordinat 0'a düşerse
 * işaret Gine Körfezi'ne çizilir.
 */

export interface Coord {
  latitude: number;
  longitude: number;
}

/** İkisi de doluysa koordinat, değilse `undefined`. */
export function coordOf(
  source?: { latitude?: number; longitude?: number } | null,
): Coord | undefined {
  if (!source) return undefined;
  const { latitude, longitude } = source;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return undefined;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return undefined;
  return { latitude, longitude };
}

/** Dünya yarıçapı (km). */
const EARTH_RADIUS_KM = 6371;

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

/**
 * İki nokta arasındaki kuş uçuşu mesafe (km) — haversine.
 *
 * Küresel yaklaşım; şehir içi mesafelerde hata payı metre mertebesindedir.
 */
export function haversineKm(a: Coord, b: Coord): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Yol mesafesi katsayısı.
 *
 * Kuş uçuşu mesafe her zaman gerçek sürüş mesafesinden kısadır; şehir içinde
 * yollar dolambaçlıdır. Gerçek rota servisi gelene kadar makul bir kat
 * uygulanır — fiyatın olduğundan ucuz görünmesini engeller.
 */
export const ROAD_FACTOR = 1.3;

/**
 * İki adres arasındaki tahmini YOL mesafesi (km, tek ondalık).
 *
 * Koordinatlardan biri eksikse `undefined` döner — çağıran taraf kendi
 * yedeğine düşer. Uydurma bir mesafe üretmek fiyatı sessizce yanlışlar.
 */
export function estimatedRoadDistanceKm(
  from?: { latitude?: number; longitude?: number } | null,
  to?: { latitude?: number; longitude?: number } | null,
): number | undefined {
  const a = coordOf(from);
  const b = coordOf(to);
  if (!a || !b) return undefined;
  return Math.round(haversineKm(a, b) * ROAD_FACTOR * 10) / 10;
}
