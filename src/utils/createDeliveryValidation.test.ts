import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_FORM,
  canProceedForStep,
  contactErrors,
  type CreateDeliveryForm,
} from './createDeliveryValidation.ts';

const form = (patch: Partial<CreateDeliveryForm> = {}): CreateDeliveryForm => ({
  ...INITIAL_FORM,
  ...patch,
});

/** Geçerli bir iletişim adımı. */
const contacts = (patch: Partial<CreateDeliveryForm> = {}) =>
  form({
    senderPhone: '532 114 22 07',
    recipientName: 'Elif Şahin',
    recipientPhone: '545 208 91 33',
    ...patch,
  });

test('contacts: geçerli bilgilerle geçilebilir', () => {
  assert.equal(canProceedForStep('contacts', contacts()), true);
  assert.deepEqual(contactErrors(contacts()), {});
});

test('contacts: alıcı numarası eksik haneliyse geçilemez', () => {
  // Teslimat kodu bu numaraya gidiyor; sadece "dolu" olması yetmez.
  const f = contacts({ recipientPhone: '545 208' });
  assert.equal(canProceedForStep('contacts', f), false);
  assert.ok(contactErrors(f).recipientPhone);
});

test('contacts: gönderici numarası geçersizse geçilemez', () => {
  const f = contacts({ senderPhone: '123' });
  assert.equal(canProceedForStep('contacts', f), false);
  assert.ok(contactErrors(f).senderPhone);
});

test('contacts: alıcı adı boşsa geçilemez', () => {
  const f = contacts({ recipientName: '   ' });
  assert.equal(canProceedForStep('contacts', f), false);
  assert.equal(contactErrors(f).recipientName, 'Alıcının adı gerekli.');
});

test('pickup: adres seçilene kadar geçilemez', () => {
  assert.equal(canProceedForStep('pickup', form()), false);
  assert.equal(canProceedForStep('pickup', form({ pickupAddressId: 'adr-01' })), true);
});

test('dropoff: seçili ve pickup ile aynı olmamalı', () => {
  assert.equal(canProceedForStep('dropoff', form({ pickupAddressId: 'adr-01' })), false);
  assert.equal(
    canProceedForStep('dropoff', form({ pickupAddressId: 'adr-01', dropoffAddressId: 'adr-01' })),
    false,
  );
  assert.equal(
    canProceedForStep('dropoff', form({ pickupAddressId: 'adr-01', dropoffAddressId: 'adr-02' })),
    true,
  );
});

test('contacts: alıcı adı + telefon + gönderici telefon zorunlu', () => {
  assert.equal(canProceedForStep('contacts', form()), false);
  assert.equal(
    canProceedForStep('contacts', form({ recipientName: 'Ali', recipientPhone: '545 208 91 33' })),
    true,
  );
  assert.equal(
    canProceedForStep('contacts', form({ recipientName: '  ', recipientPhone: '545 208 91 33' })),
    false,
  );
  // Eskiden "555" gibi eksik haneli bir numarayla geçilebiliyordu; teslimat
  // kodu o numaraya gideceği için artık geçilemiyor.
  assert.equal(
    canProceedForStep('contacts', form({ recipientName: 'Ali', recipientPhone: '555' })),
    false,
  );
});

test('price: sorgu sürerken/başarısızken geçilemez', () => {
  assert.equal(canProceedForStep('price', form()), true);
  assert.equal(canProceedForStep('price', form(), { quoting: true, quoteFailed: false }), false);
  assert.equal(canProceedForStep('price', form(), { quoting: false, quoteFailed: true }), false);
});

test('payment: kart seçilene kadar geçilemez', () => {
  assert.equal(canProceedForStep('payment', form()), false);
  assert.equal(canProceedForStep('payment', form({ paymentCardId: 'card-01' })), true);
});

test('package/schedule/confirm: her zaman geçilebilir', () => {
  assert.equal(canProceedForStep('package', form()), true);
  assert.equal(canProceedForStep('schedule', form()), true);
  assert.equal(canProceedForStep('confirm', form()), true);
});
