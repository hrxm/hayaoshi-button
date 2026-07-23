import { useMemo } from 'react';
import { type DatabaseReference } from 'firebase/database';
import { useChildRef } from './useRoomRef';
import { useRoomValue } from './useRoomValue';
import type { Player, PlayersMap } from '../types';

export interface PlayerRow extends Player {
  id: string;
}

// players/ を購読し、スコア降順の配列として返す（host のスコアボード表示用）。
export function usePlayers(roomRef: DatabaseReference | null): PlayerRow[] {
  const playersRef = useChildRef(roomRef, 'players');
  const players = useRoomValue<PlayersMap>(playersRef, {});

  return useMemo(() => {
    return Object.entries(players)
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [players]);
}
