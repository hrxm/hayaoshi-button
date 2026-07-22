<a name="top"></a>

![早押しボタン banner](banner.svg)

# 早押しボタン / Hayaoshi Button 🔴

**日本語** | [English](#english)

みんなのスマホをリアルタイム早押しボタンに。サーバー不要、Firebase だけで動きます。

> 出題者が `host.html` を開いてルームを作成 → 回答者が `index.html` でコードを入力して参加 → 赤いボタンを押す！

## 特徴

- **早押しロック** — Firebase トランザクションで同時押しを処理、最初の1人だけが回答権を獲得
- **問題文ストリーミング** — 1文字ずつ流れる演出が全員の画面にリアルタイム同期
- **得点・履歴管理** — 問題ごとにポイントを設定、正解履歴をリアルタイム記録
- **ヤジ機能** — 誰でもランダムな効果音を全員の画面に飛ばせる
- **セッション復帰** — 出題者がページを離れてもルームコードで再接続可能
- **最大100人同時接続** — Firebase Realtime Database の無料プランで対応

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | 回答者の参加画面 |
| `play.html` | 回答者の早押しボタン画面 |
| `host.html` | 出題者・中央スクリーン（操作 + スコアボード） |
| `common.js` | 効果音・絵文字・演出など共通処理 |
| `firebase-config.example.js` | Firebase 設定テンプレート |
| `sfx/` | クイズ効果音（CC BY 4.0） |

## セットアップ

### 1. Firebase を準備する（5分）

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. **Realtime Database** を追加（テストモードで開始、ロケーションはデフォルトでOK）
3. プロジェクト設定 → マイアプリ → ウェブアプリを追加 → `firebaseConfig` をコピー

### 2. 設定ファイルを作成する

```bash
cp firebase-config.example.js firebase-config.js
```

`firebase-config.js` を開き、`firebaseConfig` の中身をコピーした値に書き換える。

> [!IMPORTANT]
> `firebase-config.js` は `.gitignore` 済みです。**絶対に GitHub にコミットしないでください。**

### 3. ローカルで起動する

```bash
python3 -m http.server 8000
```

| 役割 | URL |
|---|---|
| 出題者 | `http://localhost:8000/host.html` |
| 回答者（同じ端末） | `http://localhost:8000/index.html` |
| 回答者（スマホなど） | `http://<あなたのIPアドレス>:8000/index.html` |

同じ Wi-Fi 内のスマホから接続する場合は `ipconfig getifaddr en0`（Mac）でIPアドレスを確認してください。

> [!WARNING]
> GitHub Pages にデプロイしても `firebase-config.js` はアップロードされないため、Pages URL から Firebase への接続はできません。パーティなどの一時利用はローカルサーバー運用が最もシンプルです。

### 4. Firebase セキュリティルール

テストモードは約30日で期限切れになります。**Realtime Database → ルール** タブに以下を貼り付けてください。

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## 遊び方

1. 出題者が `host.html` を開いて **「ルーム作成！」** → 4桁のコードが表示される
2. 回答者が `index.html` を開いて **コード** と **名前** を入力して参加
3. 出題者が問題文を入力して **「📢 この問題を出す（流す）」** → 文字が全員の画面に流れる
4. 回答者が赤いボタンを押す → **最初の1人だけ** ロックされ「○○さんが回答中」
5. 出題者が **⭕ 正解** / **❌ 不正解** / **↩ キャンセル** を選択
6. **「▶ 次の問題へ」** で次へ。得点はリアルタイムでランキングに反映

## 音源クレジット

`sfx/` フォルダの効果音は **CC BY 4.0** ライセンスで利用しています。再配布・公開の際はライセンス表示が必要です。

---

<a name="english"></a>

# Hayaoshi Button 🔴

[日本語](#top) | **English**

Turn everyone's smartphone into a real-time quiz buzzer. No server required — runs entirely on Firebase.

> Host opens `host.html` and creates a room → Players open `index.html`, enter the room code and their name → Hit the big red button!

## Features

- **Buzz lock** — Firebase transaction handles simultaneous presses; only the first player wins the answer slot
- **Question streaming** — Text appears character by character, synced to all screens in real time
- **Scoring & history** — Set points per question; correct answers are logged automatically
- **Heckle (ヤジ)** — Anyone can fire a random sound effect to all screens at any time
- **Session recovery** — Host can reconnect to an active room using the room code
- **Up to 100 concurrent players** — Supported on Firebase Realtime Database free plan

## File structure

| File | Purpose |
|---|---|
| `index.html` | Player join screen |
| `play.html` | Player buzzer screen |
| `host.html` | Host / central display (controls + scoreboard) |
| `common.js` | Shared: sound effects, emoji assignment, utilities |
| `firebase-config.example.js` | Firebase config template |
| `sfx/` | Quiz sound effects (CC BY 4.0) |

## Setup

### 1. Create a Firebase project (5 min)

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Add a **Realtime Database** (start in test mode, default location is fine)
3. Go to Project Settings → Your apps → Add web app → copy the `firebaseConfig` object

### 2. Create your config file

```bash
cp firebase-config.example.js firebase-config.js
```

Open `firebase-config.js` and replace the placeholder values with your copied Firebase config.

> [!IMPORTANT]
> `firebase-config.js` is listed in `.gitignore`. **Never commit it to GitHub.**

### 3. Run locally

```bash
python3 -m http.server 8000
```

| Role | URL |
|---|---|
| Host | `http://localhost:8000/host.html` |
| Players (same machine) | `http://localhost:8000/index.html` |
| Players (phones on same Wi-Fi) | `http://<your-ip-address>:8000/index.html` |

Find your IP address with `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows).

> [!WARNING]
> `firebase-config.js` is not pushed to GitHub, so a GitHub Pages deployment cannot connect to Firebase. For a party or one-off event, a local server is the simplest option.

### 4. Firebase Security Rules

Test mode expires after ~30 days. Paste the following into the **Rules** tab of your Realtime Database:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## How to play

1. Host opens `host.html` → clicks **「ルーム作成！」** → a 4-character room code appears
2. Players open `index.html` → enter the **code** and their **name** → tap join
3. Host types a question and clicks **「📢 この問題を出す」** → text streams to all screens
4. Players tap the red button → **only the first press** locks in; others see "○○ is answering"
5. Host selects **⭕ Correct** / **❌ Wrong** / **↩ Cancel**
6. **「▶ 次の問題へ」** advances to the next question; scores update live on all screens

## Sound credits

Sound effects in `sfx/` are used under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license. Attribution is required for redistribution.

---

🎤 by [@hrxm](https://instagram.com/hrxm) · 🍸 x-garden · Tokyo
