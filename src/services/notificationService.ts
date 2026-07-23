import { api } from '../utils/api';
import { customerNotifications, courierNotifications, opsNotifications } from '../mocks/notifications';
import type { AppNotification, UserRole } from '../types';

const BY_ROLE: Record<UserRole, AppNotification[]> = {
  customer: customerNotifications,
  courier: courierNotifications,
  admin: opsNotifications,
};

export const notificationService = {
  getForRole: (role: UserRole, signal?: AbortSignal) =>
    api.get<AppNotification[]>(`/notifications?role=${role}`, {
      signal,
      mock: () => BY_ROLE[role],
    }),

  markAllRead: () =>
    api.post<void>('/notifications/read-all', { mock: () => undefined }),

  /** Push token'ı sunucuya kaydeder (Faz 6.4'te gerçek token). */
  registerPushToken: (token: string) =>
    api.post<void>('/notifications/push-token', { body: { token }, mock: () => undefined }),
};
