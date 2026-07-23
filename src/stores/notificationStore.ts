import { create } from 'zustand';
import { notificationService } from '../services/notificationService';
import type { AppNotification, UserRole } from '../types';

interface NotificationState {
  items: AppNotification[];
  unread: number;
  loading: boolean;
  error?: string;

  fetch: (role: UserRole) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const countUnread = (items: AppNotification[]) => items.filter((n) => !n.read).length;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unread: 0,
  loading: false,
  error: undefined,

  fetch: async (role) => {
    set({ loading: true, error: undefined });
    try {
      const items = await notificationService.getForRole(role);
      set({ items, unread: countUnread(items), loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Bildirimler yüklenemedi' });
    }
  },

  markAllRead: async () => {
    const previous = get().items;
    // İyimser: kritik olmayanları okundu işaretle.
    const next = previous.map((n) => (n.critical ? n : { ...n, read: true }));
    set({ items: next, unread: countUnread(next) });
    try {
      await notificationService.markAllRead();
    } catch (e) {
      set({ items: previous, unread: countUnread(previous), error: e instanceof Error ? e.message : 'İşaretlenemedi' });
    }
  },
}));
