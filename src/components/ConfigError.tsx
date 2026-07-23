import styles from './ConfigError.module.css';

interface ConfigErrorProps {
  message: string;
}

// Firebase 設定が無効なときに白画面の代わりに出す案内画面。
export function ConfigError({ message }: ConfigErrorProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.title}>⚠️ Firebase の設定が必要です</div>
        <p className={styles.message}>{message}</p>
        <ol className={styles.steps}>
          <li>
            <code>.env.example</code> を <code>.env.local</code> にコピー
          </li>
          <li>Firebase Console → プロジェクトの設定 → マイアプリ から設定値をコピー</li>
          <li>
            <code>.env.local</code> の <code>VITE_FIREBASE_*</code> を書き換えて開発サーバーを再起動
          </li>
        </ol>
        <p className={styles.hint}>詳しくは README のセットアップ手順を参照してください。</p>
      </div>
    </div>
  );
}
