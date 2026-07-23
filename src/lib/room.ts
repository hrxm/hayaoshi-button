// ルームコード生成・検証。common.js から移植（挙動は変えていない）。

// ルームコード生成（4桁英数字）
export function genRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい0/O/1/Iは除外
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ルームコードの検証（Firebaseパス事故・インジェクション防止）
// 使える文字は genRoomCode と同じ [A-Z2-9] のみ。それ以外は除去。
export function sanitizeCode(s: string | null | undefined): string {
  return String(s || '')
    .toUpperCase()
    .replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '')
    .slice(0, 4);
}

// FirebaseのpushキーID（URLセーフ文字のみ）。パストラバーサル防止。
export function sanitizeId(s: string | null | undefined): string {
  return String(s || '')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, 40);
}
