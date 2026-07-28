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
