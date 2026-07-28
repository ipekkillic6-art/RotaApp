import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_ADDRESS_FORM,
  addressErrors,
  addressToForm,
  applyAddressPatch,
  canSubmitAddress,
  toCreateAddressPayload,
  validateAddressField,
  type AddressForm,
} from './addressValidation.ts';
import type { Address } from '../types/index.ts';

const savedWithCoords: Address = {
  id: 'adr-01',
  title: 'Ofis',
  fullAddress: 'Büyükdere Cad. No:127 Astoria Kule A, Kat 12',
  city: 'İstanbul',
  district: 'Şişli',
  latitude: 41.0766,
  longitude: 29.0116,
};

test('addressToForm koordinatı taşır', () => {
  // Taşımazsa, adresin yalnızca başlığını düzeltip kaydetmek konumu silerdi.
  const f = addressToForm(savedWithCoords);
  assert.equal(f.latitude, 41.0766);
  assert.equal(f.longitude, 29.0116);
});

test('düzenleme gidiş-dönüşünde koordinat korunur', () => {
  const edited = { ...addressToForm(savedWithCoords), title: 'Ofis (yeni)' };
  const payload = toCreateAddressPayload(edited);
  assert.equal(payload.latitude, 41.0766);
  assert.equal(payload.longitude, 29.0116);
});

test('koordinatsız adres payload da koordinatsız kalır', () => {
  const plain = { ...savedWithCoords, latitude: undefined, longitude: undefined };
  const payload = toCreateAddressPayload(addressToForm(plain));
  assert.equal(payload.latitude, undefined);
  assert.equal(payload.longitude, undefined);
});

test('applyAddressPatch: adres metni ELLE değişince koordinat düşer', () => {
  // Haritadan seçilen nokta artık yazılan adrese ait değil.
  const next = applyAddressPatch(addressToForm(savedWithCoords), {
    fullAddress: 'Bambaşka bir cadde No:5',
  });
  assert.equal(next.latitude, undefined);
  assert.equal(next.longitude, undefined);
  assert.equal(next.fullAddress, 'Bambaşka bir cadde No:5');
});

test('applyAddressPatch: metin ve koordinat birlikte gelirse korunur', () => {
  // Haritadan/GPS'ten gelen güncelleme bu yoldan geçer.
  const next = applyAddressPatch(INITIAL_ADDRESS_FORM, {
    fullAddress: 'Caferağa Mah. No:44',
    latitude: 40.99,
    longitude: 29.02,
  });
  assert.equal(next.latitude, 40.99);
  assert.equal(next.longitude, 29.02);
});

test('applyAddressPatch: adres dışı alan değişince koordinat korunur', () => {
  const next = applyAddressPatch(addressToForm(savedWithCoords), { title: 'Ofis (yeni)' });
  assert.equal(next.latitude, 41.0766);
});

const form = (patch: Partial<AddressForm> = {}): AddressForm => ({
  ...INITIAL_ADDRESS_FORM,
  ...patch,
});

/** Tüm zorunlu alanları dolu, gönderilebilir bir form. */
const valid = (patch: Partial<AddressForm> = {}): AddressForm =>
  form({
    title: 'Ev',
    fullAddress: 'Caferağa Mah. General Asım Gündüz Cad. No:44 D:9',
    district: 'Kadıköy',
    ...patch,
  });

test('boş form gönderilemez ve dört zorunlu alanı işaretler', () => {
  assert.equal(canSubmitAddress(form()), false);
  const errors = addressErrors(form());
  assert.ok(errors.title);
  assert.ok(errors.fullAddress);
  assert.ok(errors.district);
  // Şehir başlangıçta 'İstanbul' dolu — hata vermemeli.
  assert.equal(errors.city, undefined);
});

test('başlık en az 2 karakter olmalı', () => {
  assert.ok(validateAddressField('title', valid({ title: 'E' })));
  assert.equal(validateAddressField('title', valid({ title: 'Ev' })), undefined);
});

test('açık adres en az 10 karakter olmalı', () => {
  assert.ok(validateAddressField('fullAddress', valid({ fullAddress: 'Kısa' })));
  assert.equal(validateAddressField('fullAddress', valid()), undefined);
});

test('şehir ve ilçe boş bırakılamaz (sadece boşluk da geçmez)', () => {
  assert.ok(validateAddressField('city', valid({ city: '   ' })));
  assert.ok(validateAddressField('district', valid({ district: '' })));
});

test('telefon opsiyonel; boşken hata yok, eksik hane girildiyse hata var', () => {
  assert.equal(validateAddressField('contactPhone', valid({ contactPhone: '' })), undefined);
  assert.ok(validateAddressField('contactPhone', valid({ contactPhone: '532 11' })));
  assert.equal(
    validateAddressField('contactPhone', valid({ contactPhone: '532 114 22 07' })),
    undefined,
  );
});

test('zorunlu alanlar dolunca gönderilebilir', () => {
  assert.equal(canSubmitAddress(valid()), true);
});

test('geçersiz telefon gönderimi engeller', () => {
  assert.equal(canSubmitAddress(valid({ contactPhone: '532' })), false);
});

test('payload trim uygular ve boş opsiyonelleri undefined yapar', () => {
  const payload = toCreateAddressPayload(
    valid({ title: '  Ofis  ', contactName: '   ', note: '  kapıda bırak  ' }),
  );
  assert.equal(payload.title, 'Ofis');
  assert.equal(payload.contactName, undefined);
  assert.equal(payload.note, 'kapıda bırak');
  assert.equal(payload.city, 'İstanbul');
});

test('addressToForm mevcut adresi forma çevirir, eksik opsiyonelleri boş yapar', () => {
  const editForm = addressToForm({
    id: 'adr-99',
    title: 'Depo',
    fullAddress: 'Orhanlı Mah. Gebze Yolu Cad. No:214',
    city: 'İstanbul',
    district: 'Tuzla',
    // contactName / contactPhone / note yok → '' olmalı
  });
  assert.equal(editForm.title, 'Depo');
  assert.equal(editForm.district, 'Tuzla');
  assert.equal(editForm.contactName, '');
  assert.equal(editForm.contactPhone, '');
  assert.equal(editForm.note, '');
  // Düzenlemeye açılan mevcut adres gönderilebilir olmalı.
  assert.equal(canSubmitAddress(editForm), true);
});
