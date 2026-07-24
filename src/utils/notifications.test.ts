import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countUnread, markAllReadItems } from './notifications.ts';
import type { AppNotification } from '../types/index.ts';

const notif = (patch: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n1',
  kind: 'courier_assigned',
  title: 'Başlık',
  body: 'Gövde',
  createdAt: '2026-07-24T10:00:00Z',
  read: false,
  ...patch,
});

test('countUnread yalnızca okunmamışları sayar', () => {
  assert.equal(countUnread([]), 0);
  assert.equal(
    countUnread([notif({ read: false }), notif({ read: true }), notif({ read: false })]),
    2,
  );
});

test('markAllReadItems kritik olmayanları okundu yapar', () => {
  const items = [notif({ id: 'a', read: false }), notif({ id: 'b', read: false })];
  const next = markAllReadItems(items);
  assert.equal(next.every((n) => n.read), true);
  assert.equal(countUnread(next), 0);
});

test('markAllReadItems kritik bildirimleri okunmadan bırakır', () => {
  const items = [
    notif({ id: 'a', read: false, critical: false }),
    notif({ id: 'b', read: false, critical: true }),
  ];
  const next = markAllReadItems(items);
  assert.equal(next.find((n) => n.id === 'a')?.read, true);
  assert.equal(next.find((n) => n.id === 'b')?.read, false);
  // Kritik bir bildirim okunmadan kaldığı için sayaç 1 kalmalı.
  assert.equal(countUnread(next), 1);
});

test('markAllReadItems girdiyi mutasyona uğratmaz (yeni referans döner)', () => {
  const items = [notif({ read: false })];
  const next = markAllReadItems(items);
  assert.equal(items[0].read, false);
  assert.notEqual(next[0], items[0]);
});
