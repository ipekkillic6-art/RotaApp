import type { DeliverySpeed, PackageTypeId, PriceBreakdown } from '../types';

/**
 * Teslimat ücreti — saf hesap.
 *
 * RN/store'dan bağımsız; node --test ile doğrulanır. Servis mock'u ve ileride
 * gerçek backend aynı kuralı paylaşsın diye tarife burada tek yerde durur.
 */

export const PRICING = {
  /** Her teslimatta alınan taban ücret (TRY). */
  baseFare: 49,
  /** Kilometre başına ücret (TRY). */
  perKm: 7.5,
  /** Paket tipine göre ek hizmet ücreti (TRY). */
  packageSurcharge: {
    document: 0,
    small: 0,
    medium: 15,
    large: 35,
    fragile: 25,
    food: 20,
    special: 45,
  } as Record<PackageTypeId, number>,
  /** Ekspreste taban+mesafe ücretine uygulanan kat. 1.5 → %50 ek ücret. */
  expressMultiplier: 1.5,
  /** Rota Plus üyesine ekspreste uygulanan indirim oranı. */
  membershipExpressDiscount: 0.2,
} as const;

export interface QuoteInput {
  distanceKm: number;
  packageType: PackageTypeId;
  speed: DeliverySpeed;
  /**
   * Üyelik avantajları geçerli mi.
   *
   * Bu bilgiyi SUNUCU belirler — istemci göndermez. Mock'ta da üyelik kaydı
   * servis tarafında okunur, aksi halde istemci kendine indirim yazabilirdi.
   */
  membershipActive: boolean;
}

/** Para birimini iki haneye yuvarlar; kayan nokta artığı toplamı bozmasın. */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Ücreti kalem kalem hesaplar.
 *
 * Üyelik avantajları:
 * - Standart: taban + mesafe ücreti düşülür (ek hizmetler ödenmeye devam eder).
 *   "Sınırsız ücretsiz standart teslimat" bunu ifade eder — özel paket
 *   ücretini üyelik karşılamaz.
 * - Ekspres: toplam üzerinden %20 indirim.
 */
export function quotePrice(input: QuoteInput): PriceBreakdown {
  const { distanceKm, packageType, speed, membershipActive } = input;

  const km = Math.max(0, distanceKm);
  const base = round2(PRICING.baseFare);
  const distance = round2(PRICING.perKm * km);

  const packageFee = PRICING.packageSurcharge[packageType] ?? 0;
  // Ekspres ek ücreti taban+mesafe üzerinden hesaplanır, paket ücretinden değil.
  const expressFee =
    speed === 'express' ? round2((base + distance) * (PRICING.expressMultiplier - 1)) : 0;
  const extras = round2(packageFee + expressFee);

  const discount = round2(
    !membershipActive
      ? 0
      : speed === 'standard'
        ? base + distance
        : (base + distance + extras) * PRICING.membershipExpressDiscount,
  );

  // İndirim hiçbir koşulda toplamı negatife düşürmemeli.
  const gross = round2(base + distance + extras);
  const appliedDiscount = Math.min(discount, gross);

  return {
    base,
    distance,
    extras,
    discount: appliedDiscount,
    total: round2(gross - appliedDiscount),
    currency: 'TRY',
  };
}
