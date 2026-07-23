import styles from './ResultOverlay.module.css';
import type { Result } from '../types';

interface ResultOverlayProps {
  result: (Result & { visible: boolean }) | null;
  /** host 側は得点バッジを別行で出す */
  showPtsBadge?: boolean;
}

// 正解/不正解の全画面演出。play.html / host.html 両方の overlay を統合。
export function ResultOverlay({ result, showPtsBadge }: ResultOverlayProps) {
  const visible = !!result?.visible;
  const type = result?.type;

  const className = [styles.overlay, visible && styles.show, type && styles[type]].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <div className={styles.big}>{type === 'correct' ? '⭕' : type === 'wrong' ? '❌' : ''}</div>
      <div className={styles.who}>
        {result?.name ? result.name + ' さん' : ''}
        {type === 'correct' && !showPtsBadge ? ` 正解！ +${result?.pts ?? 1}点` : ''}
        {type === 'wrong' ? ' 残念…' : ''}
      </div>
      {showPtsBadge && type === 'correct' && (
        <div className={styles.ptsBadge}>+{result?.pts ?? 1}点</div>
      )}
    </div>
  );
}
