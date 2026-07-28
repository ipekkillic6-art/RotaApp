import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRICING, quotePrice } from './pricing.ts';

const input = {
  distanceKm: 10,
  packageType: 'small' as const,
  speed: 'standard' as const,
  membershipActive: false,
};

// 49 taban + 10 km × 7,5 = 75 mesafe, small paket ek ücreti 0 → 124
test('standart, üyeliksiz: taban + mesafe', () => {
  const p = quotePrice(input);
  assert.equal(p.base, 49);
  assert.equal(p.distance, 75);
  assert.equal(p.extras, 0);
  assert.equal(p.discount, 0);
  assert.equal(p.total, 124);
});

test('paket tipi ek hizmet ücretine yansır', () => {
  const p = quotePrice({ ...input, packageType: 'large' });
  assert.equal(p.extras, PRICING.packageSurcharge.large);
  assert.equal(p.total, 124 + PRICING.packageSurcharge.large);
});

test('ekspres ek ücreti taban+mesafe üzerinden, paket ücretinden değil', () => {
  const p = quotePrice({ ...input, speed: 'express', packageType: 'large' });
  // (49 + 75) × 0,5 = 62 ekspres + 35 paket = 97 ek hizmet
  assert.equal(p.extras, 97);
  assert.equal(p.total, 49 + 75 + 97);
});

test('üyelik + standart: taban ve mesafe düşer, ek hizmetler kalır', () => {
  const p = quotePrice({ ...input, packageType: 'large', membershipActive: true });
  assert.equal(p.discount, 124);
  assert.equal(p.total, PRICING.packageSurcharge.large);
});

test('üyelik + standart + ek hizmetsiz paket: teslimat tamamen ücretsiz', () => {
  const p = quotePrice({ ...input, membershipActive: true });
  assert.equal(p.total, 0);
});

test('üyelik + ekspres: toplam üzerinden %20 indirim', () => {
  const p = quotePrice({ ...input, speed: 'express', membershipActive: true });
  // 49 + 75 + 62 = 186 → %20 = 37,2 indirim → 148,8
  assert.equal(p.extras, 62);
  assert.equal(p.discount, 37.2);
  assert.equal(p.total, 148.8);
});

test('üyeliksiz ekspreste indirim yok', () => {
  const p = quotePrice({ ...input, speed: 'express' });
  assert.equal(p.discount, 0);
});

test('indirim toplamı negatife düşürmez', () => {
  const p = quotePrice({ ...input, distanceKm: 0, membershipActive: true });
  assert.equal(p.total, 0);
  assert.ok(p.discount <= p.base + p.distance + p.extras);
});

test('negatif mesafe sıfır kabul edilir', () => {
  const p = quotePrice({ ...input, distanceKm: -5 });
  assert.equal(p.distance, 0);
  assert.equal(p.total, 49);
});

test('kuruş artığı toplamı bozmaz', () => {
  const p = quotePrice({ ...input, distanceKm: 11.4, speed: 'express', membershipActive: true });
  assert.equal(p.total, Math.round(p.total * 100) / 100);
  assert.equal(p.base + p.distance + p.extras - p.discount, p.total);
});
