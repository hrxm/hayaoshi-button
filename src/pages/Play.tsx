import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { set } from 'firebase/database';
import { sanitizeCode, sanitizeId } from '../lib/room';
import { useRoomRef, useChildRef } from '../hooks/useRoomRef';
import { useRoomValue } from '../hooks/useRoomValue';
import { useRoomEvent } from '../hooks/useRoomEvent';
import { useBuzz } from '../hooks/useBuzz';
import { playCorrect, playWrong, playYaji, flash, unlockAudio, YAJI_SFX } from '../lib/sfx';
import { BuzzButton } from '../components/BuzzButton';
import { QuestionStream } from '../components/QuestionStream';
import { ResultOverlay } from '../components/ResultOverlay';
import { ConnectionBadge } from '../components/ConnectionBadge';
import type { Player, Result, Yaji } from '../types';
import styles from './Play.module.css';

// 旧 play.html の移植。回答者の早押しボタン画面。
export function Play() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = sanitizeCode(searchParams.get('room'));
  const pid = sanitizeId(searchParams.get('pid'));

  useEffect(() => {
    if (!code || !pid) navigate('/');
  }, [code, pid, navigate]);

  const roomRef = useRoomRef(code);
  const playerRef = useChildRef(roomRef, 'players/' + pid);
  const player = useRoomValue<Player | null>(playerRef, null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  useEffect(() => {
    if (player) setPlayerLoaded(true);
  }, [player]);

  useEffect(() => {
    // players/{pid} が消えた（例: 全リセットや不正な pid）→ 参加画面に戻す。
    // playerLoaded を経てから null になった場合のみ発火させ、初回ロード中の
    // 一時的な null で誤って参加画面に戻さないようにする。
    if (playerLoaded && player === null) navigate('/');
  }, [player, playerLoaded, navigate]);

  const qNumRef = useChildRef(roomRef, 'meta/questionNumber');
  const qNum = useRoomValue<number>(qNumRef, 1);

  const qTextRef = useChildRef(roomRef, 'meta/questionText');
  const qText = useRoomValue<string>(qTextRef, '');

  const { buzz, pressBuzz } = useBuzz(roomRef);

  const resultRef = useChildRef(roomRef, 'meta/result');
  const [resultDisplay, setResultDisplay] = useState<(Result & { visible: boolean }) | null>(null);
  useRoomEvent<Result>(resultRef, (r) => {
    setResultDisplay({ ...r, visible: true });
    if (r.type === 'correct') playCorrect();
    else playWrong();
    flash(r.type === 'correct' ? 'rgba(76,175,80,.15)' : 'rgba(255,82,82,.15)');
    setTimeout(() => setResultDisplay((cur) => (cur ? { ...cur, visible: false } : cur)), 2200);
  });

  const yajiRef = useChildRef(roomRef, 'yaji');
  useRoomEvent<Yaji>(yajiRef, (y) => playYaji(y.i));

  function throwYaji() {
    if (!yajiRef) return;
    unlockAudio();
    // 鳴らすのはリスナー側（自分含む全員）
    set(yajiRef, { ts: Date.now(), i: Math.floor(Math.random() * YAJI_SFX.length) });
  }

  function onBuzzPress() {
    if (!player) return;
    pressBuzz({ pid, name: player.name, emoji: player.emoji });
  }

  if (!code || !pid) return null;

  const isMine = buzz?.id === pid;
  const isLocked = !!buzz && !isMine;

  return (
    <div className={styles.page}>
      <ConnectionBadge />
      <div className={styles.top}>
        <div className={styles.nameTag}>
          <span className={styles.myEmoji}>{player?.emoji}</span>
          <span>{player?.name}</span>
        </div>
        <div className={styles.room}>ROOM {code}</div>
      </div>

      <div className={styles.qnum}>第 {qNum} 問</div>
      <div className={styles.scoreLine}>
        あなたの得点：<b>{player?.score ?? 0}</b>
      </div>
      <QuestionStream text={qText} autoScroll />
      <BuzzButton buzz={buzz} myPid={pid} onPress={onBuzzPress} />
      <div className={`${styles.status} ${buzz ? styles.answering : ''}`}>
        {isMine ? 'あなたが回答中！' : isLocked ? `${buzz?.emoji || ''} ${buzz?.name} さんが回答中` : ''}
      </div>
      <div className={styles.hint}>早く押した人だけが回答できるよ</div>
      <button className={styles.yajiBtn} onClick={throwYaji}>
        🗣️ ヤジを飛ばす
      </button>

      <ResultOverlay result={resultDisplay} />
      <div className={styles.credit}>
        🎤 by{' '}
        <a href="https://instagram.com/hrxm" target="_blank" rel="noreferrer">
          @hrxm
        </a>{' '}
        · 🍸 x-garden
      </div>
    </div>
  );
}
