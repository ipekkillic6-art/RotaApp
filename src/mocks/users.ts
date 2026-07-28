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
