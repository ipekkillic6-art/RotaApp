import { api } from '../utils/api';
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
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const MOCK_SESSION: AuthSession = {
  token: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: { id: 'u1', name: 'Deniz Aydın', email: 'deniz@rota.app', role: 'customer' },
};

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthSession>('/auth/login', {
      noAuth: true,
      body: payload,
      mock: () => MOCK_SESSION,
    }),

  register: (payload: RegisterPayload) =>
    api.post<AuthSession>('/auth/register', {
      noAuth: true,
      body: payload,
      mock: () => ({ ...MOCK_SESSION, user: { ...MOCK_SESSION.user, ...payload } }),
    }),

  logout: () => api.post<void>('/auth/logout', { mock: () => undefined }),

  me: () => api.get<AuthUser>('/auth/me', { mock: () => MOCK_SESSION.user }),
};
