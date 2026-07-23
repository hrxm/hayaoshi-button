import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { HostSettings } from './HostSettings';

test('host settings stay collapsed and expose only sound and yaji controls', async () => {
  const user = userEvent.setup();
  const onRoomSettingsChange = vi.fn();
  render(
    <HostSettings
      hostSoundEnabled
      defaultPlayerSound
      yajiCooldownSeconds={10}
      onHostSoundChange={vi.fn()}
      onRoomSettingsChange={onRoomSettingsChange}
    />
  );

  expect(screen.queryByLabelText('ヤジの待ち時間')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /ホスト設定を開く/ }));
  expect(screen.getByLabelText('ヤジの待ち時間')).toHaveValue(10);
  expect(screen.queryByText(/問題文/)).not.toBeInTheDocument();
});
