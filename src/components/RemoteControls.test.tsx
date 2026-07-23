import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { RemoteControls } from './RemoteControls';

test('compact host controls expose live state and shortcut labels', () => {
  render(
    <RemoteControls
      questionNumber={5}
      questionText="日本で一番高い山は？"
      buzz={{ id: 'p1', name: 'Hiro', emoji: '🐯', token: 'b1', ts: 1 }}
      questionScored={false}
      soundEnabled
      onSoundChange={vi.fn()}
      onJudge={vi.fn()}
      onCancel={vi.fn()}
      onNext={vi.fn()}
    />
  );

  expect(screen.getByText('第 5 問')).toBeVisible();
  expect(screen.getByText('🐯 Hiro さん')).toBeVisible();
  expect(screen.getByRole('button', { name: /正解 \[C\]/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /不正解 \[X\]/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /次の問題 \[\.\]/ })).toBeEnabled();
  expect(screen.getByRole('checkbox', { name: 'この端末の音' })).toBeChecked();
});
