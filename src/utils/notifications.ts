import type { AppNotification } from '../types';

/**
 * Bildirim listesi üzerindeki saf indirgeyiciler (reducer).
 *
 * Store bunları kullanır; saf oldukları için ayrıca test edilebilirler.
 */

/** Okunmamış bildirim sayısı. */
export const countUnread = (items: AppNotification[]): number =>
  items.filter((n) => !n.read).length;

/**
 * "Tümünü okundu işaretle" — kritik bildirimler okunmuş sayılmaz; onlar
 * kullanıcı işlem yapana kadar okunmadan kalır ve listede üstte durur.
 */
export const markAllReadItems = (items: AppNotification[]): AppNotification[] =>
  items.map((n) => (n.critical ? n : { ...n, read: true }));
