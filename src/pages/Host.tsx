import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { child, get, push, runTransaction, set } from 'firebase/database';
import { sanitizeCode, sanitizeId } from '../lib/room';
import { useRoomRef, useChildRef } from '../hooks/useRoomRef';
import { useRoomValue } from '../hooks/useRoomValue';
import { useRoomEvent } from '../hooks/useRoomEvent';
import { usePlayers } from '../hooks/usePlayers';
import { playCorrect, playQuestion, playWrong, playYaji, flash, unlockAudio } from '../lib/sfx';
import { ResultOverlay } from '../components/ResultOverlay';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { RoomCreate } from '../components/RoomCreate';
import { RoomRejoin } from '../components/RoomRejoin';
import { HostControls } from '../components/HostControls';
import { Scoreboard } from '../components/Scoreboard';
import { HistoryList } from '../components/HistoryList';
import type { Buzz, HistoryMap, Result, Yaji } from '../types';
import styles from './Host.module.css';

const LAST_ROOM_KEY = 'lastRoom';

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
  const roomRef = useRoomRef(code);

  useEffect(() => {
    // 前回のルームコードをlocalStorageに保存（再接続用）
    localStorage.setItem(LAST_ROOM_KEY, code);
  }, [code]);

  const qNumRef = useChildRef(roomRef, 'meta/questionNumber');
  const qNum = useRoomValue<number>(qNumRef, 1);

  const qTextRef = useChildRef(roomRef, 'meta/questionText');
  const qText = useRoomValue<string>(qTextRef, '');

  const buzzRef = useChildRef(roomRef, 'buzz');
  const buzz = useRoomValue<Buzz | null>(buzzRef, null);

  const historyRef = useChildRef(roomRef, 'history');
  const history = useRoomValue<HistoryMap>(historyRef, {});

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

  function askQuestion(text: string) {
    if (!qTextRef || !buzzRef) return;
    unlockAudio();
    set(qTextRef, text);
    set(buzzRef, null); // 早押し受付開始
    playQuestion();
  }

  function judge(type: 'correct' | 'wrong', pts: number) {
    if (!buzz || !resultRef || !buzzRef || !historyRef || !roomRef) return;
    unlockAudio();
    const targetId = sanitizeId(buzz.id);
    if (type === 'correct') {
      runTransaction(child(roomRef, 'players/' + targetId + '/score'), (v) => (v || 0) + pts);
      set(resultRef, { type: 'correct', name: buzz.name, pts, ts: Date.now() });
      // 履歴に追記
      push(historyRef, { name: buzz.name, pts, q: qNum, ts: Date.now() });
    } else {
      set(resultRef, { type: 'wrong', name: buzz.name, pts: 0, ts: Date.now() });
      set(buzzRef, null); // 不正解：全員また押せる
    }
  }

  function cancelBuzz() {
    if (buzzRef) set(buzzRef, null);
  }

  function nextQuestion() {
    if (!buzzRef || !resultRef || !qTextRef || !qNumRef) return;
    set(buzzRef, null);
    set(resultRef, null);
    set(qTextRef, '');
    runTransaction(qNumRef, (v) => (v || 1) + 1);
  }

  function resetAll() {
    if (!confirm('全員の得点を0に戻し、履歴も消去しますか？')) return;
    if (!roomRef || !buzzRef || !resultRef || !qTextRef || !qNumRef || !historyRef) return;
    get(child(roomRef, 'players')).then((s) => {
      const players = (s.val() as Record<string, unknown>) || {};
      Object.keys(players).forEach((id) => {
        // 安定化: 旧実装は .set(0) で直接上書きしていたが、判定処理と同じくtransactionに揃える
        // （進行中の judge() 更新と競合しないように）。
        runTransaction(child(roomRef, 'players/' + id + '/score'), () => 0);
      });
    });
    set(buzzRef, null);
    set(resultRef, null);
    set(qTextRef, '');
    set(qNumRef, 1);
    set(historyRef, null);
  }

  function clearHistory() {
    if (!confirm('正解履歴を消去しますか？（得点はそのままです）')) return;
    if (historyRef) set(historyRef, null);
  }

  return (
    <div className={styles.page}>
      <ConnectionBadge />
      <header className={styles.header}>
        <div className={styles.roomInfo}>
          <div className={styles.roomCode}>{code}</div>
          <div className={styles.joinUrl}>
            参加URL: <b>{joinUrl}</b>
          </div>
        </div>
        <div className={styles.qbadge}>第 {qNum} 問</div>
        <div className={styles.toolbar}>
          <button className={styles.btnGhost} onClick={resetAll}>
            🔄 全リセット
          </button>
        </div>
      </header>

      <div className={styles.main}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <HostControls
              buzz={buzz}
              qDisplayText={qText}
              onAsk={askQuestion}
              onJudge={judge}
              onCancel={cancelBuzz}
              onNext={nextQuestion}
            />
          </div>

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
          <Scoreboard roomRef={roomRef} players={players} />
        </div>
      </div>

      <ResultOverlay result={resultDisplay} showPtsBadge />
    </div>
  );
}
