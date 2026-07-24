import { runTransaction } from 'firebase/database';
import { useChildRef } from '../hooks/useRoomRef';
import type { PlayerRow } from '../hooks/usePlayers';
import type { DatabaseReference } from 'firebase/database';
import styles from './Scoreboard.module.css';

interface ScoreboardProps {
  roomRef: DatabaseReference | null;
  players: PlayerRow[];
  onKick: (playerId: string, playerName: string) => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

// host.html の renderScoreboard を移植。得点ランキング + 手動±1調整 + 退出。
export function Scoreboard({ roomRef, players, onKick }: ScoreboardProps) {
  if (players.length === 0) {
    return <div className={styles.empty}>まだ誰も参加していません</div>;
  }

  return (
    <div>
      {players.map((p, i) => (
        <ScoreRow key={p.id} player={p} rank={i} roomRef={roomRef} onKick={onKick} />
      ))}
    </div>
  );
}

function ScoreRow({
  player,
  rank,
  roomRef,
  onKick,
}: {
  player: PlayerRow;
  rank: number;
  roomRef: DatabaseReference | null;
  onKick: (playerId: string, playerName: string) => void;
}) {
  const scoreRef = useChildRef(roomRef, 'players/' + player.id + '/score');

  function adjust(delta: number) {
    if (!scoreRef) return;
    runTransaction(scoreRef, (v) => Math.max(0, (v || 0) + delta));
  }

  return (
    <div className={`${styles.row} ${rank === 0 && (player.score || 0) > 0 ? styles.lead : ''}`}>
      <div className={styles.rank}>{MEDALS[rank] || rank + 1}</div>
      <div className={styles.em}>{player.emoji || ''}</div>
      <div className={styles.nm}>{player.name}</div>
      <div className={styles.adj}>
        <button title="-1" onClick={() => adjust(-1)}>
          −
        </button>
        <button title="+1" onClick={() => adjust(1)}>
          ＋
        </button>
        <button
          className={styles.kick}
          title="退出させる"
          aria-label={`${player.name} さんを退出させる`}
          onClick={() => onKick(player.id, player.name)}
        >
          ✕
        </button>
      </div>
      <div className={styles.sc}>{player.score || 0}</div>
    </div>
  );
}
