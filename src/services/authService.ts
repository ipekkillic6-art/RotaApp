import { api, ApiError } from '../utils/api';
import {
  findUserByEmail,
  findUserByPhone,
  isEmailTaken,
  isPhoneTaken,
  mergeSavedUsers,
  mockUsers,
  normalizeEmail,
  registeredOnly,
  type MockUser,
} from '../mocks/users';
import { secure, STORAGE_KEYS } from '../utils/storage';
import type { UserRole } from '../types';

/* ── Mock hesap kalıcılığı ───────────────────────────────────────────────
 *
 * `mockUsers` bellekte bir dizi; kayıt olan kullanıcı uygulama yeniden
 * başlayınca kayboluyordu ve bir daha giriş yapamıyordu. Mock backend'in
 * "veritabanı" görevini görsün diye açılan hesaplar cihazda saklanır.
 *
 * Yalnızca kayıtla eklenenler saklanır; demo hesapları koddan gelir, böylece
 * seed verisi değişince güncel hali görünür. Parola içerdiği için AsyncStorage
 * yerine `secure` (Keychain) kullanılır.
 *
 * Gerçek backend bağlanınca bu blok tamamen silinir.
 */

const SEED_IDS = new Set(mockUsers.map((u) => u.id));
let usersLoaded = false;

async function ensureUsersLoaded(): Promise<void> {
  if (usersLoaded) return;
  usersLoaded = true;
  try {
    const raw = await secure.get(STORAGE_KEYS.mockUsers);
    if (!raw) return;
    const saved = JSON.parse(raw) as MockUser[];
    // mockUsers referansı paylaşıldığı için yerinde güncellenir.
    mockUsers.splice(0, mockUsers.length, ...mergeSavedUsers([...mockUsers], saved));
  } catch {
    // Bozuk kayıt varsa demo hesaplarıyla devam et — giriş tamamen kilitlenmesin.
  }
}

async function persistRegisteredUsers(): Promise<void> {
  await secure.set(
    STORAGE_KEYS.mockUsers,
    JSON.stringify(registeredOnly(mockUsers, SEED_IDS)),
  );
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginPayload {
  /** E-posta veya telefon. */
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  /** Kurye bu numaradan ulaşır; girişte e-posta yerine de kullanılabilir. */
  phone: string;
  password: string;
  role: UserRole;
}

export interface ChangePasswordPayload {
  email: string;
  currentPassword: string;
  newPassword: string;
}

const sessionFor = (user: MockUser): AuthSession => ({
  token: `mock-token-${user.id}`,
  refreshToken: `mock-refresh-${user.id}`,
  user: { id: user.id, name: user.name, email: user.email, role: user.role },
});

/**
 * E-posta VEYA telefon ile kullanıcı bul.
 *
 * Her iki arama da kayıt tarafındaki normalize kurallarını kullanır — aksi
 * halde "532 114 22 07" olarak kaydolan biri "0532 114 22 07" yazarak giriş
 * yapamazdı.
 */
const findByIdentifier = (identifier: string): MockUser | undefined =>
  findUserByEmail(identifier) ?? findUserByPhone(identifier);

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthSession>('/auth/login', {
      noAuth: true,
      body: payload,
      mock: async () => {
        // Kayıtlı hesaplar cihazdan yüklenmeden arama yapılırsa, daha önce
        // açılmış bir hesapla giriş "şifre hatalı" gibi görünür.
        await ensureUsersLoaded();
        const user = findByIdentifier(payload.email);
        if (!user || user.password !== payload.password) {
          throw new ApiError(401, 'E-posta/telefon veya şifre hatalı.');
        }
        return sessionFor(user);
      },
    }),

  register: (payload: RegisterPayload) =>
    api.post<AuthSession>('/auth/register', {
      noAuth: true,
      body: payload,
      mock: async () => {
        // Tekillik kontrolü kayıtlı hesapları da kapsamalı; yoksa aynı
        // e-postayla ikinci hesap açılabilirdi.
        await ensureUsersLoaded();
        // Aynı e-postayla ikinci hesap açılamaz. Hata alanı `email` olarak
        // etiketlenir ki kayıt formu uyarıyı ilgili alanın altında gösterebilsin.
        if (isEmailTaken(payload.email)) {
          throw new ApiError(
            409,
            'Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyebilirsin.',
            { field: 'email' },
          );
        }
        // Telefon da tekil: girişte kimlik olarak kullanılabildiği için iki
        // hesap aynı numarayı taşırsa hangisine giriş yapılacağı belirsizleşir.
        if (isPhoneTaken(payload.phone)) {
          throw new ApiError(
            409,
            'Bu telefon numarası ile zaten bir hesap var.',
            { field: 'phone' },
          );
        }
        const user: MockUser = {
          id: `u-${Date.now()}`,
          name: payload.name,
          // Kayıtlı adres normalize saklanır; liste tek biçimli kalır.
          email: normalizeEmail(payload.email),
          password: payload.password,
          role: payload.role,
          phone: payload.phone.trim(),
        };
        mockUsers.push(user);
        await persistRegisteredUsers();
        return sessionFor(user);
      },
    }),

  /** Parola sıfırlama isteği. Güvenlik gereği e-posta kayıtlı olmasa da başarı döner. */
  requestPasswordReset: (email: string) =>
    api.post<void>('/auth/password/reset', {
      noAuth: true,
      body: { email },
      mock: () => undefined,
    }),

  changePassword: (payload: ChangePasswordPayload) =>
    api.post<void>('/auth/password/change', {
      body: payload,
      mock: async () => {
        await ensureUsersLoaded();
        const user = findUserByEmail(payload.email);
        if (!user || user.password !== payload.currentPassword) {
          throw new ApiError(400, 'Mevcut şifre yanlış.');
        }
        user.password = payload.newPassword;
        // Kalıcı yazılmazsa yeniden başlatınca eski parola geri gelirdi.
        await persistRegisteredUsers();
      },
    }),

  logout: () => api.post<void>('/auth/logout', { mock: () => undefined }),

  me: () => api.get<AuthUser>('/auth/me', { mock: () => sessionFor(mockUsers[0]).user }),
};
