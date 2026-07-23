import { describe, expect, test } from 'vitest';
import { applyPlayerRename, claimYajiTimestamp } from './playerState';
import type { TransactionRoom } from './roomState';

function room(): TransactionRoom {
  return {
    meta: {
      password: '',
      questionNumber: 1,
      questionText: '',
      result: null,
      createdAt: 1,
    },
    players: {
      p1: { name: 'Old', emoji: '🐯', score: 0, lastYajiAt: 1_000 },
      p2: { name: 'Other', emoji: '🐼', score: 0, lastYajiAt: 2_000 },
    },
    buzz: { id: 'p1', name: 'Old', emoji: '🐯', token: 'buzz-1', ts: 10 },
  };
}

describe('player room actions', () => {
  test('claims yaji independently for each player after their cooldown', () => {
    expect(claimYajiTimestamp(1_000, 10, 5_000)).toBeNull();
    expect(claimYajiTimestamp(1_000, 10, 11_000)).toBe(11_000);
    expect(claimYajiTimestamp(undefined, 10, 5_000)).toBe(5_000);
  });

  test('renames the player and their active buzz but preserves other snapshots', () => {
    const next = applyPlayerRename(room(), 'p1', '  New Name  ');
    expect(next?.players?.p1.name).toBe('New Name');
    expect(next?.buzz?.name).toBe('New Name');
    expect(next?.players?.p2.name).toBe('Other');
  });

  test('rejects empty and overlong player names', () => {
    expect(applyPlayerRename(room(), 'p1', '   ')).toBeNull();
    expect(applyPlayerRename(room(), 'p1', 'x'.repeat(21))).toBeNull();
  });
});
