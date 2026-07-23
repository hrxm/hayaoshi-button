import { useEffect, useMemo, useRef } from 'react';
import type { HistoryMap } from '../types';
import styles from './HistoryList.module.css';

interface HistoryListProps {
  history: HistoryMap;
}

// host.html の renderHistory を移植。正解履歴の一覧、末尾に自動スクロール。
export function HistoryList({ history }: HistoryListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const entries = useMemo(
    () => Object.values(history || {}).sort((a, b) => (a.ts || 0) - (b.ts || 0)),
    [history]
  );

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [entries.length]);

  if (entries.length === 0) {
    return <div className={styles.empty}>まだ正解者はいません</div>;
  }

  return (
    <div ref={listRef} className={styles.list}>
      {entries.map((h, i) => (
        <div className={styles.row} key={i}>
          <div className={styles.hq}>Q{h.q ?? '?'}</div>
          <div className={styles.hname}>{h.name || ''}</div>
          <div className={styles.hpts}>+{h.pts || 0}点</div>
        </div>
      ))}
    </div>
  );
}
