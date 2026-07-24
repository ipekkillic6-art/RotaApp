import type { CardBrand } from '../types';

/**
 * Kart formu için saf doğrulama ve biçimleme.
 *
 * Gerçek ödeme işleme yok; bu katman yalnızca girişi doğrular ve kaydetmeden
 * önce yalnızca son 4 hane + marka çıkarır (tam kart numarası saklanmaz).
 */

export interface CardForm {
  /** Ham girdi; boşluklu olabilir. */
  number: string;
  holder: string;
  /** "AA/YY" biçiminde. */
  expiry: string;
  cvv: string;
}

export const INITIAL_CARD_FORM: CardForm = { number: '', holder: '', expiry: '', cvv: '' };

export type CardFieldKey = 'number' | 'holder' | 'expiry' | 'cvv';

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/** Marka için okunur etiket. */
export const brandLabel = (brand: CardBrand): string =>
  ({
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    troy: 'Troy',
    unknown: 'Kart',
  })[brand];

/** BIN önekinden kart markası. */
export function detectBrand(cardNumber: string): CardBrand {
  const d = digitsOnly(cardNumber);
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|22[2-9]|2[3-6]|27[01]|2720)/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^9792/.test(d)) return 'troy';
  return 'unknown';
}

/** Luhn (mod 10) sağlaması. */
export function luhnValid(cardNumber: string): boolean {
  const d = digitsOnly(cardNumber);
  if (d.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let digit = d.charCodeAt(i) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Amex 15, diğerleri 16 hane bekler. */
function expectedLength(brand: CardBrand): number {
  return brand === 'amex' ? 15 : 16;
}

/** "4242424242424242" → "4242 4242 4242 4242" (amex 4-6-5 gruplu). */
export function formatCardNumber(input: string): string {
  const d = digitsOnly(input);
  const groups = detectBrand(d) === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
  const parts: string[] = [];
  let i = 0;
  for (const size of groups) {
    if (i >= d.length) break;
    parts.push(d.slice(i, i + size));
    i += size;
  }
  if (i < d.length) parts.push(d.slice(i));
  return parts.join(' ');
}

/** Serbest girişi "AA/YY" biçimine getirir. */
export function formatExpiry(input: string): string {
  const d = digitsOnly(input).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

/** "AA/YY" → {month, year(4 hane)} veya null. */
export function parseExpiry(expiry: string): { month: number; year: number } | null {
  const d = digitsOnly(expiry);
  if (d.length !== 4) return null;
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return null;
  return { month, year };
}

/** Son kullanma geçmiş mi? `now` test için dışarıdan verilebilir. */
export function isExpiryInFuture(expiry: string, now: Date): boolean {
  const parsed = parseExpiry(expiry);
  if (!parsed) return false;
  const lastDayOfMonth = new Date(parsed.year, parsed.month, 0, 23, 59, 59);
  return lastDayOfMonth.getTime() >= now.getTime();
}

export function validateCardField(
  field: CardFieldKey,
  form: CardForm,
  now: Date,
): string | undefined {
  switch (field) {
    case 'number': {
      const d = digitsOnly(form.number);
      const brand = detectBrand(d);
      if (d.length < expectedLength(brand)) return 'Kart numarası eksik.';
      if (!luhnValid(d)) return 'Kart numarası geçersiz.';
      return undefined;
    }
    case 'holder':
      return form.holder.trim().length < 3 ? 'Kart üzerindeki ismi gir.' : undefined;
    case 'expiry':
      if (!parseExpiry(form.expiry)) return 'Son kullanma AA/YY biçiminde olmalı.';
      if (!isExpiryInFuture(form.expiry, now)) return 'Kartın son kullanma tarihi geçmiş.';
      return undefined;
    case 'cvv': {
      const need = detectBrand(form.number) === 'amex' ? 4 : 3;
      return digitsOnly(form.cvv).length === need ? undefined : `CVV ${need} haneli olmalı.`;
    }
  }
}

const FIELDS: CardFieldKey[] = ['number', 'holder', 'expiry', 'cvv'];

export function cardErrors(
  form: CardForm,
  now: Date = new Date(),
): Partial<Record<CardFieldKey, string>> {
  const errors: Partial<Record<CardFieldKey, string>> = {};
  for (const field of FIELDS) {
    const message = validateCardField(field, form, now);
    if (message) errors[field] = message;
  }
  return errors;
}

export function canSubmitCard(form: CardForm, now: Date = new Date()): boolean {
  return Object.keys(cardErrors(form, now)).length === 0;
}
