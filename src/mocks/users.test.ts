import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findUserByEmail, isEmailTaken, mockUsers, normalizeEmail } from './users.ts';

test('normalizeEmail boşlukları kırpar ve küçük harfe çevirir', () => {
  assert.equal(normalizeEmail('  Ipek@Rota.APP '), 'ipek@rota.app');
  assert.equal(normalizeEmail(''), '');
});

test('findUserByEmail kayıtlı adresi bulur', () => {
  const user = findUserByEmail('ipek@rota.app');
  assert.equal(user?.id, 'u1');
});

test('findUserByEmail büyük/küçük harf ve boşluk farkını aynı hesap sayar', () => {
  // Aksi halde "Ipek@Rota.app" ile aynı adrese ikinci bir hesap açılabilirdi.
  assert.equal(findUserByEmail('  IPEK@ROTA.APP  ')?.id, 'u1');
});

test('findUserByEmail kayıtsız adres için undefined döner', () => {
  assert.equal(findUserByEmail('yok@rota.app'), undefined);
});

test('findUserByEmail boş girdiyi kullanıcıya eşlemez', () => {
  assert.equal(findUserByEmail('   '), undefined);
});

test('isEmailTaken kayıtlı adres için true, kayıtsız için false', () => {
  assert.equal(isEmailTaken('kurye@rota.app'), true);
  assert.equal(isEmailTaken('KURYE@rota.app'), true);
  assert.equal(isEmailTaken('bos@rota.app'), false);
});

test('demo hesaplarında yinelenen e-posta yok', () => {
  const seen = mockUsers.map((u) => normalizeEmail(u.email));
  assert.equal(new Set(seen).size, seen.length);
});
