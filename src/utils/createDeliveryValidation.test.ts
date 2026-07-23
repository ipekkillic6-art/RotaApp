import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_FORM,
  canProceedForStep,
  type CreateDeliveryForm,
} from './createDeliveryValidation.ts';

const form = (patch: Partial<CreateDeliveryForm> = {}): CreateDeliveryForm => ({
  ...INITIAL_FORM,
  ...patch,
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
    canProceedForStep('contacts', form({ recipientName: 'Ali', recipientPhone: '555' })),
    true,
  );
  assert.equal(
    canProceedForStep('contacts', form({ recipientName: '  ', recipientPhone: '555' })),
    false,
  );
});

test('price: sorgu sürerken/başarısızken geçilemez', () => {
  assert.equal(canProceedForStep('price', form()), true);
  assert.equal(canProceedForStep('price', form(), { quoting: true, quoteFailed: false }), false);
  assert.equal(canProceedForStep('price', form(), { quoting: false, quoteFailed: true }), false);
});

test('package/schedule/confirm: her zaman geçilebilir', () => {
  assert.equal(canProceedForStep('package', form()), true);
  assert.equal(canProceedForStep('schedule', form()), true);
  assert.equal(canProceedForStep('confirm', form()), true);
});
