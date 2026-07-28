import type { UserRole } from '../types';

/** Mock kullanıcı hesabı — giriş bu listeye göre doğrulanır (mock backend). */
export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
}

/** E-postayı karşılaştırma için tekilleştirir: kırpılmış + küçük harf. */
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * E-posta ile kullanıcı bul. Büyük/küçük harf ve baştaki/sondaki boşluk
 * farkları aynı hesap sayılır — `Ipek@Rota.app ` ile `ipek@rota.app` tek
 * hesaptır, aksi halde aynı adresle ikinci bir hesap açılabilirdi.
 */
export const findUserByEmail = (email: string): MockUser | undefined => {
  const value = normalizeEmail(email);
  if (!value) return undefined;
  return mockUsers.find((u) => normalizeEmail(u.email) === value);
};

/** Bu e-posta ile zaten bir hesap var mı? */
export const isEmailTaken = (email: string): boolean => findUserByEmail(email) !== undefined;

/**
 * Telefonu karşılaştırma için tekilleştirir: yalnızca rakamlar.
 * "532 114 22 07", "05321142207" ve "+90 532 114 22 07" aynı numaradır.
 */
export const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  // Ülke kodu (90) ve baştaki 0 atılır; karşılaştırma 10 hane üzerinden yapılır.
  if (digits.length > 10 && digits.startsWith('90')) return digits.slice(-10);
  return digits.length > 10 ? digits.slice(-10) : digits.replace(/^0/, '');
};

/** Telefon ile kullanıcı bul. Biçim farkları (boşluk, 0, +90) aynı numaradır. */
export const findUserByPhone = (phone: string): MockUser | undefined => {
  const value = normalizePhone(phone);
  if (value.length < 10) return undefined;
  return mockUsers.find((u) => u.phone && normalizePhone(u.phone) === value);
};

/** Bu telefon ile zaten bir hesap var mı? */
export const isPhoneTaken = (phone: string): boolean => findUserByPhone(phone) !== undefined;

/**
 * Cihazda saklanan hesapları mevcut listeye ekler (id'ye göre tekilleştirerek).
 *
 * Demo hesapları koddan gelir; yalnızca eksik olanlar eklenir ki seed verisi
 * değiştiğinde güncel hali görünsün ve kayıtlar iki kez listelenmesin.
 */
export function mergeSavedUsers(current: MockUser[], saved: MockUser[]): MockUser[] {
  const seen = new Set(current.map((u) => u.id));
  return [...current, ...saved.filter((u) => !seen.has(u.id))];
}

/** Saklanacak hesaplar: koddan gelen demo hesapları hariç, kayıtla açılanlar. */
export function registeredOnly(all: MockUser[], seedIds: Set<string>): MockUser[] {
  return all.filter((u) => !seedIds.has(u.id));
}

/**
 * Demo hesapları. Hepsinin parolası `rota1234`.
 * Giriş: e-posta VEYA telefon + parola.
 */
export const mockUsers: MockUser[] = [
  {
    id: 'u1',
    name: 'İpek Kılıç',
    email: 'ipek@rota.app',
    password: 'rota1234',
    role: 'customer',
    phone: '532 114 22 07',
  },
  {
    id: 'u2',
    name: 'Burak Yılmaz',
    email: 'kurye@rota.app',
    password: 'rota1234',
    role: 'courier',
    phone: '530 441 08 25',
  },
  {
    id: 'u3',
    name: 'Operasyon',
    email: 'admin@rota.app',
    password: 'rota1234',
    role: 'admin',
    phone: '216 494 00 12',
  },
];
