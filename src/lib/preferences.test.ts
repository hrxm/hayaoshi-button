import { describe, expect, test } from 'vitest';
import {
  DEFAULT_ROOM_SETTINGS,
  effectivePlayerSound,
  normalizeRoomSettings,
  remainingCooldownSeconds,
} from './preferences';

describe('room and player preferences', () => {
  test('normalizes legacy rooms to safe defaults', () => {
    expect(normalizeRoomSettings(undefined)).toEqual(DEFAULT_ROOM_SETTINGS);
    expect(normalizeRoomSettings({ defaultPlayerSound: false })).toEqual({
      defaultPlayerSound: false,
      yajiCooldownSeconds: 10,
    });
  });

  test('clamps yaji cooldown to a practical range', () => {
    expect(normalizeRoomSettings({ yajiCooldownSeconds: -2 }).yajiCooldownSeconds).toBe(0);
    expect(normalizeRoomSettings({ yajiCooldownSeconds: 999 }).yajiCooldownSeconds).toBe(120);
  });

  test('uses the room sound default until the player chooses an override', () => {
    expect(effectivePlayerSound(false, null)).toBe(false);
    expect(effectivePlayerSound(false, true)).toBe(true);
    expect(effectivePlayerSound(true, false)).toBe(false);
  });

  test('calculates cooldown remaining with whole-second countdowns', () => {
    expect(remainingCooldownSeconds(1_000, 10, 5_200)).toBe(6);
    expect(remainingCooldownSeconds(1_000, 10, 11_000)).toBe(0);
    expect(remainingCooldownSeconds(undefined, 10, 5_200)).toBe(0);
  });
});
