import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dialableNumber, telUrl } from './phone.ts';

test('dialableNumber boşluk ve ayraçları atar', () => {
  assert.equal(dialableNumber('532 114 22 07'), '5321142207');
  assert.equal(dialableNumber('(0532) 114-22-07'), '05321142207');
});

test('dialableNumber baştaki + işaretini korur', () => {
  // Ülke kodu düşerse arama yanlış numaraya gider.
  assert.equal(dialableNumber('+90 532 114 22 07'), '+905321142207');
});

test('dialableNumber eksik haneli numarayı reddeder', () => {
  assert.equal(dialableNumber('532 114'), undefined);
  assert.equal(dialableNumber('—'), undefined);
});

test('dialableNumber boş girdiyi güvenle karşılar', () => {
  assert.equal(dialableNumber(undefined), undefined);
  assert.equal(dialableNumber(null), undefined);
  assert.equal(dialableNumber('   '), undefined);
});

test('telUrl geçerli numara için tel: bağlantısı verir', () => {
  assert.equal(telUrl('+90 532 114 22 07'), 'tel:+905321142207');
});

test('telUrl aranamayan numara için undefined', () => {
  // Çağıran taraf butonu pasifleştirebilsin ya da sebebini söyleyebilsin.
  assert.equal(telUrl('yok'), undefined);
  assert.equal(telUrl(undefined), undefined);
});
