import { test } from 'node:test';
import assert from 'node:assert/strict';
import { directionsUrls } from './maps.ts';

const coords = { latitude: 41.0766, longitude: 29.0116 };

test('iOS: önce Apple Maps sürüş tarifi, sonra web yedeği', () => {
  const [native, web] = directionsUrls(coords, 'ios');
  assert.ok(native.startsWith('maps://?daddr='));
  assert.ok(native.includes('dirflg=d'));
  assert.ok(web.startsWith('https://www.google.com/maps/dir/'));
});

test('Android: önce google.navigation, sonra web yedeği', () => {
  const [native, web] = directionsUrls(coords, 'android');
  assert.ok(native.startsWith('google.navigation:q='));
  assert.ok(web.startsWith('https://'));
});

test('bilinmeyen platformda yalnızca web bağlantısı', () => {
  const urls = directionsUrls(coords, 'web');
  assert.equal(urls.length, 1);
  assert.ok(urls[0].startsWith('https://'));
});

test('koordinat varsa adres metni yerine koordinat kullanılır', () => {
  // Koordinat daha kesin: aynı isimli caddeler yanlış noktaya götürebilir.
  const [native] = directionsUrls({ ...coords, label: 'Büyükdere Cad. No:127' }, 'ios');
  assert.ok(native.includes('41.0766%2C29.0116'));
  assert.ok(!native.includes('B%C3%BCy%C3%BCkdere'));
});

test('koordinat yoksa adres metniyle arama yapılır', () => {
  const [native] = directionsUrls({ label: 'Caferağa Mah. No:44' }, 'ios');
  assert.ok(native.includes('Cafera'));
});

test('adres metni URL için kaçışlanır', () => {
  const [native] = directionsUrls({ label: 'Bağdat Cad. No:12/4 & Daire:7' }, 'ios');
  assert.ok(!native.includes(' '));
  assert.ok(!native.includes('&Daire'));
});

test('yarım koordinat adres metnine düşer', () => {
  const [native] = directionsUrls({ latitude: 41.0766, label: 'Ofis' }, 'ios');
  assert.ok(native.includes('Ofis'));
});

test('hedef bilgisi yoksa boş dizi', () => {
  // Çağıran taraf kullanıcıya sebebini söyleyebilsin.
  assert.deepEqual(directionsUrls({}, 'ios'), []);
  assert.deepEqual(directionsUrls({ label: '   ' }, 'android'), []);
});
