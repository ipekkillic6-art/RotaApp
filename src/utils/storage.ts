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
  courierOnline: 'courier.online',
} as const;
