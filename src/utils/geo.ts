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
