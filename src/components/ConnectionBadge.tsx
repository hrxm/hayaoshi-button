import { useConnection } from '../hooks/useConnection';
import styles from './ConnectionBadge.module.css';

// 新規追加（安定化）: Firebase への接続が切れたときに小さく警告を出す。
// オンライン時は何も表示しない（邪魔をしない）。
export function ConnectionBadge() {
  const connected = useConnection();
  if (connected) return null;

  return (
    <div className={styles.badge} role="status">
      🔌 接続が切れています…再接続を試みています
    </div>
  );
}
