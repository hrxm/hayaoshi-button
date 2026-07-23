import styles from './ConfigError.module.css';

interface ConfigErrorProps {
  message: string;
}

// Firebase 設定が無効なときに白画面の代わりに出す案内画面。
// ローカル開発中と、Vercel にデプロイしたが環境変数を設定し忘れた場合の
// 両方で表示されうるため、両方の対処法を案内する。
export function ConfigError({ message }: ConfigErrorProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.title}>⚠️ Firebase の設定が必要です</div>
        <p className={styles.message}>{message}</p>

        <div className={styles.scenario}>
          <h3>💻 ローカルで開発している場合</h3>
          <ol className={styles.steps}>
            <li>
              <code>.env.example</code> を <code>.env.local</code> にコピー
            </li>
            <li>Firebase Console → プロジェクトの設定 → マイアプリ から設定値をコピー</li>
            <li>
              <code>.env.local</code> の <code>VITE_FIREBASE_*</code> を書き換えて開発サーバーを再起動
            </li>
          </ol>
        </div>

        <div className={styles.scenario}>
          <h3>▲ Vercel にデプロイした場合</h3>
          <ol className={styles.steps}>
            <li>Vercel プロジェクト → Settings → Environment Variables を開く</li>
            <li>
              <code>.env.example</code> と同じ <code>VITE_FIREBASE_*</code> キーをすべて追加
            </li>
            <li>Deployments タブから最新のデプロイを再デプロイ（Redeploy）</li>
          </ol>
        </div>

        <p className={styles.hint}>詳しくは README のセットアップ手順を参照してください。</p>
      </div>
    </div>
  );
}
