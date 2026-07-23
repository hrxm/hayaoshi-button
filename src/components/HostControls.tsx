import { useState } from 'react';
import { useStreamedText } from '../hooks/useStreamedText';
import styles from './HostControls.module.css';
import type { Buzz } from '../types';

interface HostControlsProps {
  buzz: Buzz | null;
  onAsk: (text: string, pts: number) => void;
  onJudge: (type: 'correct' | 'wrong', pts: number) => void;
  onCancel: () => void;
  onNext: () => void;
  qDisplayText: string;
}

// host.html の問題入力・出題・判定パネルを移植。
export function HostControls({ buzz, onAsk, onJudge, onCancel, onNext, qDisplayText }: HostControlsProps) {
  const [qInput, setQInput] = useState('');
  const [pts, setPts] = useState(1);
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
      <h3>問題</h3>
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
      <div className={styles.qDisplay}>
        {qDisplayShown}
        {qDisplayStreaming && <span className={styles.qDisplayCursor}>|</span>}
      </div>

      <div className={`${styles.buzzBox} ${buzz ? styles.active : ''}`}>
        <div className={styles.buzzLabel}>回答中</div>
        <div className={styles.buzzWho}>
          {buzz ? `${buzz.emoji || ''} ${buzz.name} さん` : '― まだ誰も押していません ―'}
        </div>
      </div>
      <div className={styles.judgeRow}>
        <button className={styles.btnOk} disabled={!buzz} onClick={() => onJudge('correct', currentPts())}>
          ⭕ 正解 {buzz ? `+${currentPts()}` : ''}
        </button>
        <button className={styles.btnNg} disabled={!buzz} onClick={() => onJudge('wrong', currentPts())}>
          ❌ 不正解
        </button>
        <button className={styles.btnCancel} disabled={!buzz} onClick={onCancel}>
          ↩ キャンセル
        </button>
      </div>
      <button className={styles.btnNext} onClick={next}>
        ▶ 次の問題へ
      </button>
    </div>
  );
}
