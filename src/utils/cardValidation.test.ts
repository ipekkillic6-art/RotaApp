import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_CARD_FORM,
  canSubmitCard,
  cardErrors,
  detectBrand,
  formatCardNumber,
  formatExpiry,
  isExpiryInFuture,
  luhnValid,
  parseExpiry,
  validateCardField,
  type CardForm,
} from './cardValidation.ts';

// Sabit "şimdi" — testler deterministik olsun.
const NOW = new Date('2026-07-24T12:00:00Z');

const form = (patch: Partial<CardForm> = {}): CardForm => ({ ...INITIAL_CARD_FORM, ...patch });

// Geçerli örnek (Luhn'dan geçer): 4242 4242 4242 4242 (Visa test kartı).
const valid = (patch: Partial<CardForm> = {}): CardForm =>
  form({ number: '4242 4242 4242 4242', holder: 'İpek Kılıç', expiry: '12/30', cvv: '123', ...patch });

test('detectBrand önekten markayı bulur', () => {
  assert.equal(detectBrand('4242424242424242'), 'visa');
  assert.equal(detectBrand('5555555555554444'), 'mastercard');
  assert.equal(detectBrand('371449635398431'), 'amex');
  assert.equal(detectBrand('9792000000000000'), 'troy');
  assert.equal(detectBrand('6011000000000000'), 'unknown');
});

test('luhnValid geçerli/geçersiz numarayı ayırır', () => {
  assert.equal(luhnValid('4242424242424242'), true);
  assert.equal(luhnValid('4242424242424241'), false);
  assert.equal(luhnValid('123'), false);
});

test('formatCardNumber 4-lü gruplar (amex 4-6-5)', () => {
  assert.equal(formatCardNumber('4242424242424242'), '4242 4242 4242 4242');
  assert.equal(formatCardNumber('371449635398431'), '3714 496353 98431');
});

test('formatExpiry AA/YY üretir', () => {
  assert.equal(formatExpiry('12'), '12');
  assert.equal(formatExpiry('1230'), '12/30');
  assert.equal(formatExpiry('12/30'), '12/30');
});

test('parseExpiry ay/yıl çıkarır, geçersiz ayı reddeder', () => {
  assert.deepEqual(parseExpiry('12/30'), { month: 12, year: 2030 });
  assert.equal(parseExpiry('13/30'), null);
  assert.equal(parseExpiry('1/30'), null);
});

test('isExpiryInFuture geçmiş tarihi reddeder', () => {
  assert.equal(isExpiryInFuture('12/30', NOW), true);
  assert.equal(isExpiryInFuture('01/20', NOW), false);
  // İçinde bulunulan ay hâlâ geçerli.
  assert.equal(isExpiryInFuture('07/26', NOW), true);
});

test('boş form gönderilemez ve tüm alanları işaretler', () => {
  assert.equal(canSubmitCard(form(), NOW), false);
  const errors = cardErrors(form(), NOW);
  assert.ok(errors.number && errors.holder && errors.expiry && errors.cvv);
});

test('geçerli kart gönderilebilir', () => {
  assert.equal(canSubmitCard(valid(), NOW), true);
  assert.deepEqual(cardErrors(valid(), NOW), {});
});

test('Luhn geçmeyen numara ve geçmiş tarih engeller', () => {
  assert.ok(validateCardField('number', valid({ number: '4242 4242 4242 4241' }), NOW));
  assert.ok(validateCardField('expiry', valid({ expiry: '01/20' }), NOW));
});

test('CVV uzunluğu markaya göre (amex 4, diğer 3)', () => {
  assert.equal(validateCardField('cvv', valid({ cvv: '123' }), NOW), undefined);
  assert.ok(validateCardField('cvv', valid({ cvv: '12' }), NOW));
  // Amex 4 hane ister.
  const amex = valid({ number: '3714 496353 98431', cvv: '123' });
  assert.ok(validateCardField('cvv', amex, NOW));
  assert.equal(validateCardField('cvv', { ...amex, cvv: '1234' }, NOW), undefined);
});
