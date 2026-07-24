import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, push, runTransaction, set, update } from 'firebase/database';
import { sanitizeCode } from '../lib/room';
import { useRoomRef, useChildRef } from '../hooks/useRoomRef';
import { useRoomValue } from '../hooks/useRoomValue';
import { useRoomEvent } from '../hooks/useRoomEvent';
import { usePlayers } from '../hooks/usePlayers';
import { useHostShortcuts } from '../hooks/useHostShortcuts';
import {
  playCorrect,
  playQuestion,
  playWrong,
  playYaji,
  flash,
  setSoundEnabled,
  unlockAudio,
} from '../lib/sfx';
import {
  applyCancelBuzz,
  applyCorrectJudgment,
  applyFullReset,
  applyKickPlayer,
  applyNextQuestion,
  applyWrongJudgment,
  getBuzzToken,
  type TransactionRoom,
} from '../lib/roomState';
import { normalizeRoomSettings } from '../lib/preferences';
import { ResultOverlay } from '../components/ResultOverlay';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { RoomCreate } from '../components/RoomCreate';
import { RoomRejoin } from '../components/RoomRejoin';
import { HostControls } from '../components/HostControls';
import { Scoreboard } from '../components/Scoreboard';
import { HistoryList } from '../components/HistoryList';
import { HostSettings } from '../components/HostSettings';
import { RemoteControls } from '../components/RemoteControls';
import type { AwardsMap, Buzz, HistoryMap, Result, RoomSettings, Yaji } from '../types';
import styles from './Host.module.css';

const LAST_ROOM_KEY = 'lastRoom';
const HOST_SOUND_KEY = 'hayaoshiHostSound';

// 旧 host.html の移植。出題者・中央スクリーン画面。
export function Host() {
  const [searchParams] = useSearchParams();
  const code = sanitizeCode(searchParams.get('room'));

  if (!code) {
    return <HostCreateView />;
  }
  return <HostDashboard code={code} />;
}

function HostCreateView() {
  const navigate = useNavigate();
  const [lastRoom, setLastRoom] = useState('');

  useEffect(() => {
    const last = localStorage.getItem(LAST_ROOM_KEY);
    if (last) setLastRoom(last);
  }, []);

  function goToRoom(newCode: string) {
    navigate(`/host?room=${newCode}`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.createWrap}>
        <div className={styles.createPretitle}>みんなでクイズ！</div>
        <div className={styles.logo}>早押しボタン</div>
        <div className={styles.subtitle}>出題者ページ / 中央スクリーン</div>
        <RoomCreate onCreated={goToRoom} />
        <div className={styles.cardOr}>または</div>
        <RoomRejoin initialCode={lastRoom} onRejoined={goToRoom} />
      </div>
    </div>
  );
}

