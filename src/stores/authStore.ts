import { create } from 'zustand';
import { authService, type AuthUser, type LoginPayload, type RegisterPayload } from '../services/authService';
import { ApiError } from '../utils/api';
import { secure, storage, STORAGE_KEYS } from '../utils/storage';
import type { UserRole } from '../types';

/**
 * Sunucu hatayı belirli bir forma alanına bağladıysa o alanın adı.
 * Örn. kayıt sırasında e-posta çakışması → `'email'`.
 */
function errorFieldOf(e: unknown): string | undefined {
  if (!(e instanceof ApiError)) return undefined;
  const body = e.body;
  if (typeof body !== 'object' || body === null) return undefined;
  const field = (body as { field?: unknown }).field;
  return typeof field === 'string' ? field : undefined;
}

interface AuthState {
  user: AuthUser | null;
  /** Aktif rol (RoleSelect'te seçilir, kalıcıdır). */
  role: UserRole | null;
  /** Açılışta token/rol okunana kadar true — splash bununla bekler. */
  restoring: boolean;
  loading: boolean;
  error?: string;
  /** Hata bir forma alanına aitse alanın adı (örn. `'email'`). */
  errorField?: string;
  /** "Beni hatırla" ile saklanmış e-posta/telefon — giriş alanını doldurur. */
  rememberedIdentifier: string | null;
  /** "Beni hatırla" ile saklanmış parola — şifre alanını doldurur. */
  rememberedPassword: string | null;

  restore: () => Promise<void>;
  /**
   * Giriş bilgilerini hatırla. `null` geçilirse ikisi de silinir.
   * Parola `secure` (Keychain) üzerine yazılır.
   */
  rememberCredentials: (
    credentials: { identifier: string; password: string } | null,
  ) => Promise<void>;
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
  errorField: undefined,
  rememberedIdentifier: null,
  rememberedPassword: null,

  restore: async () => {
    try {
      // Hatırlanan bilgiler oturumdan bağımsızdır: çıkış yapılmış olsa da
      // giriş alanlarını doldurmalı. Bu yüzden token kontrolünden önce okunur.
      const [remembered, rememberedPw] = await Promise.all([
        storage.get<string>(STORAGE_KEYS.rememberedIdentifier),
        secure.get(STORAGE_KEYS.rememberedPassword),
      ]);
      set({ rememberedIdentifier: remembered ?? null, rememberedPassword: rememberedPw ?? null });

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

  rememberCredentials: async (credentials) => {
    const identifier = credentials?.identifier.trim() || null;
    const password = credentials?.password || null;
    // Kimlik veya parola eksikse ikisi de tutulmaz — yarım kayıt, alanı
    // yanlış dolduran bir duruma yol açardı.
    if (!identifier || !password) {
      await Promise.all([
        storage.remove(STORAGE_KEYS.rememberedIdentifier),
        secure.remove(STORAGE_KEYS.rememberedPassword),
      ]);
      set({ rememberedIdentifier: null, rememberedPassword: null });
      return;
    }
    await Promise.all([
      storage.set(STORAGE_KEYS.rememberedIdentifier, identifier),
      secure.set(STORAGE_KEYS.rememberedPassword, password),
    ]);
    set({ rememberedIdentifier: identifier, rememberedPassword: password });
  },

  login: async (payload) => {
    set({ loading: true, error: undefined, errorField: undefined });
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
    set({ loading: true, error: undefined, errorField: undefined });
    try {
      const session = await authService.register(payload);
      await secure.set(STORAGE_KEYS.authToken, session.token);
      await secure.set(STORAGE_KEYS.refreshToken, session.refreshToken);
      await storage.set(STORAGE_KEYS.user, session.user);
      set({ user: session.user, role: null, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Kayıt başarısız',
        errorField: errorFieldOf(e),
      });
    }
  },

  requestPasswordReset: async (email) => {
    set({ loading: true, error: undefined, errorField: undefined });
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
    set({ loading: true, error: undefined, errorField: undefined });
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
      set({ user: null, role: null, error: undefined, errorField: undefined });
    }
  },

  setRole: async (role) => {
    await storage.set(STORAGE_KEYS.role, role);
    set({ role });
  },
}));
