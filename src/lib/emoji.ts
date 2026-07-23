// プレイヤーの絵文字割り当て。common.js から移植。
// 同時参加でのemoji衝突を避けるため、参加人数ではなく Firebase push key のハッシュから決める
// （index.html の過去の修正: git commit a2955e8 を参照）。

export const ANIMAL_EMOJIS = [
  '🐶', '🐱', '🐻', '🐼', '🦊', '🐯', '🦁', '🐮', '🐷', '🐸',
  '🐵', '🐧', '🐦', '🦄', '🐺', '🐴', '🦋', '🐢', '🐬', '🐙',
  '🦉', '🦅', '🐝', '🦓', '🐲', '🦖', '🦕', '🐿️', '🦔', '🐰',
];

export function pickEmoji(index: number): string {
  return ANIMAL_EMOJIS[index % ANIMAL_EMOJIS.length];
}

// Firebase push key の文字コード合計から emoji を決める。同時参加でも衝突しにくい。
// 注意: emoji は30種類のみのため、31人目以降や偶然のハッシュ衝突では重複しうる（既知の制約）。
export function emojiFromKey(key: string): string {
  const keySum = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return pickEmoji(keySum);
}
