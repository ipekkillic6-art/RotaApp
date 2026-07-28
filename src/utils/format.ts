/**
 * Formatting helpers.
 *
 * Centralised so a price renders identically in a card, a summary and a
 * receipt — and so switching locale later is one file, not forty call sites.
 */

const LOCALE = 'tr-TR';

/** `1234.5` → `"1.234,50 ₺"`. Pass `compact` to drop the decimals. */
export function formatPrice(
  amount: number | undefined,
  options: { compact?: boolean } = {},
): string {
  if (amount === undefined || Number.isNaN(amount)) return '—';
  const value = amount.toLocaleString(LOCALE, {
    minimumFractionDigits: options.compact ? 0 : 2,
    maximumFractionDigits: options.compact ? 0 : 2,
  });
  return `${value} ₺`;
}

/** `11.4` → `"11,4 km"`; below 1 km switches to metres. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toLocaleString(LOCALE, { maximumFractionDigits: 1 })} km`;
}

/** `96` → `"1 sa 36 dk"`. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} sa` : `${h} sa ${m} dk`;
}

const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, TIME_FORMAT);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, DATE_FORMAT);
}

/**
 * `"1 Temmuz 2027"` — yılı da yazar.
 *
 * `formatDate` yılı bilinçli olarak atar; teslimat tarihleri günler içindedir
 * ve yıl gürültüdür. Aylar/yıllar sonrasını gösteren yerlerde (üyelik
 * yenileme tarihi) yıl olmadan tarih belirsiz kalır.
 */
export function formatDateWithYear(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { ...DATE_FORMAT, year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** `0.968` → `"%96,8"`. */
export function formatPercent(ratio: number, digits = 1): string {
  return `%${(ratio * 100).toLocaleString(LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

/** `"Burak Yılmaz"` → `"BY"`. Used by the avatar fallback. */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** `"+90 532 114 22 07"` → `"+90 532 *** ** 07"` for non-privileged views. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  return `${phone.slice(0, 7)} *** ** ${digits.slice(-2)}`;
}

/** `4.9` → `"4,9"`. */
export function formatRating(rating: number): string {
  return rating.toLocaleString(LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
