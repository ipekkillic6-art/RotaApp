import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPrice,
  formatDistance,
  formatDuration,
  formatPercent,
  initials,
  maskPhone,
  formatRating,
} from './format.ts';

test('formatPrice: tanımsız → tire', () => {
  assert.equal(formatPrice(undefined), '—');
  assert.equal(formatPrice(NaN), '—');
});

test('formatPrice: ₺ ve ondalık', () => {
  assert.match(formatPrice(1234.5), /1\.234,50/);
  assert.match(formatPrice(1234.5), /₺/);
  assert.equal(formatPrice(1234, { compact: true }), '1.234 ₺'); // ondalıksız
});

test('formatDistance: 1 km altı metre', () => {
  assert.equal(formatDistance(0.5), '500 m');
  assert.equal(formatDistance(11.4), '11,4 km');
});

test('formatDuration: dk / sa', () => {
  assert.equal(formatDuration(30), '30 dk');
  assert.equal(formatDuration(96), '1 sa 36 dk');
  assert.equal(formatDuration(120), '2 sa');
});

test('formatPercent', () => {
  assert.equal(formatPercent(0.968), '%96,8');
});

test('initials', () => {
  assert.equal(initials('Burak Yılmaz'), 'BY');
  assert.equal(initials('İpek Kılıç'), 'İK');
  assert.equal(initials(''), '?');
});

test('maskPhone', () => {
  assert.equal(maskPhone('+90 532 114 22 07'), '+90 532 *** ** 07');
  assert.equal(maskPhone('123'), '123'); // çok kısa → dokunma
});

test('formatRating', () => {
  assert.equal(formatRating(4.9), '4,9');
  assert.equal(formatRating(5), '5,0');
});
