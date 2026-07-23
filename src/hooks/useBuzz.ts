import { useCallback } from 'react';
import { type DatabaseReference, runTransaction, serverTimestamp } from 'firebase/database';
import { useChildRef } from './useRoomRef';
import { useRoomValue } from './useRoomValue';
import type { Buzz } from '../types';
import { flash, playBuzz, unlockAudio } from '../lib/sfx';

interface PressBuzzArgs {
  pid: string;
  name: string;
  emoji: string;
}

// 早押しロックの状態購読 + 押下トランザクションをまとめたフック。
// 同時押しの排他制御は Firebase の transaction に委ねる（元の実装と同じロジック）。
export function useBuzz(roomRef: DatabaseReference | null) {
  const buzzRef = useChildRef(roomRef, 'buzz');
  const buzz = useRoomValue<Buzz | null>(buzzRef, null);

  const pressBuzz = useCallback(
    async ({ pid, name, emoji }: PressBuzzArgs) => {
      if (!buzzRef || buzz) return; // 既に誰かが押している → 何もしない
      unlockAudio(); // オーディオ解錠（最初のタップ）
      const result = await runTransaction(buzzRef, (cur) => {
        if (cur === null) {
          return { id: pid, name, emoji, ts: serverTimestamp() };
        }
        return; // 既に誰かが押している → 中止
      });
      if (result.committed) {
        playBuzz();
        flash();
      }
    },
    [buzzRef, buzz]
  );

  return { buzz, buzzRef, pressBuzz };
}
