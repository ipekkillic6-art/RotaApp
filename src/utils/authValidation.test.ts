import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canChangePassword,
  changePasswordErrors,
  emailError,
  identifierError,
  isValidEmail,
  passwordError,
  type ChangePasswordForm,
} from './authValidation.ts';

test('isValidEmail geçerli/geçersiz e-postayı ayırır', () => {
  assert.equal(isValidEmail('ipek@rota.app'), true);
  assert.equal(isValidEmail('a.b-c@sirket.co.uk'), true);
  assert.equal(isValidEmail('ipek@rota'), false);
  assert.equal(isValidEmail('ipekrota.app'), false);
  assert.equal(isValidEmail('ipek @rota.app'), false);
  assert.equal(isValidEmail(''), false);
});

test('emailError boş ve geçersiz için mesaj döner', () => {
  assert.ok(emailError(''));
  assert.ok(emailError('bozuk'));
  assert.equal(emailError('ipek@rota.app'), undefined);
});

test('passwordError uzunluk ve rakam kuralı', () => {
  assert.ok(passwordError('kisa1'));
  assert.ok(passwordError('rakameksiz'));
  assert.equal(passwordError('rota1234'), undefined);
});

test('identifierError e-posta ya da telefonu kabul eder', () => {
  assert.equal(identifierError('ipek@rota.app'), undefined);
  assert.equal(identifierError('532 114 22 07'), undefined);
  assert.ok(identifierError('bozuk@'));
  assert.ok(identifierError('123'));
  assert.ok(identifierError(''));
});

const form = (patch: Partial<ChangePasswordForm> = {}): ChangePasswordForm => ({
  current: 'rota1234',
  next: 'yeni12345',
  confirm: 'yeni12345',
  ...patch,
});

test('changePasswordErrors geçerli formda boş', () => {
  assert.deepEqual(changePasswordErrors(form()), {});
  assert.equal(canChangePassword(form()), true);
});

test('changePassword: eşleşmeyen onay, zayıf/aynı şifre engellenir', () => {
  assert.ok(changePasswordErrors(form({ confirm: 'baska' })).confirm);
  assert.ok(changePasswordErrors(form({ next: 'kisa', confirm: 'kisa' })).next);
  assert.ok(changePasswordErrors(form({ next: 'rota1234', confirm: 'rota1234' })).next);
  assert.ok(changePasswordErrors(form({ current: '' })).current);
});
