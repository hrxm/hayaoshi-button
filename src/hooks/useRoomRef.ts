import { useMemo } from 'react';
import { child, ref, type DatabaseReference } from 'firebase/database';
import { db } from '../lib/firebase';

// rooms/{code} への参照をメモ化するフック。code が空なら null を返す（呼び出し側でガードする）。
export function useRoomRef(code: string): DatabaseReference | null {
  return useMemo(() => (code ? ref(db, 'rooms/' + code) : null), [code]);
}

// roomRef の子パスをメモ化するフック（例: buzz, meta/questionText, players）。
export function useChildRef(roomRef: DatabaseReference | null, path: string): DatabaseReference | null {
  return useMemo(() => (roomRef ? child(roomRef, path) : null), [roomRef, path]);
}
