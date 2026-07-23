import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { PlayerNameEditor } from './PlayerNameEditor';

test('player can open, validate, and save an inline name edit', async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<PlayerNameEditor emoji="🐯" name="Hiro" onSave={onSave} />);

  await user.click(screen.getByRole('button', { name: '名前を変更' }));
  const input = screen.getByLabelText('新しい名前');
  await user.clear(input);
  await user.type(input, '  New Hiro  ');
  await user.click(screen.getByRole('button', { name: '保存' }));
  expect(onSave).toHaveBeenCalledWith('New Hiro');
});
