// Firebase 初期化。設定値は Vite の環境変数（.env.local / Vercel の Environment Variables）から読む。
// 元の firebase-config.js と違い、実キーはリポジトリに含まれない。
import { initializeApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 安定化: databaseURL が空/プレースホルダのままだと firebase/database は
// initializeApp 直後（モジュール読み込み時）に FATAL ERROR を投げ、React が
// マウントする前にアプリ全体が白画面になっていた。ここで事前に検証し、
// 呼び出し側（main.tsx）が分かりやすい設定案内画面を出せるようにする。
function isValidDatabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.length > 0;
  } catch {
    return false;
  }
}

export const firebaseConfigError = !isValidDatabaseUrl(firebaseConfig.databaseURL)
  ? 'VITE_FIREBASE_DATABASE_URL が未設定、または不正な値です。.env.local を作成してください（.env.example 参照）。'
  : null;

let db: Database;

if (!firebaseConfigError) {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} else {
  // eslint-disable-next-line no-console
  console.error('[firebase] ' + firebaseConfigError);
}

// firebaseConfigError が null であることを呼び出し側が保証してから使う想定。
export { db };
