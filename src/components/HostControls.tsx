import { useState } from 'react';
import { useStreamedText } from '../hooks/useStreamedText';
import styles from './HostControls.module.css';
import type { Buzz } from '../types';

interface HostControlsProps {
  buzz: Buzz | null;
  questionNumber: number;
  questionScored: boolean;
  activePoints: number;
  onAsk: (text: string, pts: number) => void;
  onJudge: (type: 'correct' | 'wrong') => void;
  onCancel: () => void;
  onNext: () => void;
  qDisplayText: string;
}

// host.html の問題入力・出題・判定パネルを移植。
export function HostControls({
  buzz,
  questionNumber,
  questionScored,
  activePoints,
  onAsk,
  onJudge,
  onCancel,
  onNext,
  qDisplayText,
}: HostControlsProps) {
  const [qInput, setQInput] = useState('');
  const [pts, setPts] = useState(1);
  const [questionFolded, setQuestionFolded] = useState(false);
  const { shown: qDisplayShown, streaming: qDisplayStreaming } = useStreamedText(qDisplayText);

  const currentPts = () => Math.max(1, pts || 1);

  function ask() {
    onAsk(qInput, currentPts());
  }

  function next() {
    onNext();
    setQInput('');
    setPts(1);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.questionHeading}>
        <h3>
          問題 <strong>第 {questionNumber} 問</strong>
        </h3>
        <button
          className={styles.foldButton}
          type="button"
          onClick={() => setQuestionFolded((folded) => !folded)}
        >
          {questionFolded ? '問題文を表示' : '問題文を隠す'}
        </button>
      </div>
      <textarea
        className={styles.textarea}
        placeholder="問題文（任意）。空のままでもOK → 「第○問」だけ表示"
        maxLength={100}
        value={qInput}
        onChange={(e) => setQInput(e.target.value)}
      />
      <div className={styles.charCount}>{qInput.length}/100</div>
      <div className={styles.ptsRow}>
        <span>この問題のポイント：</span>
        <input
          type="number"
          min={1}
          max={99}
          value={pts}
          onChange={(e) => setPts(parseInt(e.target.value, 10) || 1)}
        />
        <span>点</span>
      </div>
      <button className={styles.btnNext} onClick={ask}>
        📢 この問題を出す（流す）
      </button>
      {!questionFolded && (
        <div className={styles.qDisplay} aria-label="出題中の問題文">
          {qDisplayShown}
          {qDisplayStreaming && <span className={styles.qDisplayCursor}>|</span>}
        </div>
      )}

      <div className={`${styles.buzzBox} ${buzz ? styles.active : ''}`}>
        <div className={styles.buzzLabel}>回答中</div>
        <div className={styles.buzzWho}>
          {buzz ? `${buzz.emoji || ''} ${buzz.name} さん` : '― まだ誰も押していません ―'}
        </div>
      </div>
      <div className={styles.judgeRow}>
        <button
          className={styles.btnOk}
          disabled={!buzz || questionScored}
          onClick={() => onJudge('correct')}
        >
          {questionScored ? '採点済み' : `⭕ 正解 [C] ${buzz ? `+${activePoints}` : ''}`}
        </button>
        <button className={styles.btnNg} disabled={!buzz} onClick={() => onJudge('wrong')}>
          ❌ 不正解 [X]
        </button>
        <button className={styles.btnCancel} disabled={!buzz} onClick={onCancel}>
          ↩ キャンセル
        </button>
      </div>
      <button className={styles.btnNext} onClick={next}>
        ▶ 次の問題 [.]
      </button>
    </div>
  );
}
