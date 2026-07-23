import { fireEvent, render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useHostShortcuts } from './useHostShortcuts';

function Harness({
  onCorrect,
  onWrong,
  onNext,
}: {
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}) {
  useHostShortcuts({ canCorrect: true, canWrong: true, onCorrect, onWrong, onNext });
  return <input aria-label="question editor" />;
}

test('host shortcuts fire globally but never while editing text', () => {
  const onCorrect = vi.fn();
  const onWrong = vi.fn();
  const onNext = vi.fn();
  const { getByLabelText } = render(
    <Harness onCorrect={onCorrect} onWrong={onWrong} onNext={onNext} />
  );

  fireEvent.keyDown(window, { key: 'c' });
  fireEvent.keyDown(window, { key: 'x' });
  fireEvent.keyDown(window, { key: '.' });
  expect(onCorrect).toHaveBeenCalledOnce();
  expect(onWrong).toHaveBeenCalledOnce();
  expect(onNext).toHaveBeenCalledOnce();

  const editor = getByLabelText('question editor');
  fireEvent.keyDown(editor, { key: 'c' });
  fireEvent.keyDown(editor, { key: 'x' });
  fireEvent.keyDown(editor, { key: '.' });
  expect(onCorrect).toHaveBeenCalledOnce();
  expect(onWrong).toHaveBeenCalledOnce();
  expect(onNext).toHaveBeenCalledOnce();
});
