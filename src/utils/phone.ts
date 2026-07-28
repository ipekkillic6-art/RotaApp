/**
 * Telefon araması bağlantısı — saf, node --test ile doğrulanır.
 * Açma işini `useCallPhone` yapar.
 */

/** `tel:` için güvenli numara: rakamlar ve baştaki `+` dışındaki her şey atılır. */
export function dialableNumber(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const trimmed = phone.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  const digits = trimmed.replace(/\D/g, '');
  // 10 haneden kısa numara aranabilir değildir (kısa kodlar bu akışta yok).
  if (digits.length < 10) return undefined;
  return `${plus}${digits}`;
}

/** `tel:` bağlantısı; numara aranabilir değilse `undefined`. */
export function telUrl(phone?: string | null): string | undefined {
  const number = dialableNumber(phone);
  return number ? `tel:${number}` : undefined;
}
