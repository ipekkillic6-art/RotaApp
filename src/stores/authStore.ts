import { create } from 'zustand';
import { authService, type AuthUser, type LoginPayload, type RegisterPayload } from '../services/authService';
import { secure, storage, STORAGE_KEYS } from '../utils/storage';
import type { UserRole } from '../types';

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  /** Açılışta token okunana kadar true — splash bununla bekler. */
  restoring: boolean;
  loading: boolean;
  error?: string;

  restore: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  restoring: true,
  loading: false,
  error: undefined,

  restore: async () => {
    try {
      const token = await secure.get(STORAGE_KEYS.authToken);
      if (!token) {
        set({ restoring: false });
        return;
      }
      const user = await storage.get<AuthUser>(STORAGE_KEYS.user);
      set({ user, role: user?.role ?? null, restoring: false });
    } catch {
      set({ restoring: false });
    }
  },

  login: async (payload) => {
    set({ loading: true, error: undefined });
    try {
      const session = await authService.login(payload);
      await secure.set(STORAGE_KEYS.authToken, session.token);
      await secure.set(STORAGE_KEYS.refreshToken, session.refreshToken);
      await storage.set(STORAGE_KEYS.user, session.user);
      set({ user: session.user, role: session.user.role, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Giriş başarısız' });
    }
  },

  register: async (payload) => {
    set({ loading: true, error: undefined });
    try {
      const session = await authService.register(payload);
      await secure.set(STORAGE_KEYS.authToken, session.token);
      await secure.set(STORAGE_KEYS.refreshToken, session.refreshToken);
      await storage.set(STORAGE_KEYS.user, session.user);
      set({ user: session.user, role: session.user.role, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Kayıt başarısız' });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      await secure.remove(STORAGE_KEYS.authToken);
      await secure.remove(STORAGE_KEYS.refreshToken);
      await storage.remove(STORAGE_KEYS.user);
      set({ user: null, role: null, error: undefined });
    }
  },

  setRole: (role) => set({ role }),
}));
