import styles from './BuzzButton.module.css';
import type { Buzz } from '../types';

interface BuzzButtonProps {
  buzz: Buzz | null;
  myPid: string;
  onPress: () => void;
}

// 早押しボタン本体。play.html の renderBuzz + ボタン部分を移植。
export function BuzzButton({ buzz, myPid, onPress }: BuzzButtonProps) {
  const isMine = buzz?.id === myPid;
  const isLocked = !!buzz && !isMine;

  const label = isMine ? '✋' : isLocked ? '🔒' : '押す！';
  const className = [styles.buzzBtn, isMine && styles.mine, isLocked && styles.locked]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={className} disabled={!!buzz} onClick={onPress}>
      {label}
    </button>
  );
}
