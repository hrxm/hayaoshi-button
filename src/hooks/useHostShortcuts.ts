import { useEffect } from 'react';

interface HostShortcutOptions {
  canCorrect: boolean;
  canWrong: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
}

export function useHostShortcuts({
  canCorrect,
  canWrong,
  onCorrect,
  onWrong,
  onNext,
}: HostShortcutOptions) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === '.') onNext();
      else if (key === 'c' && canCorrect) onCorrect();
      else if (key === 'x' && canWrong) onWrong();
      else return;
      event.preventDefault();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canCorrect, canWrong, onCorrect, onNext, onWrong]);
}
