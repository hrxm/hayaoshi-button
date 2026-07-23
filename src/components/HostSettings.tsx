import { useState } from 'react';
import type { RoomSettings } from '../types';
import styles from './HostSettings.module.css';

interface HostSettingsProps {
  hostSoundEnabled: boolean;
  defaultPlayerSound: boolean;
  yajiCooldownSeconds: number;
  onHostSoundChange: (enabled: boolean) => void;
  onRoomSettingsChange: (settings: Partial<RoomSettings>) => void;
}

export function HostSettings({
  hostSoundEnabled,
  defaultPlayerSound,
  yajiCooldownSeconds,
  onHostSoundChange,
  onRoomSettingsChange,
}: HostSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className={styles.settings}>
      <button
        className={styles.toggle}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ⚙ {open ? 'ホスト設定を閉じる' : 'ホスト設定を開く'}
      </button>
      {open && (
        <div className={styles.body}>
          <label>
            <input
              type="checkbox"
              checked={hostSoundEnabled}
              onChange={(event) => onHostSoundChange(event.target.checked)}
            />
            このホスト端末の音
          </label>
          <label>
            <input
              type="checkbox"
              checked={defaultPlayerSound}
              onChange={(event) =>
                onRoomSettingsChange({ defaultPlayerSound: event.target.checked })
              }
            />
            プレイヤー端末の音（初期値）
          </label>
          <label className={styles.cooldown}>
            ヤジの待ち時間
            <input
              aria-label="ヤジの待ち時間"
              type="number"
              min={0}
              max={120}
              value={yajiCooldownSeconds}
              onChange={(event) =>
                onRoomSettingsChange({
                  yajiCooldownSeconds: Math.min(
                    120,
                    Math.max(0, Number(event.target.value) || 0)
                  ),
                })
              }
            />
            秒
          </label>
        </div>
      )}
    </section>
  );
}
