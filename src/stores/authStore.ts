import { create } from 'zustand';
import { authService, type AuthUser, type LoginPayload, type RegisterPayload } from '../services/authService';
import { secure, storage, STORAGE_KEYS } from '../utils/storage';
import type { UserRole } from '../types';

interface AuthState {
  user: AuthUser | null;
  /** Aktif rol (RoleSelect'te seçilir, kalıcıdır). */
  role: UserRole | null;
  /** Açılışta token/rol okunana kadar true — splash bununla bekler. */
  restoring: boolean;
  loading: boolean;
  error?: string;

  restore: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
      const [user, role] = await Promise.all([
        storage.get<AuthUser>(STORAGE_KEYS.user),
        storage.get<UserRole>(STORAGE_KEYS.role),
      ]);
      set({ user, role: role ?? null, restoring: false });
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
      // Rol RoleSelect'te seçilir (demo üç rolü de gezebilsin).
      set({ user: session.user, role: null, loading: false });
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
      set({ user: session.user, role: null, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Kayıt başarısız' });
    }
  },

  requestPasswordReset: async (email) => {
    set({ loading: true, error: undefined });
    try {
      await authService.requestPasswordReset(email);
      set({ loading: false });
      return true;
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'İstek gönderilemedi' });
      return false;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    const email = get().user?.email;
    if (!email) return false;
    set({ loading: true, error: undefined });
    try {
      await authService.changePassword({ email, currentPassword, newPassword });
      set({ loading: false });
      return true;
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Şifre değiştirilemedi' });
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      await secure.remove(STORAGE_KEYS.authToken);
      await secure.remove(STORAGE_KEYS.refreshToken);
      await storage.remove(STORAGE_KEYS.user);
      await storage.remove(STORAGE_KEYS.role);
      set({ user: null, role: null, error: undefined });
    }
  },

  setRole: async (role) => {
    await storage.set(STORAGE_KEYS.role, role);
    set({ role });
  },
}));
