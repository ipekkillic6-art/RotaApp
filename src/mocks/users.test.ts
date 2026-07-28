import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findUserByEmail,
  findUserByPhone,
  isEmailTaken,
  isPhoneTaken,
  mergeSavedUsers,
  mockUsers,
  normalizeEmail,
  normalizePhone,
  registeredOnly,
  type MockUser,
} from './users.ts';

const registered: MockUser = {
  id: 'u-1750000000000',
  name: 'Yeni Kullanıcı',
  email: 'yeni@rota.app',
  password: 'rota1234',
  role: 'customer',
  phone: '555 111 22 33',
};

test('mergeSavedUsers saklanan hesabı listeye ekler', () => {
  const merged = mergeSavedUsers(mockUsers, [registered]);
  assert.equal(merged.length, mockUsers.length + 1);
  assert.ok(merged.some((u) => u.id === registered.id));
});

test('mergeSavedUsers aynı hesabı iki kez eklemez', () => {
  // Uygulama yeniden yüklendiğinde birleştirme tekrar çalışır.
  const once = mergeSavedUsers(mockUsers, [registered]);
  const twice = mergeSavedUsers(once, [registered]);
  assert.equal(twice.length, once.length);
});

test('mergeSavedUsers demo hesaplarını koddaki haliyle bırakır', () => {
  // Seed verisi değişirse güncel hali görünmeli; saklanan kopya ezmemeli.
  const staleSeed: MockUser = { ...mockUsers[0], name: 'ESKİ İSİM' };
  const merged = mergeSavedUsers(mockUsers, [staleSeed]);
  assert.equal(merged.find((u) => u.id === mockUsers[0].id)?.name, mockUsers[0].name);
});

test('registeredOnly demo hesaplarını saklamaz', () => {
  const seedIds = new Set(mockUsers.map((u) => u.id));
  const all = [...mockUsers, registered];
  const toSave = registeredOnly(all, seedIds);
  assert.deepEqual(toSave, [registered]);
});

test('registeredOnly hiç kayıt yoksa boş dizi verir', () => {
  const seedIds = new Set(mockUsers.map((u) => u.id));
  assert.deepEqual(registeredOnly(mockUsers, seedIds), []);
});

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

test('normalizePhone biçim farklarını aynı numaraya indirger', () => {
  // Aynı numara: boşluklu, baştaki 0'lı, ülke kodlu ve +90'lı yazımlar.
  assert.equal(normalizePhone('532 114 22 07'), '5321142207');
  assert.equal(normalizePhone('0532 114 22 07'), '5321142207');
  assert.equal(normalizePhone('+90 532 114 22 07'), '5321142207');
  assert.equal(normalizePhone('905321142207'), '5321142207');
});

test('findUserByPhone kayıtlı numarayı biçimden bağımsız bulur', () => {
  assert.equal(findUserByPhone('532 114 22 07')?.id, 'u1');
  assert.equal(findUserByPhone('0532 114 22 07')?.id, 'u1');
  assert.equal(findUserByPhone('+90 532 114 22 07')?.id, 'u1');
});

test('findUserByPhone eksik haneli girdiyi eşlemez', () => {
  // Aksi halde "532" gibi kısa bir girdi rastgele bir hesaba düşebilirdi.
  assert.equal(findUserByPhone('532'), undefined);
  assert.equal(findUserByPhone(''), undefined);
});

test('findUserByPhone kayıtsız numara için undefined döner', () => {
  assert.equal(findUserByPhone('555 000 00 00'), undefined);
});

test('isPhoneTaken kayıtlı için true, kayıtsız için false', () => {
  assert.equal(isPhoneTaken('0532 114 22 07'), true);
  assert.equal(isPhoneTaken('555 000 00 00'), false);
});

test('boş telefonlu kayıt kimseye eşleşmez', () => {
  // Telefonu boş olan hesaplar (eski kayıtlar) aramaya takılmamalı.
  assert.equal(mockUsers.every((u) => u.phone.length > 0), true);
  assert.equal(findUserByPhone('   '), undefined);
});

test('demo hesaplarında yinelenen telefon yok', () => {
  const seen = mockUsers.map((u) => normalizePhone(u.phone));
  assert.equal(new Set(seen).size, seen.length);
});
