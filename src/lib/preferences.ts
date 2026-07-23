import type { RoomSettings } from '../types';

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  defaultPlayerSound: true,
  yajiCooldownSeconds: 10,
};

export function normalizeRoomSettings(settings?: Partial<RoomSettings> | null): RoomSettings {
  const rawCooldown = Number(settings?.yajiCooldownSeconds ?? DEFAULT_ROOM_SETTINGS.yajiCooldownSeconds);
  return {
    defaultPlayerSound: settings?.defaultPlayerSound ?? DEFAULT_ROOM_SETTINGS.defaultPlayerSound,
    yajiCooldownSeconds: Math.min(120, Math.max(0, Number.isFinite(rawCooldown) ? rawCooldown : 10)),
  };
}

export function effectivePlayerSound(roomDefault: boolean, localOverride: boolean | null): boolean {
  return localOverride ?? roomDefault;
}

export function remainingCooldownSeconds(
  lastSentAt: number | undefined,
  cooldownSeconds: number,
  now: number
): number {
  if (!lastSentAt) return 0;
  const remainingMs = Math.max(0, cooldownSeconds * 1000 - (now - lastSentAt));
  return Math.ceil(remainingMs / 1000);
}
