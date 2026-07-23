import type { TransactionRoom } from './roomState';

export function claimYajiTimestamp(
  lastSentAt: number | null | undefined,
  cooldownSeconds: number,
  now: number
): number | null {
  if (lastSentAt && now - lastSentAt < Math.max(0, cooldownSeconds) * 1000) return null;
  return now;
}

export function applyPlayerRename(
  room: TransactionRoom | null,
  playerId: string,
  requestedName: string
): TransactionRoom | null {
  const name = requestedName.trim();
  if (!room?.players?.[playerId] || !name || name.length > 20) return null;

  const next: TransactionRoom = {
    ...room,
    meta: { ...room.meta },
    players: {
      ...room.players,
      [playerId]: { ...room.players[playerId], name },
    },
    buzz: room.buzz ? { ...room.buzz } : null,
    history: { ...room.history },
    awards: { ...room.awards },
  };
  if (next.buzz?.id === playerId) next.buzz.name = name;
  return next;
}
