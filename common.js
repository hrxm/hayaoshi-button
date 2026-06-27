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

// ── 効果音 ───────────────────────────────────────────────────
// sfx/ フォルダのmp3を使う。読み込めない場合はWebAudioのビープで代替。
const SFX = {
  buzz:     'sfx/kaitou-Quiz-Ding_Dong02-2(Fast-Single).mp3',   // 早押し
  correct:  'sfx/seikai-Quiz-Ding_Dong04-3(Long).mp3',          // 正解
  wrong:    'sfx/fuseikai - Quiz-Buzzer02-4(Multi).mp3',         // 不正解
  question: 'sfx/shutsudai-Quiz-Question02-1(Low).mp3',         // 出題
  results:  'sfx/kekkahappyo-Quiz-Results01-2.mp3',             // 結果発表
  cheer:    'sfx/Yeah - Cheer-Yay02-2(High-Short-Solo).mp3',    // 歓声
};
// ヤジ（誰でもランダムに飛ばせる野次。回答中／出題中に使う）
const YAJI_SFX = [
  'sfx/yaji-Slide_Whistle01-5(Overtone-Up).mp3',
  'sfx/yaji-Slide_Whistle01-6(Overtone-Down).mp3',
  'sfx/yajiTambourine04-01(Hit-Hand).mp3',
];
const _audioCache = {};
function _audio(key) {
  if (!_audioCache[key]) { const a = new Audio(encodeURI(SFX[key])); a.preload = 'auto'; _audioCache[key] = a; }
  return _audioCache[key];
}
let _audioCtx = null;
function ctx() {
  if (!_audioCtx) { try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}
function beep(freq, durationMs, type = 'sine', gain = 0.2, startAt = 0) {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = gain;
  o.connect(g).connect(c.destination);
  const t = c.currentTime + startAt;
  o.start(t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
  o.stop(t + durationMs / 1000);
}
function playSfx(key, fallback) {
  try {
    const a = _audio(key).cloneNode(); // 連打で重ねて鳴らせるよう複製
    a.play().catch(() => { if (fallback) fallback(); });
  } catch (e) { if (fallback) fallback(); }
}
function playBuzz()     { playSfx('buzz',     () => { beep(880,120,'square',0.15); beep(660,140,'square',0.15,0.08); }); }
function playCorrect()  { playSfx('correct',  () => { beep(880,150,'sine',0.25); beep(1320,350,'sine',0.25,0.15); }); }
function playWrong()    { playSfx('wrong',    () => beep(200,400,'sawtooth',0.2)); }
function playQuestion() { playSfx('question'); }
// ヤジを鳴らす（i省略でランダム）。戻り値は使ったインデックス（同期用）
function playYaji(i) {
  const idx = (typeof i === 'number') ? (i % YAJI_SFX.length) : Math.floor(Math.random() * YAJI_SFX.length);
  try { const a = new Audio(encodeURI(YAJI_SFX[idx])); a.play().catch(() => beep(440,180,'triangle',0.18)); }
  catch (e) { beep(440,180,'triangle',0.18); }
  return idx;
}

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

// ── ルームコードの検証（Firebaseパス事故・インジェクション防止）────
// 使える文字は genRoomCode と同じ [A-Z2-9] のみ。それ以外は除去。
function sanitizeCode(s) {
  return String(s || '').toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '').slice(0, 4);
}
// FirebaseのpushキーID（URLセーフ文字のみ）。パストラバーサル防止。
function sanitizeId(s) {
  return String(s || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
}

// ── URLパラメータ取得 ────────────────────────────────────────
function param(key, def = '') {
  return new URLSearchParams(location.search).get(key) || def;
}
