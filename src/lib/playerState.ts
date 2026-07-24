import type { PlayersMap } from '../types';
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

// 同じ名前のプレイヤーが既にルームにいるか探す（再接続用）。認証がないため
// 「同じ名前 = 本人」とみなし、新規プレイヤーを作らず既存レコードに繋ぎ直す。
export function findPlayerIdByName(players: PlayersMap, name: string): string | null {
  const entry = Object.entries(players).find(([, p]) => p.name === name);
  return entry ? entry[0] : null;
}
