<a name="top"></a>

![早押しボタン banner](banner.svg)

# 早押しボタン / Hayaoshi Button 🔴

**日本語** | [English](#english)

みんなのスマホをリアルタイム早押しボタンに。Vite + React + Firebase、Vercel にそのままデプロイできます。

> 出題者が `/host` を開いてルームを作成 → 回答者が `/` でコードを入力して参加 → 赤いボタンを押す！

## 特徴

- **早押しロック** — Firebase トランザクションで同時押しを処理、最初の1人だけが回答権を獲得
- **問題文ストリーミング** — 1文字ずつ流れる演出が全員の画面にリアルタイム同期
- **得点・履歴管理** — 問題ごとにポイントを設定、正解履歴をリアルタイム記録
- **ヤジ機能** — 誰でもランダムな効果音を全員の画面に飛ばせる
- **セッション復帰** — 出題者がページを離れてもルームコードで再接続可能
- **接続状態の表示** — Firebase との接続が切れると画面上部に警告バッジが出る
- **最大100人同時接続** — Firebase Realtime Database の無料プランで対応

## 技術構成

- **フロントエンド**: Vite + React + TypeScript（SPA、`react-router-dom` でルーティング）
- **バックエンド**: Firebase Realtime Database（サーバーコードなし、クライアント直結）
- **デプロイ**: Vercel（GitHub 連携で `main` に push すると自動デプロイ）

## ファイル構成

| パス | 役割 |
|---|---|
| `src/pages/Join.tsx` | 回答者の参加画面（旧 `index.html`） |
| `src/pages/Play.tsx` | 回答者の早押しボタン画面（旧 `play.html`） |
| `src/pages/Host.tsx` | 出題者・中央スクリーン（旧 `host.html`） |
| `src/components/` | ボタン・問題ストリーミング・スコアボードなどの共通コンポーネント |
| `src/hooks/` | Firebase 購読・早押しトランザクションなどのロジック |
| `src/lib/firebase.ts` | Firebase 初期化（設定は環境変数から読む） |
| `src/lib/sfx.ts` | 効果音再生（WebAudio フォールバック付き） |
| `.env.example` | Firebase 設定の環境変数テンプレート |
| `public/sfx/` | クイズ効果音（CC BY 4.0） |
| `vercel.json` | SPA ルーティング用の rewrite 設定 |

## セットアップ

### 1. Firebase を準備する（5分）

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. **Realtime Database** を追加（テストモードで開始、ロケーションはデフォルトでOK）
3. プロジェクト設定 → マイアプリ → ウェブアプリを追加 → `firebaseConfig` をコピー

### 2. 環境変数を設定する

```bash
cp .env.example .env.local
```

`.env.local` を開き、`VITE_FIREBASE_*` の値をコピーした `firebaseConfig` の内容に書き換える。

> [!IMPORTANT]
> `.env.local` は `.gitignore` 済みです。**絶対に GitHub にコミットしないでください。**
> （`.env.example` はプレースホルダのみなので追跡されます。）

### 3. ローカルで起動する

```bash
npm install
npm run dev
```

表示された URL（例: `http://localhost:5173`）にアクセス。

| 役割 | パス |
|---|---|
| 回答者の参加画面 | `/` |
| 出題者・中央スクリーン | `/host` |

同じ Wi-Fi 内のスマホから接続する場合は `npm run dev -- --host` で `Network:` の URL を有効化してください。

### 4. Vercel にデプロイする

1. このリポジトリを GitHub に push
2. [Vercel](https://vercel.com/) でこのリポジトリを Import（フレームワークは自動検出: Vite）
3. Project Settings → **Environment Variables** に `.env.example` と同じキー（`VITE_FIREBASE_*`）を設定
4. Deploy。以降 `main` に push するたびに自動デプロイされる

> [!NOTE]
> `VITE_` から始まる環境変数はビルド時にクライアントバンドルへ埋め込まれます（今までの
> `firebase-config.js` と同じ扱い）。Firebase の Web 設定値自体は秘密情報ではなく、実際のアクセス制御は
> 次の Realtime Database ルールで行います。

### 5. Firebase セキュリティルール

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

1. 出題者が `/host` を開いて **「ルーム作成！」** → 4桁のコードが表示される
2. 回答者が `/` を開いて **コード** と **名前** を入力して参加
3. 出題者が問題文を入力して **「📢 この問題を出す（流す）」** → 文字が全員の画面に流れる
4. 回答者が赤いボタンを押す → **最初の1人だけ** ロックされ「○○さんが回答中」
5. 出題者が **⭕ 正解** / **❌ 不正解** / **↩ キャンセル** を選択
6. **「▶ 次の問題へ」** で次へ。得点はリアルタイムでランキングに反映

## 音源クレジット

`public/sfx/` フォルダの効果音は **CC BY 4.0** ライセンスで利用しています。再配布・公開の際はライセンス表示が必要です。

---

<a name="english"></a>

# Hayaoshi Button 🔴

[日本語](#top) | **English**

Turn everyone's smartphone into a real-time quiz buzzer. Vite + React + Firebase, ready to deploy on Vercel.

> Host opens `/host` and creates a room → Players open `/`, enter the room code and their name → Hit the big red button!

## Features

- **Buzz lock** — Firebase transaction handles simultaneous presses; only the first player wins the answer slot
- **Question streaming** — Text appears character by character, synced to all screens in real time
- **Scoring & history** — Set points per question; correct answers are logged automatically
- **Heckle (ヤジ)** — Anyone can fire a random sound effect to all screens at any time
- **Session recovery** — Host can reconnect to an active room using the room code
- **Connection status** — A banner appears if the Firebase connection drops
- **Up to 100 concurrent players** — Supported on Firebase Realtime Database free plan

## Stack

- **Frontend**: Vite + React + TypeScript (SPA, routed with `react-router-dom`)
- **Backend**: Firebase Realtime Database (no server code, client talks to it directly)
- **Deploy**: Vercel (connected to GitHub — every push to `main` auto-deploys)

## File structure

| Path | Purpose |
|---|---|
| `src/pages/Join.tsx` | Player join screen (formerly `index.html`) |
| `src/pages/Play.tsx` | Player buzzer screen (formerly `play.html`) |
| `src/pages/Host.tsx` | Host / central display (formerly `host.html`) |
| `src/components/` | Shared UI: buzz button, question stream, scoreboard, etc. |
| `src/hooks/` | Firebase subscription and buzz-transaction logic |
| `src/lib/firebase.ts` | Firebase init (config read from environment variables) |
| `src/lib/sfx.ts` | Sound playback with WebAudio fallback |
| `.env.example` | Firebase config environment variable template |
| `public/sfx/` | Quiz sound effects (CC BY 4.0) |
| `vercel.json` | SPA rewrite config for client-side routing |

## Setup

### 1. Create a Firebase project (5 min)

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Add a **Realtime Database** (start in test mode, default location is fine)
3. Go to Project Settings → Your apps → Add web app → copy the `firebaseConfig` object

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the `VITE_FIREBASE_*` values from your copied Firebase config.

> [!IMPORTANT]
> `.env.local` is listed in `.gitignore`. **Never commit it to GitHub.**
> (`.env.example` holds only placeholders, so it is tracked.)

### 3. Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`).

| Role | Path |
|---|---|
| Player join screen | `/` |
| Host / central display | `/host` |

To connect from phones on the same Wi-Fi, run `npm run dev -- --host` to expose the `Network:` URL.

### 4. Deploy to Vercel

1. Push this repository to GitHub
2. Import the repository in [Vercel](https://vercel.com/) (framework auto-detected: Vite)
3. In Project Settings → **Environment Variables**, add the same keys as `.env.example` (`VITE_FIREBASE_*`)
4. Deploy. Every push to `main` auto-deploys from then on.

> [!NOTE]
> Variables prefixed `VITE_` are embedded into the client bundle at build time — the same
> exposure as the old `firebase-config.js`. Firebase web config values aren't secrets; actual
> access control comes from the Realtime Database rules below.

### 5. Firebase Security Rules

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

1. Host opens `/host` → clicks **「ルーム作成！」** → a 4-character room code appears
2. Players open `/` → enter the **code** and their **name** → tap join
3. Host types a question and clicks **「📢 この問題を出す」** → text streams to all screens
4. Players tap the red button → **only the first press** locks in; others see "○○ is answering"
5. Host selects **⭕ Correct** / **❌ Wrong** / **↩ Cancel**
6. **「▶ 次の問題へ」** advances to the next question; scores update live on all screens

## Sound credits

Sound effects in `public/sfx/` are used under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license. Attribution is required for redistribution.

---

🎤 by [@hrxm](https://instagram.com/hrxm) · 🍸 x-garden · Tokyo
