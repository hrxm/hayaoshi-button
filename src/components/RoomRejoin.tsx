import { useState } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '../lib/firebase';
import { sanitizeCode } from '../lib/room';
import type { RoomMeta } from '../types';
import styles from '../pages/Host.module.css';

interface RoomRejoinProps {
  initialCode?: string;
  onRejoined: (code: string) => void;
}

// host.html の rejoinRoom() を移植。
export function RoomRejoin({ initialCode, onRejoined }: RoomRejoinProps) {
  const [code, setCode] = useState(initialCode || '');
  const [pw, setPw] = useState('');

  async function rejoin() {
    const inputCode = sanitizeCode(code);
    if (!inputCode) {
      alert('ルームコードを入れてね');
      return;
    }
    try {
      const snap = await get(ref(db, 'rooms/' + inputCode + '/meta'));
      if (!snap.exists()) {
        alert('そのルームは見つかりません');
        return;
      }
      const meta = snap.val() as RoomMeta;
      if (meta.password && meta.password !== pw.trim()) {
        alert('パスワードが違います');
        return;
      }
      onRejoined(inputCode);
    } catch (e) {
      alert('接続エラー: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') rejoin();
  }

  return (
    <div className={styles.card2}>
      <h2>ルームに戻る（再接続）</h2>
      <input
        className={`${styles.input} ${styles.rejoinCode}`}
        type="text"
        placeholder="XXXX"
        maxLength={4}
        autoCapitalize="characters"
        autoComplete="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <input
        className={styles.input}
        type="text"
        placeholder="パスワード（設定した場合）"
        maxLength={20}
        autoComplete="off"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button className={`${styles.btn} ${styles.btnRejoin}`} onClick={rejoin}>
        🔁 ルームに戻る
      </button>
    </div>
  );
}