function HostDashboard({ code }: { code: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomRef = useRoomRef(code);
  const remoteView = searchParams.get('view') === 'remote';

  useEffect(() => {
    // 前回のルームコードをlocalStorageに保存（再接続用）
    localStorage.setItem(LAST_ROOM_KEY, code);
  }, [code]);

  const qNumRef = useChildRef(roomRef, 'meta/questionNumber');
  const qNum = useRoomValue<number>(qNumRef, 1);

  const qTextRef = useChildRef(roomRef, 'meta/questionText');
  const qText = useRoomValue<string>(qTextRef, '');

  const qPointsRef = useChildRef(roomRef, 'meta/questionPoints');
  const qPoints = useRoomValue<number>(qPointsRef, 1);

  const buzzRef = useChildRef(roomRef, 'buzz');
  const buzz = useRoomValue<Buzz | null>(buzzRef, null);

  const historyRef = useChildRef(roomRef, 'history');
  const history = useRoomValue<HistoryMap>(historyRef, {});

  const awardsRef = useChildRef(roomRef, 'awards');
  const awards = useRoomValue<AwardsMap>(awardsRef, {});
  const questionScored = !!awards[String(qNum)];

  const settingsRef = useChildRef(roomRef, 'meta/settings');
  const rawSettings = useRoomValue<Partial<RoomSettings>>(settingsRef, {});
  const roomSettings = useMemo(() => normalizeRoomSettings(rawSettings), [rawSettings]);

  const [hostSoundEnabled, setHostSoundEnabled] = useState(
    () => localStorage.getItem(HOST_SOUND_KEY) !== 'false'
  );
  useEffect(() => {
    setSoundEnabled(hostSoundEnabled);
    localStorage.setItem(HOST_SOUND_KEY, String(hostSoundEnabled));
  }, [hostSoundEnabled]);

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

  const players = usePlayers(roomRef);

  // 参加URL: 安定化 — 旧実装は location.href.replace(/host\.html.*$/, 'index.html') という
  // 正規表現でURLを組み立てていたため、host.html という拡張子付きパスが無い環境（Vercelの
  // クリーンなルーティングなど）で壊れていた。ルーターのオリジンから直接組み立てる。
  const joinUrl = `${window.location.origin}/?room=${code}`;
  const remoteUrl = `${window.location.origin}/host?room=${code}&view=remote`;
  const [urlCopied, setUrlCopied] = useState(false);
  const [remoteCopied, setRemoteCopied] = useState(false);

  const runRoomTransaction = useCallback(
    async (transition: (current: TransactionRoom | null) => TransactionRoom | null) => {
      if (!roomRef) return;
      const seed = (await get(roomRef)).val() as TransactionRoom | null;
      return runTransaction(roomRef, (current: TransactionRoom | null) => {
        return transition(current ?? seed) ?? undefined;
      });
    },
    [roomRef]
  );

  function askQuestion(text: string, points: number) {
    if (!roomRef) return;
    unlockAudio();
    update(roomRef, {
      'meta/questionText': text,
      'meta/questionPoints': Math.max(1, points || 1),
      buzz: null,
    });
    playQuestion();
  }

  const judge = useCallback(
    (type: 'correct' | 'wrong', pts = qPoints) => {
      if (!buzz || !historyRef || !roomRef) return;
      unlockAudio();
      const expectedBuzzToken = getBuzzToken(buzz);
      const now = Date.now();
      const historyKey = push(historyRef).key;
      if (!historyKey) return;
      runRoomTransaction((current) => {
        if (type === 'correct') {
          const input = {
            expectedBuzzToken,
            questionNumber: qNum,
            points: pts,
            historyKey,
            now,
          };
          return applyCorrectJudgment(current, input);
        }
        return applyWrongJudgment(current, expectedBuzzToken, now);
      });
    },
    [buzz, historyRef, qNum, qPoints, roomRef, runRoomTransaction]
  );

  function cancelBuzz() {
    if (!buzzRef || !buzz) return;
    const expectedBuzzToken = getBuzzToken(buzz);
    runTransaction(buzzRef, (current: Buzz | null) => {
      const next = applyCancelBuzz(current, expectedBuzzToken);
      return next === current ? undefined : next;
    });
  }

  const nextQuestion = useCallback(() => {
    if (!roomRef) return;
    runRoomTransaction((current) => applyNextQuestion(current, qNum));
  }, [qNum, roomRef, runRoomTransaction]);

  function resetAll() {
    if (!confirm('全員の得点を0に戻し、履歴も消去しますか？')) return;
    if (!roomRef) return;
    runRoomTransaction((current) => (current ? applyFullReset(current) : null));
  }

  function clearHistory() {
    if (!confirm('正解履歴を消去しますか？（得点はそのままです）')) return;
    if (historyRef) set(historyRef, null);
  }

  function kickPlayer(playerId: string, playerName: string) {
    if (!confirm(`${playerName} さんを退出させますか？`)) return;
    runRoomTransaction((current) => applyKickPlayer(current, playerId));
  }

  function updateRoomSettings(next: Partial<RoomSettings>) {
    if (settingsRef) update(settingsRef, next);
  }

  function setRemoteView(enabled: boolean) {
    const next = new URLSearchParams(searchParams);
    if (enabled) next.set('view', 'remote');
    else next.delete('view');
    setSearchParams(next);
  }

  useHostShortcuts({
    canCorrect: !!buzz && !questionScored,
    canWrong: !!buzz,
    onCorrect: useCallback(() => judge('correct', qPoints), [judge, qPoints]),
    onWrong: useCallback(() => judge('wrong', qPoints), [judge, qPoints]),
    onNext: nextQuestion,
  });

  return (
    <div className={styles.page}>
      <ConnectionBadge />
      <header className={styles.header}>
        <div className={styles.brand}>
          <span>みんなでクイズ！</span>
          <strong>早押しボタン</strong>
        </div>
        <div className={styles.roomInfo}>
          <div className={styles.roomCode}>ROOM {code}</div>
          <button
            className={styles.joinUrl}
            onClick={() => copyJoinUrl(joinUrl, setUrlCopied)}
            title="タップしてコピー"
          >
            参加URL: <b>{joinUrl}</b> {urlCopied ? '✅ コピー済み' : '📋'}
          </button>
        </div>
        <div className={styles.toolbar}>
          <button className={styles.btnGhost} onClick={() => setRemoteView(!remoteView)}>
            {remoteView ? '全画面管理に戻る' : '📱 リモコン表示'}
          </button>
          {!remoteView && (
            <button className={styles.btnGhost} onClick={resetAll}>
              🔄 全リセット
            </button>
          )}
        </div>
      </header>

      {remoteView ? (
        <>
          <RemoteControls
            questionNumber={qNum}
            questionText={qText}
            buzz={buzz}
            questionScored={questionScored}
            soundEnabled={hostSoundEnabled}
            onSoundChange={setHostSoundEnabled}
            onJudge={(type) => judge(type, qPoints)}
            onCancel={cancelBuzz}
            onNext={nextQuestion}
          />
          <button
            className={styles.remoteShare}
            onClick={() => copyJoinUrl(remoteUrl, setRemoteCopied)}
          >
            {remoteCopied ? 'リモコンURLをコピーしました' : 'このリモコンURLをコピー'}
          </button>
        </>
      ) : (
      <div className={styles.main}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <HostControls
              buzz={buzz}
              questionNumber={qNum}
              questionScored={questionScored}
              activePoints={qPoints}
              qDisplayText={qText}
              onAsk={askQuestion}
              onJudge={(type) => judge(type, qPoints)}
              onCancel={cancelBuzz}
              onNext={nextQuestion}
            />
          </div>

          <HostSettings
            hostSoundEnabled={hostSoundEnabled}
            defaultPlayerSound={roomSettings.defaultPlayerSound}
            yajiCooldownSeconds={roomSettings.yajiCooldownSeconds}
            onHostSoundChange={setHostSoundEnabled}
            onRoomSettingsChange={updateRoomSettings}
            remoteCopied={remoteCopied}
            onCopyRemoteUrl={() => copyJoinUrl(remoteUrl, setRemoteCopied)}
          />

          <div className={styles.panel}>
            <div className={styles.historyHeader}>
              <h3>正解履歴</h3>
              <button className={styles.btnClear} onClick={clearHistory}>
                履歴を消去
              </button>
            </div>
            <HistoryList history={history} />
          </div>
        </div>

        <div className={styles.panel}>
          <h3>得点ランキング</h3>
          <Scoreboard roomRef={roomRef} players={players} onKick={kickPlayer} />
        </div>
      </div>
      )}

      <ResultOverlay result={resultDisplay} showPtsBadge />
    </div>
  );
}

// UX改善: 参加URLをタップ/クリックでコピーできるようにする（モバイルで長いURLを選択するのは大変なため）。
// navigator.clipboard は HTTPS または localhost でのみ使用可能（Vercel・ローカル開発どちらも対応）。
function copyJoinUrl(url: string, setCopied: (v: boolean) => void) {
  navigator.clipboard?.writeText(url).then(
    () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
    () => {
      // クリップボードAPIが使えない環境（古いブラウザ等）向けフォールバックは省略。
      // 失敗してもURLは画面に表示されているので手動選択で対応可能。
    }
  );
}
