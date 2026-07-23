import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { get, push, ref, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { sanitizeCode } from '../lib/room';
import { emojiFromKey } from '../lib/emoji';
import type { RoomMeta } from '../types';
import styles from './Join.module.css';

// 旧 index.html の移植。回答者の参加画面。
export function Join() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [code, setCode] = useState(() => sanitizeCode(searchParams.get('room')));
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [joining, setJoining] = useState(false);

  async function join() {
    const cleanCode = sanitizeCode(code);
    const cleanName = name.trim();
    const cleanPw = pw.trim();
    setErr('');
    if (!cleanCode) return setErr('ルームコードを入れてね');
    if (!cleanName) return setErr('名前を入れてね');

    setJoining(true);
    try {
      const metaSnap = await get(ref(db, 'rooms/' + cleanCode + '/meta'));
      if (!metaSnap.exists()) {
        setJoining(false);
        return setErr('そのルームは見つかりません');
      }
      const meta = metaSnap.val() as RoomMeta;
      if (meta.password && meta.password !== cleanPw) {
        setJoining(false);
        return setErr('パスワードが違います');
      }

      // プレイヤー登録
      const playersRef = ref(db, 'rooms/' + cleanCode + '/players');
      const newRef = push(playersRef);
      const emoji = emojiFromKey(newRef.key!);
      await set(newRef, { name: cleanName, emoji, score: 0 });

      navigate(`/play?room=${cleanCode}&pid=${newRef.key}`);
    } catch (e) {
      setJoining(false);
      setErr('接続エラー: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') join();
  }

  return (
    <div className={styles.page}>
      <div className={styles.pretitle}>みんなでクイズ！</div>
      <div className={styles.logo}>早押しボタン</div>
      <div className={styles.subtitle}>LIVE QUIZ BUZZER</div>
      <div className={styles.card}>
        <h2>ルームに参加</h2>
        <input
          className={`${styles.input} ${styles.code}`}
          type="text"
          placeholder="ルームコード"
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
          placeholder="あなたの名前"
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="パスワード（任意）"
          maxLength={20}
          autoComplete="off"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className={styles.err}>{err}</div>
        <button className={styles.submit} disabled={joining} onClick={join}>
          {joining ? '接続中…' : '参加する！'}
        </button>
      </div>
      <div className={styles.hostLink}>
        出題者の方は <Link to="/host">▶ ルームを作る</Link>
      </div>
      <div className={styles.credit}>
        🎤 by{' '}
        <a href="https://instagram.com/hrxm" target="_blank" rel="noreferrer">
          @hrxm
        </a>{' '}
        · 🍸 x-garden · 🇯🇵 Tokyo &copy; 2026
      </div>
    </div>
  );
}
