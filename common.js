// 早押しボタン 共通処理

const ANIMAL_EMOJIS = ['🐶','🐱','🐻','🐼','🦊','🐯','🦁','🐮','🐷','🐸',
                       '🐵','🐧','🐦','🦄','🐺','🐴','🦋','🐢','🐬','🐙',
                       '🦉','🦅','🐝','🦓','🐲','🦖','🦕','🐿️','🦔','🐰'];

function pickEmoji(index) {
  return ANIMAL_EMOJIS[index % ANIMAL_EMOJIS.length];
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── 効果音（WebAudio。mp3不要・音源ファイル不要）──────────────────
let _audioCtx = null;
function ctx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}
function beep(freq, durationMs, type = 'sine', gain = 0.2, startAt = 0) {
  const c = ctx();
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
// 早押し音（ブザー風）
function playBuzz()    { beep(880, 120, 'square', 0.15); beep(660, 140, 'square', 0.15, 0.08); }
// 正解音（ピンポン）
function playCorrect() { beep(880, 150, 'sine', 0.25); beep(1320, 350, 'sine', 0.25, 0.15); }
// 不正解音（ブッブー）
function playWrong()   { beep(200, 400, 'sawtooth', 0.2); }

// ── 控えめフラッシュ（目に優しい）──────────────────────────────
function flash(color = 'rgba(255,215,0,0.15)') {
  let f = document.getElementById('__flash');
  if (!f) {
    f = document.createElement('div');
    f.id = '__flash';
    f.style.cssText = 'position:fixed;inset:0;pointer-events:none;opacity:0;' +
      'transition:opacity .12s;z-index:9999;';
    document.body.appendChild(f);
  }
  f.style.background = color;
  f.style.opacity = '1';
  setTimeout(() => { f.style.opacity = '0'; }, 120);
}

// ── ルームコード生成（4桁英数字）──────────────────────────────
function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい0/O/1/Iは除外
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ── URLパラメータ取得 ────────────────────────────────────────
function param(key, def = '') {
  return new URLSearchParams(location.search).get(key) || def;
}
