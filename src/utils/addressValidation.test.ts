import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_ADDRESS_FORM,
  addressErrors,
  addressToForm,
  canSubmitAddress,
  toCreateAddressPayload,
  validateAddressField,
  type AddressForm,
} from './addressValidation.ts';

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
