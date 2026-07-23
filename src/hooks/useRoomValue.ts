import { useEffect, useState } from 'react';
import { type DatabaseReference, off, onValue } from 'firebase/database';

// Firebase の .on('value') を React state として購読する汎用フック。
// アンマウント時に必ず off() する（旧実装は listener を張りっぱなしでリークしていた）。
export function useRoomValue<T>(ref: DatabaseReference | null, initial: T): T {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (!ref) return;
    const unsubscribe = onValue(ref, (snap) => {
      setValue((snap.val() as T) ?? initial);
    });
    return () => {
      off(ref);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.toString()]);

  return value;
}
