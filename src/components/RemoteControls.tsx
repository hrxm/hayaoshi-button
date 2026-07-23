import type { Buzz } from '../types';
import styles from './RemoteControls.module.css';

interface RemoteControlsProps {
  questionNumber: number;
  questionText: string;
  buzz: Buzz | null;
  questionScored: boolean;
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
  onJudge: (type: 'correct' | 'wrong') => void;
  onCancel: () => void;
  onNext: () => void;
}

export function RemoteControls({
  questionNumber,
  questionText,
  buzz,
  questionScored,
  soundEnabled,
  onSoundChange,
  onJudge,
  onCancel,
  onNext,
}: RemoteControlsProps) {
  return (
    <main className={styles.remote}>
      <section className={styles.question}>
        <div className={styles.questionNumber}>第 {questionNumber} 問</div>
        <div className={styles.questionText}>{questionText || '問題文はまだありません'}</div>
      </section>

      <section className={`${styles.answerer} ${buzz ? styles.active : ''}`} aria-live="polite">
        <span>回答中</span>
        <strong>{buzz ? `${buzz.emoji || ''} ${buzz.name} さん` : '待機中'}</strong>
      </section>

      <div className={styles.judges}>
        <button
          className={styles.correct}
          disabled={!buzz || questionScored}
          onClick={() => onJudge('correct')}
        >
          {questionScored ? '採点済み' : '⭕ 正解 [C]'}
        </button>
        <button className={styles.wrong} disabled={!buzz} onClick={() => onJudge('wrong')}>
          ❌ 不正解 [X]
        </button>
      </div>
      <button className={styles.cancel} disabled={!buzz} onClick={onCancel}>
        ↩ 回答をキャンセル
      </button>
      <button className={styles.next} onClick={onNext}>
        ▶ 次の問題 [.]
      </button>

      <label className={styles.sound}>
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(event) => onSoundChange(event.target.checked)}
        />
        この端末の音
      </label>
    </main>
  );
}
