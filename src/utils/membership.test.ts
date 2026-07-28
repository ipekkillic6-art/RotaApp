import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addPeriod,
  benefitsEndAt,
  canCancel,
  canSubscribe,
  hasActiveBenefits,
  savingPercent,
} from './membership.ts';
import type { Membership, MembershipPlan } from '../types/index.ts';

const monthly: MembershipPlan = {
  id: 'monthly',
  name: 'Aylık',
  price: 149,
  period: 'month',
  monthlyEquivalent: 149,
  benefits: [],
};

const yearly: MembershipPlan = {
  id: 'yearly',
  name: 'Yıllık',
  price: 1490,
  period: 'year',
  monthlyEquivalent: 124.17,
  benefits: [],
};

const NOW = new Date('2026-07-28T10:00:00.000Z');

test('addPeriod bir ay ekler', () => {
  assert.equal(addPeriod(new Date('2026-01-15T00:00:00.000Z'), 'month').getMonth(), 1);
});

test('addPeriod bir yıl ekler', () => {
  assert.equal(addPeriod(new Date('2026-01-15T00:00:00.000Z'), 'year').getFullYear(), 2027);
});

test('savingPercent yıllık planın tasarrufunu verir', () => {
  assert.equal(savingPercent(monthly, yearly), 17);
});

test('savingPercent aylık ücret sıfırsa 0 döner', () => {
  assert.equal(savingPercent({ ...monthly, monthlyEquivalent: 0 }, yearly), 0);
});

test('hasActiveBenefits: active üyelik geçerlidir', () => {
  const m: Membership = { status: 'active', planId: 'monthly' };
  assert.equal(hasActiveBenefits(m, NOW), true);
});

test('hasActiveBenefits: üyelik yoksa geçerli değildir', () => {
  assert.equal(hasActiveBenefits({ status: 'none' }, NOW), false);
});

test('hasActiveBenefits: iptal edilmiş üyelik dönem sonuna kadar sürer', () => {
  // Kullanıcı ödediği dönemi kullanır — iptal anında hak kaybı olmaz.
  const m: Membership = { status: 'cancelled', endsAt: '2026-08-28T10:00:00.000Z' };
  assert.equal(hasActiveBenefits(m, NOW), true);
});

test('hasActiveBenefits: süresi dolmuş iptal geçerli değildir', () => {
  const m: Membership = { status: 'cancelled', endsAt: '2026-07-01T10:00:00.000Z' };
  assert.equal(hasActiveBenefits(m, NOW), false);
});

test('canSubscribe: avantajı süren üyelik varken yeni üyelik alınamaz', () => {
  assert.equal(canSubscribe({ status: 'active' }, NOW), false);
  assert.equal(
    canSubscribe({ status: 'cancelled', endsAt: '2026-08-28T10:00:00.000Z' }, NOW),
    false,
  );
});

test('canSubscribe: üyelik yokken veya süresi dolmuşken alınabilir', () => {
  assert.equal(canSubscribe({ status: 'none' }, NOW), true);
  assert.equal(
    canSubscribe({ status: 'cancelled', endsAt: '2026-07-01T10:00:00.000Z' }, NOW),
    true,
  );
});

test('canCancel yalnızca yürürlükteki üyelik için true', () => {
  assert.equal(canCancel({ status: 'active' }), true);
  assert.equal(canCancel({ status: 'cancelled', endsAt: '2026-08-28T10:00:00.000Z' }), false);
  assert.equal(canCancel({ status: 'none' }), false);
});

test('benefitsEndAt yalnızca iptal edilmiş üyelikte tarih verir', () => {
  assert.equal(benefitsEndAt({ status: 'cancelled', endsAt: '2026-08-28T10:00:00.000Z' }), '2026-08-28T10:00:00.000Z');
  assert.equal(benefitsEndAt({ status: 'active', renewsAt: '2026-08-28T10:00:00.000Z' }), undefined);
});
