import { beforeEach, describe, expect, test, vi } from 'vitest';

const play = vi.fn(() => Promise.resolve());

class AudioMock {
  preload = '';
  play = play;
  cloneNode() {
    return new AudioMock();
  }
}

describe('sound preference', () => {
  beforeEach(() => {
    play.mockClear();
    vi.stubGlobal('Audio', AudioMock);
    vi.resetModules();
  });

  test('suppresses cached and one-off sounds while muted', async () => {
    const { playBuzz, playYaji, setSoundEnabled } = await import('./sfx');
    setSoundEnabled(false);
    playBuzz();
    playYaji(0);
    expect(play).not.toHaveBeenCalled();

    setSoundEnabled(true);
    playBuzz();
    playYaji(0);
    expect(play).toHaveBeenCalledTimes(2);
  });
});
