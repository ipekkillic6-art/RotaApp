import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeKey, enqueue, remove, bumpAttempts, backoffMs, type QueuedUpdate } from './offlineQueue.ts';

const item = (deliveryId: string, status: string, createdAt = 1) => ({
  deliveryId,
  status: status as QueuedUpdate['status'],
  createdAt,
});

test('makeKey teslimat + durumu birleştirir', () => {
  assert.equal(makeKey('d1', 'delivered'), 'd1:delivered');
});

test('enqueue farklı güncellemeleri ekler', () => {
  let q: QueuedUpdate[] = [];
  q = enqueue(q, item('d1', 'picked_up'));
  q = enqueue(q, item('d1', 'delivered'));
  assert.equal(q.length, 2);
});

test('enqueue aynı anahtarı iki kez eklemez (idempotency)', () => {
  let q: QueuedUpdate[] = [];
  q = enqueue(q, item('d1', 'delivered'));
  const before = q;
  q = enqueue(q, item('d1', 'delivered'));
  assert.equal(q.length, 1);
  assert.equal(q, before); // değişmeden aynı referans döner
});

test('remove anahtara göre çıkarır', () => {
  let q: QueuedUpdate[] = enqueue([], item('d1', 'delivered'));
  q = remove(q, 'd1:delivered');
  assert.equal(q.length, 0);
});

test('bumpAttempts yalnızca ilgili öğeyi artırır', () => {
  let q: QueuedUpdate[] = enqueue(enqueue([], item('d1', 'delivered')), item('d2', 'failed'));
  q = bumpAttempts(q, 'd1:delivered');
  assert.equal(q.find((x) => x.key === 'd1:delivered')?.attempts, 1);
  assert.equal(q.find((x) => x.key === 'd2:failed')?.attempts, 0);
});

test('backoffMs üstel artar ve 30s ile sınırlanır', () => {
  assert.equal(backoffMs(0), 1_000);
  assert.equal(backoffMs(1), 2_000);
  assert.equal(backoffMs(3), 8_000);
  assert.equal(backoffMs(10), 30_000); // tavan
});
