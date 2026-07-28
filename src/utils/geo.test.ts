import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROAD_FACTOR, coordOf, estimatedRoadDistanceKm, haversineKm } from './geo.ts';

const sisli = { latitude: 41.0766, longitude: 29.0116 };
const kadikoy = { latitude: 40.9903, longitude: 29.027 };

test('haversineKm aynı nokta için sıfır', () => {
  assert.equal(haversineKm(sisli, sisli), 0);
});

test('haversineKm iki yönde de aynı sonucu verir', () => {
  assert.equal(haversineKm(sisli, kadikoy), haversineKm(kadikoy, sisli));
});

test('haversineKm Şişli–Kadıköy arasını doğru ölçer', () => {
  // Kuş uçuşu ~9,7 km; 100 m tolerans.
  assert.ok(Math.abs(haversineKm(sisli, kadikoy) - 9.7) < 0.1);
});

test('haversineKm uzun mesafede de tutarlı', () => {
  // İstanbul–Ankara kuş uçuşu ~350 km.
  const ankara = { latitude: 39.9334, longitude: 32.8597 };
  assert.ok(Math.abs(haversineKm(sisli, ankara) - 350) < 10);
});

test('estimatedRoadDistanceKm yol katsayısını uygular', () => {
  const straight = haversineKm(sisli, kadikoy);
  const road = estimatedRoadDistanceKm(sisli, kadikoy);
  assert.equal(road, Math.round(straight * ROAD_FACTOR * 10) / 10);
  // Yol mesafesi kuş uçuşundan kısa olamaz.
  assert.ok(road! > straight);
});

test('estimatedRoadDistanceKm koordinat eksikse undefined', () => {
  // Uydurma mesafe üretmek fiyatı sessizce yanlışlardı.
  assert.equal(estimatedRoadDistanceKm(sisli, { latitude: 40.99 }), undefined);
  assert.equal(estimatedRoadDistanceKm(undefined, kadikoy), undefined);
});

test('estimatedRoadDistanceKm aynı adres için sıfır', () => {
  assert.equal(estimatedRoadDistanceKm(sisli, sisli), 0);
});

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
