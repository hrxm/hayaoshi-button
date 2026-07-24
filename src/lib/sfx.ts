// 効果音再生。common.js から移植。
// sfx/ フォルダのmp3を使う。読み込めない場合はWebAudioのビープで代替。
// 注意: 旧 common.js にあった SFX.results / SFX.cheer は未使用だったため削除した。

const SFX = {
  buzz: '/sfx/kaitou-Quiz-Ding_Dong02-2(Fast-Single).mp3', // 早押し
  correct: '/sfx/seikai-Quiz-Ding_Dong04-3(Long).mp3', // 正解
  wrong: '/sfx/fuseikai - Quiz-Buzzer02-4(Multi).mp3', // 不正解
  question: '/sfx/shutsudai-Quiz-Question02-1(Low).mp3', // 出題
} as const;

type SfxKey = keyof typeof SFX;

// ヤジ（誰でもランダムに飛ばせる野次。回答中／出題中に使う）。
// 拍手（クラップ・チア）もこの配列にランダムバリエーションとして追加している
// （専用ボタンではなく、既存のヤジボタン・クールダウンを共有する仕様）。
// TODO(user): ブーイング音源が用意でき次第、この配列に追加する。
export const YAJI_SFX = [
  '/sfx/yaji-Slide_Whistle01-5(Overtone-Up).mp3',
  '/sfx/yaji-Slide_Whistle01-6(Overtone-Down).mp3',
  '/sfx/yajiTambourine04-01(Hit-Hand).mp3',
  '/sfx/Yeah - Cheer-Yay02-2(High-Short-Solo).mp3',
];

const audioCache: Partial<Record<SfxKey, HTMLAudioElement>> = {};
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getAudio(key: SfxKey): HTMLAudioElement {
  if (!audioCache[key]) {
    const a = new Audio(encodeURI(SFX[key]));
    a.preload = 'auto';
    audioCache[key] = a;
  }
  return audioCache[key]!;
}

let audioCtx: AudioContext | null = null;

// オーディオ解錠（最初のユーザー操作時に呼ぶ）。AudioContext を作成/再開する。
export function unlockAudio(): AudioContext | null {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function beep(freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 0.2, startAt = 0) {
  const c = unlockAudio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g).connect(c.destination);
  const t = c.currentTime + startAt;
  o.start(t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
  o.stop(t + durationMs / 1000);
}

function playSfx(key: SfxKey, fallback?: () => void) {
  if (!soundEnabled) return;
  try {
    const a = getAudio(key).cloneNode() as HTMLAudioElement; // 連打で重ねて鳴らせるよう複製
    a.play().catch(() => fallback?.());
  } catch {
    fallback?.();
  }
}

export function playBuzz() {
  playSfx('buzz', () => {
    beep(880, 120, 'square', 0.15);
    beep(660, 140, 'square', 0.15, 0.08);
  });
}
export function playCorrect() {
  playSfx('correct', () => {
    beep(880, 150, 'sine', 0.25);
    beep(1320, 350, 'sine', 0.25, 0.15);
  });
}
export function playWrong() {
  playSfx('wrong', () => beep(200, 400, 'sawtooth', 0.2));
}
export function playQuestion() {
  playSfx('question');
}

// ヤジを鳴らす（i省略でランダム）。戻り値は使ったインデックス（同期用）
export function playYaji(i?: number): number {
  const idx = typeof i === 'number' ? i % YAJI_SFX.length : Math.floor(Math.random() * YAJI_SFX.length);
  if (!soundEnabled) return idx;
  try {
    const a = new Audio(encodeURI(YAJI_SFX[idx]));
    a.play().catch(() => beep(440, 180, 'triangle', 0.18));
  } catch {
    beep(440, 180, 'triangle', 0.18);
  }
  return idx;
}

// 控えめフラッシュ（目に優しい）
export function flash(color = 'rgba(255,215,0,0.15)') {
  let f = document.getElementById('__flash');
  if (!f) {
    f = document.createElement('div');
    f.id = '__flash';
    f.style.cssText =
      'position:fixed;inset:0;pointer-events:none;opacity:0;' + 'transition:opacity .12s;z-index:9999;';
    document.body.appendChild(f);
  }
  f.style.background = color;
  f.style.opacity = '1';
  setTimeout(() => {
    f.style.opacity = '0';
  }, 120);
}
