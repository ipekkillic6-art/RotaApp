import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coordOf } from './geo.ts';

test('coordOf ikisi de doluyken koordinat verir', () => {
  assert.deepEqual(coordOf({ latitude: 41.0766, longitude: 29.0116 }), {
    latitude: 41.0766,
    longitude: 29.0116,
  });
});

test('coordOf yarım koordinatı reddeder', () => {
  // Yarımı geçirseydik eksik alan 0 olur ve işaret Gine Körfezi'ne düşerdi.
  assert.equal(coordOf({ latitude: 41.0766 }), undefined);
  assert.equal(coordOf({ longitude: 29.0116 }), undefined);
});

test('coordOf boş girdiyi güvenle karşılar', () => {
  assert.equal(coordOf(undefined), undefined);
  assert.equal(coordOf(null), undefined);
  assert.equal(coordOf({}), undefined);
});

test('coordOf NaN kabul etmez', () => {
  assert.equal(coordOf({ latitude: NaN, longitude: 29 }), undefined);
});

test('coordOf sıfır koordinatı geçerli sayar', () => {
  // 0,0 gerçek bir noktadır; "boş" ile karıştırılmamalı.
  assert.deepEqual(coordOf({ latitude: 0, longitude: 0 }), { latitude: 0, longitude: 0 });
});
