import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, runTransaction, set } from 'firebase/database';
import { sanitizeCode, sanitizeId } from '../lib/room';
import { useRoomRef, useChildRef } from '../hooks/useRoomRef';
import { useRoomValue } from '../hooks/useRoomValue';
import { useRoomEvent } from '../hooks/useRoomEvent';
import { useBuzz } from '../hooks/useBuzz';
import {
  playCorrect,
  playWrong,
  playYaji,
  flash,
  setSoundEnabled,
  unlockAudio,
  YAJI_SFX,
} from '../lib/sfx';
import { applyCancelBuzz, getBuzzToken, type TransactionRoom } from '../lib/roomState';
import { applyPlayerRename, claimYajiTimestamp } from '../lib/playerState';
import {
  effectivePlayerSound,
  normalizeRoomSettings,
  remainingCooldownSeconds,
} from '../lib/preferences';
import { BuzzButton } from '../components/BuzzButton';
import { QuestionStream } from '../components/QuestionStream';
import { ResultOverlay } from '../components/ResultOverlay';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { PlayerNameEditor } from '../components/PlayerNameEditor';
import type { Buzz, Player, Result, RoomSettings, Yaji } from '../types';
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

  const settingsRef = useChildRef(roomRef, 'meta/settings');
  const rawSettings = useRoomValue<Partial<RoomSettings>>(settingsRef, {});
  const roomSettings = normalizeRoomSettings(rawSettings);

  const [soundOverride, setSoundOverride] = useState<boolean | null>(() => {
    const saved = localStorage.getItem('hayaoshiPlayerSound');
    return saved === null ? null : saved === 'true';
  });
  const playerSoundEnabled = effectivePlayerSound(roomSettings.defaultPlayerSound, soundOverride);
  useEffect(() => setSoundEnabled(playerSoundEnabled), [playerSoundEnabled]);

  const { buzz, buzzRef, pressBuzz } = useBuzz(roomRef);

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

  const lastYajiRef = useChildRef(roomRef, 'players/' + pid + '/lastYajiAt');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, []);
  const yajiRemaining = remainingCooldownSeconds(
    player?.lastYajiAt,
    roomSettings.yajiCooldownSeconds,
    now
  );

  async function throwYaji() {
    if (!yajiRef || !lastYajiRef || yajiRemaining > 0) return;
    unlockAudio();
    const sentAt = Date.now();
    const claim = await runTransaction(lastYajiRef, (current: number | null) => {
      return claimYajiTimestamp(current, roomSettings.yajiCooldownSeconds, sentAt) ?? undefined;
    });
    if (claim.committed) {
      set(yajiRef, { ts: sentAt, i: Math.floor(Math.random() * YAJI_SFX.length) });
      setNow(sentAt);
    }
  }

  function onBuzzPress() {
    if (!player) return;
    pressBuzz({ pid, name: player.name, emoji: player.emoji });
  }

  function cancelMyBuzz() {
    if (!buzzRef || !buzz || buzz.id !== pid) return;
    const token = getBuzzToken(buzz);
    runTransaction(buzzRef, (current: Buzz | null) => {
      if (current?.id !== pid) return undefined;
      const next = applyCancelBuzz(current, token);
      return next === current ? undefined : next;
    });
  }

  async function renamePlayer(name: string) {
    const cleanName = name.trim();
    if (!roomRef || !cleanName || cleanName.length > 20) return;

    // Keep the player record and the current answerer snapshot consistent for
    // every connected host. Firebase may initially invoke a root transaction
    // with null before its local cache is hydrated, so use a fresh snapshot as
    // the fallback seed.
    const seed = (await get(roomRef)).val() as TransactionRoom | null;
    await runTransaction(roomRef, (current: TransactionRoom | null) => {
      return applyPlayerRename(current ?? seed, pid, cleanName) ?? undefined;
    });
  }

  function togglePlayerSound() {
    const next = !playerSoundEnabled;
    setSoundOverride(next);
    localStorage.setItem('hayaoshiPlayerSound', String(next));
    setSoundEnabled(next);
    if (next) unlockAudio();
  }

  if (!code || !pid) return null;

  const isMine = buzz?.id === pid;
  const isLocked = !!buzz && !isMine;

  return (
    <div className={styles.page}>
      <ConnectionBadge />
      <div className={styles.top}>
        <div className={styles.brand}>
          <span>みんなでクイズ！</span>
          <strong>早押しボタン</strong>
        </div>
        <PlayerNameEditor
          emoji={player?.emoji || ''}
          name={player?.name || ''}
          onSave={renamePlayer}
        />
        <div className={styles.room}>ROOM {code}</div>
      </div>

      <div className={styles.middle}>
        <div className={styles.questionHeading}>
          <span>問題</span>
          <strong>第 {qNum} 問</strong>
        </div>
        <div className={styles.scoreLine}>
          あなたの得点：<b>{player?.score ?? 0}</b>
        </div>
        <QuestionStream text={qText} autoScroll />
        <BuzzButton buzz={buzz} myPid={pid} onPress={onBuzzPress} />
        <div className={`${styles.status} ${buzz ? styles.answering : ''}`}>
          {isMine ? 'あなたが回答中！' : isLocked ? `${buzz?.emoji || ''} ${buzz?.name} さんが回答中` : ''}
        </div>
        {isMine && (
          <button className={styles.cancelBuzz} onClick={cancelMyBuzz}>
            回答をキャンセル
          </button>
        )}
        <div className={styles.hint}>早く押した人だけが回答できるよ</div>
        <div className={styles.utilityRow}>
          <button className={styles.yajiBtn} disabled={yajiRemaining > 0} onClick={throwYaji}>
            {yajiRemaining > 0 ? `ヤジはあと ${yajiRemaining} 秒` : '🗣️ ヤジを飛ばす'}
          </button>
          <button className={styles.soundBtn} onClick={togglePlayerSound}>
            {playerSoundEnabled ? '🔊 音あり' : '🔇 ミュート'}
          </button>
        </div>
      </div>

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
