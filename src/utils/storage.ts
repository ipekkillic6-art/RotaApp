import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Depolama sarmalayıcıları.
 *
 * `storage`  → sıradan veriler (AsyncStorage, JSON serileştirmeli, tipli).
 * `secure`   → hassas veriler / token (expo-secure-store, ayrı fonksiyonlar).
 */

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

export const secure = {
  get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

/** Depolama anahtarları tek yerde (string sızıntısı olmasın). */
export const STORAGE_KEYS = {
  authToken: 'auth.token',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
  role: 'auth.role',
  /**
   * "Beni hatırla" ile saklanan e-posta/telefon. Hassas değil → AsyncStorage.
   */
  rememberedIdentifier: 'auth.rememberedIdentifier',
  /**
   * "Beni hatırla" ile saklanan parola — giriş alanını önceden doldurur.
   *
   * Kullanıcının bilinçli tercihi; kutu işaretli değilken YAZILMAZ ve işaret
   * kaldırılınca silinir. Parola olduğu için AsyncStorage'a değil `secure`
   * (Keychain) üzerine yazılır. Telefonu açık bulan biri parolayı da görebilir
   * — daha güvenli seçenek biyometrik kilit arkasına almaktır.
   */
  rememberedPassword: 'auth.rememberedPassword',
  /**
   * Mock backend'de açılan hesaplar (yalnızca `USE_MOCKS` açıkken).
   *
   * Gerçek backend geldiğinde bu anahtar tamamen kalkar — hesaplar sunucuda
   * durur. Parola içerdiği için AsyncStorage'a değil `secure`'a yazılır.
   */
  mockUsers: 'mock.users',
  courierOnline: 'courier.online',
  offlineQueue: 'queue.statusUpdates',
} as const;
