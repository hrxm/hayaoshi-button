import { useState } from 'react';
import { get, ref, serverTimestamp, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { genRoomCode } from '../lib/room';
import styles from '../pages/Host.module.css';

interface RoomCreateProps {
  onCreated: (code: string) => void;
}

// host.html の createRoom() を移植。
export function RoomCreate({ onCreated }: RoomCreateProps) {
  const [usePw, setUsePw] = useState(false);
  const [pw, setPw] = useState('');
  const [creating, setCreating] = useState(false);

  async function createRoom() {
    if (usePw && !pw.trim()) {
      alert('パスワードを入れてね');
      return;
    }
    setCreating(true);
    try {
      let newCode: string | null = null;
      for (let i = 0; i < 5; i++) {
        const c = genRoomCode();
        const snap = await get(ref(db, 'rooms/' + c + '/meta'));
        if (!snap.exists()) {
          newCode = c;
          break;
        }
      }
      if (!newCode) {
        alert('ルーム作成に失敗しました。もう一度試してね。');
        setCreating(false);
        return;
      }
      await set(ref(db, 'rooms/' + newCode + '/meta'), {
        password: usePw ? pw.trim() : '',
        questionNumber: 1,
        questionText: '',
        result: null,
        createdAt: serverTimestamp(),
      });
      onCreated(newCode);
    } catch (e) {
      setCreating(false);
      alert('作成エラー: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <div className={styles.card}>
      <h2>ルームを作る</h2>
      <div className={styles.pwRow}>
        <label>
          <input type="checkbox" checked={usePw} onChange={(e) => setUsePw(e.target.checked)} /> パスワードを付ける
        </label>
      </div>
      {usePw && (
        <input
          className={styles.input}
          type="text"
          placeholder="パスワード"
          maxLength={20}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
      )}
      <button className={styles.btn} disabled={creating} onClick={createRoom}>
        {creating ? '作成中…' : 'ルーム作成！'}
      </button>
    </div>
  );
}
