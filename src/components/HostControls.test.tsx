import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { HostControls } from './HostControls';

const buzz = { id: 'p1', name: 'Hiro', emoji: '🐯', token: 'buzz-1', ts: 1 };

function renderControls(scored = false) {
  render(
    <HostControls
      buzz={buzz}
      questionNumber={5}
      questionScored={scored}
      activePoints={3}
      qDisplayText="日本で一番高い山は？"
      onAsk={vi.fn()}
      onJudge={vi.fn()}
      onCancel={vi.fn()}
      onNext={vi.fn()}
    />
  );
}

describe('HostControls', () => {
  test('shows question hierarchy and keyboard hints', () => {
    renderControls();
    expect(screen.getByText('第 5 問')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /正解 \[C\]/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /不正解 \[X\]/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /次の問題 \[\.\]/ })).toBeEnabled();
  });

  test('folds only the displayed host question text', async () => {
    const user = userEvent.setup();
    renderControls();
    expect(screen.getByLabelText('出題中の問題文')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '問題文を隠す' }));
    expect(screen.queryByLabelText('出題中の問題文')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeVisible();
  });

  test('disables correct after the question has already scored', () => {
    renderControls(true);
    expect(screen.getByRole('button', { name: /採点済み/ })).toBeDisabled();
  });
});
