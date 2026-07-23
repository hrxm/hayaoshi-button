import { useEffect, useRef } from 'react';
import { type DatabaseReference, off, onValue } from 'firebase/database';

// 「result」「yaji」のような ts 付きイベントを購読するフック。
// DBには最新の1件しか残らない（履歴ではない）ため、ts の変化を見て「新しいイベントが来た時だけ」
// コールバックを呼ぶ。
//
// 安定化ポイント: 初回スナップショットの ts を「既知」として記録してから購読を始める。
// 旧実装は lastTs を 0 で初期化していたため、後から入室したプレイヤーがマウント時に
// 「今DBに残っている最新のresult/yaji」を新規イベントとして再生してしまうバグがあった
// （幽霊の正解演出・幽霊のヤジ音）。
export function useRoomEvent<T extends { ts: number }>(
  ref: DatabaseReference | null,
  onEvent: (value: T) => void
) {
  const lastTsRef = useRef<number | null>(null);
  const seededRef = useRef(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!ref) return;
    seededRef.current = false;
    lastTsRef.current = null;

    const unsubscribe = onValue(ref, (snap) => {
      const v = snap.val() as T | null;

      if (!seededRef.current) {
        // 初回スナップショットは「既知の状態」として記録するだけで発火しない。
        seededRef.current = true;
        lastTsRef.current = v?.ts ?? null;
        return;
      }

      if (!v || !v.ts || v.ts === lastTsRef.current) return;
      lastTsRef.current = v.ts;
      onEventRef.current(v);
    });

    return () => {
      off(ref);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.toString()]);
}
