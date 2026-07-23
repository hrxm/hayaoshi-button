import { useEffect, useRef } from 'react';
import { useStreamedText } from '../hooks/useStreamedText';
import styles from './QuestionStream.module.css';

interface QuestionStreamProps {
  text: string;
  className?: string;
  /** ストリーミング中に自動スクロールする要素が必要な場合 true（回答者画面用） */
  autoScroll?: boolean;
}

// 問題文を1文字ずつ流す演出。play.html / host.html 両方の streamText/streamQText を統合。
export function QuestionStream({ text, className, autoScroll }: QuestionStreamProps) {
  const { shown, streaming } = useStreamedText(text);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && elRef.current) {
      elRef.current.scrollTop = elRef.current.scrollHeight;
    }
  }, [shown, autoScroll]);

  return (
    <div ref={elRef} className={`${styles.qtext} ${className || ''}`}>
      {shown}
      {streaming && <span className={styles.cursor}> </span>}
    </div>
  );
}
