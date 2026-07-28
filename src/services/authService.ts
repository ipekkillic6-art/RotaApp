import { api, ApiError } from '../utils/api';
import {
  findUserByEmail,
  isEmailTaken,
  mockUsers,
  normalizeEmail,
  type MockUser,
} from '../mocks/users';
import type { UserRole } from '../types';

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
  password: string;
  role: UserRole;
}

export interface ChangePasswordPayload {
  email: string;
  currentPassword: string;
  newPassword: string;
}

const digitsOnly = (value: string): string => value.replace(/\D/g, '');

const sessionFor = (user: MockUser): AuthSession => ({
  token: `mock-token-${user.id}`,
  refreshToken: `mock-refresh-${user.id}`,
  user: { id: user.id, name: user.name, email: user.email, role: user.role },
});

/** E-posta VEYA telefon ile kullanıcı bul. */
const findByIdentifier = (identifier: string): MockUser | undefined => {
  const value = identifier.trim().toLowerCase();
  const phone = digitsOnly(identifier);
  return mockUsers.find(
    (u) => u.email.toLowerCase() === value || (phone.length >= 10 && digitsOnly(u.phone) === phone),
  );
};

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthSession>('/auth/login', {
      noAuth: true,
      body: payload,
      mock: () => {
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
      mock: () => {
        // Aynı e-postayla ikinci hesap açılamaz. Hata alanı `email` olarak
        // etiketlenir ki kayıt formu uyarıyı ilgili alanın altında gösterebilsin.
        if (isEmailTaken(payload.email)) {
          throw new ApiError(
            409,
            'Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyebilirsin.',
            { field: 'email' },
          );
        }
        const user: MockUser = {
          id: `u-${Date.now()}`,
          name: payload.name,
          // Kayıtlı adres normalize saklanır; liste tek biçimli kalır.
          email: normalizeEmail(payload.email),
          password: payload.password,
          role: payload.role,
          phone: '',
        };
        mockUsers.push(user);
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
      mock: () => {
        const user = findUserByEmail(payload.email);
        if (!user || user.password !== payload.currentPassword) {
          throw new ApiError(400, 'Mevcut şifre yanlış.');
        }
        user.password = payload.newPassword;
      },
    }),

  logout: () => api.post<void>('/auth/logout', { mock: () => undefined }),

  me: () => api.get<AuthUser>('/auth/me', { mock: () => sessionFor(mockUsers[0]).user }),
};
