import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

// Firebase の特殊パス .info/connected を購読し、オンライン/オフライン状態を返す。
// 新規追加（安定化）: 旧実装には接続状態の可視化が一切なかった。
export function useConnection(): boolean {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const connRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connRef, (snap) => {
      setConnected(snap.val() === true);
    });
    return () => unsubscribe();
  }, []);

  return connected;
}
