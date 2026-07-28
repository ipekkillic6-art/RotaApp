import type { Membership, MembershipPlan } from '../types';

/**
 * Rota Plus planları (mock).
 *
 * Yıllık planın `monthlyEquivalent` değeri aylık plandan düşüktür — indirim
 * oranı ekranda bu iki sayıdan hesaplanır, ayrıca bir alanda tutulmaz ki
 * fiyat değiştiğinde tutarsız kalmasın.
 */
export const membershipPlans: MembershipPlan[] = [
  {
    id: 'monthly',
    name: 'Aylık',
    price: 149,
    period: 'month',
    monthlyEquivalent: 149,
    benefits: [
      'Sınırsız ücretsiz standart teslimat',
      'Ekspres teslimatta %20 indirim',
      'Öncelikli kurye eşleştirme',
      'Öncelikli destek hattı',
    ],
  },
  {
    id: 'yearly',
    name: 'Yıllık',
    price: 1490,
    period: 'year',
    monthlyEquivalent: 124.17,
    benefits: [
      'Sınırsız ücretsiz standart teslimat',
      'Ekspres teslimatta %20 indirim',
      'Öncelikli kurye eşleştirme',
      'Öncelikli destek hattı',
      '2 ay bedava — yıllık ödemede',
    ],
  },
];

/** Başlangıçta üyelik yok; satın alma servis üzerinden bu kaydı değiştirir. */
export const initialMembership: Membership = { status: 'none' };
