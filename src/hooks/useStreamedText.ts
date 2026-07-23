import { useEffect, useRef, useState } from 'react';

// 文字列を1文字ずつ「流す」演出のロジック。QuestionStream（回答者画面）と
// HostControls の問題プレビュー（出題者画面）の両方から使う共通フック。
export function useStreamedText(text: string, intervalMs = 60) {
  const [shown, setShown] = useState('');
  const [streaming, setStreaming] = useState(false);
  const lastTextRef = useRef('');

  useEffect(() => {
    if (text === lastTextRef.current) return;
    lastTextRef.current = text;

    let i = 0;
    setStreaming(true);
    setShown('');
    if (!text) {
      setStreaming(false);
      return;
    }

    const timer = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setStreaming(false);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [text, intervalMs]);

  return { shown, streaming };
}
