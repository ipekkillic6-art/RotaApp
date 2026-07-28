import type { Membership, MembershipPlan } from '../types';

/**
 * Üyelik kuralları — saf fonksiyonlar.
 *
 * Tarih hesapları `now`'u parametre olarak alır; `Date.now()` içeride
 * okunmaz. Böylece kurallar deterministik olarak test edilebilir.
 */

/** Bir dönem sonrasının tarihi. Ay sonu taşmalarını JS Date'in kendi kuralı çözer. */
export function addPeriod(from: Date, period: MembershipPlan['period']): Date {
  const next = new Date(from.getTime());
  if (period === 'year') next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

/**
 * Yıllık planın aylığa göre tasarruf yüzdesi (tam sayıya yuvarlanır).
 * İki planın `monthlyEquivalent` değerinden türetilir.
 */
export function savingPercent(monthly: MembershipPlan, yearly: MembershipPlan): number {
  if (monthly.monthlyEquivalent <= 0) return 0;
  const ratio = 1 - yearly.monthlyEquivalent / monthly.monthlyEquivalent;
  return Math.max(0, Math.round(ratio * 100));
}

/**
 * Avantajlar şu an geçerli mi?
 *
 * `cancelled` üyelik dönem sonuna kadar avantajları sürdürür — kullanıcı
 * ödediği süreyi kullanır. Süre dolduysa artık geçerli değildir.
 */
export function hasActiveBenefits(membership: Membership, now: Date): boolean {
  if (membership.status === 'active') return true;
  if (membership.status !== 'cancelled' || !membership.endsAt) return false;
  return new Date(membership.endsAt).getTime() > now.getTime();
}

/** Yeni üyelik başlatılabilir mi? Avantajı süren bir üyelik varken hayır. */
export function canSubscribe(membership: Membership, now: Date): boolean {
  return !hasActiveBenefits(membership, now);
}

/** İptal edilebilir mi? Yalnızca yürürlükteki (`active`) üyelik iptal edilir. */
export function canCancel(membership: Membership): boolean {
  return membership.status === 'active';
}

/** Üyeliğin avantajlarının biteceği tarih — yoksa undefined. */
export function benefitsEndAt(membership: Membership): string | undefined {
  if (membership.status === 'cancelled') return membership.endsAt;
  return undefined;
}
