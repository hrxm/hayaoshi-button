# 早押しボタン (Hayaoshi Button) — 設計書

日付: 2026-06-27
ステータス: MVP（1時間で完成版）

## 目的
クイズ番組のような「早押しボタン」をみんなでワイワイ遊ぶWebアプリ。
回答者が赤ボタンを押すと最初の1人だけにロックがかかり、出題者（親）が
正解/不正解を判定して得点を付ける。GitHub Pagesで公開する。

## 制約 / 方針
- **GitHub Pages（静的ホスティング）で公開** → サーバーを動かせない
- リアルタイム同期は **Firebase Realtime Database** で実現
- **ビルド工程なし**（素のHTML + JS + CDN）。ファイルを置くだけで動く
- 最短・最小（MVP）。凝った設定は後回し

## スタック
- HTML + 素のJavaScript
- Firebase Realtime Database（CDN: firebase compat SDK）
- GitHub Pages

## 画面構成（3ファイル）
1. **index.html** — トップ。ルーム参加（回答者）。ルーム作成リンクも置く。
2. **play.html** — 回答者画面。大きい赤ボタン。自分の名前・絵文字・得点。
3. **host.html** — 出題者＝中央スクリーン兼用。問題番号、（任意）問題文の
   ストリーミング表示、参加者一覧＋得点、「誰が回答中か」、◯/✗判定、次の問題。

## Firebase データ構造
```
rooms/
  {ROOMCODE}/                 # 4桁英数字コード
    meta:
      password: "" | "xxxx"   # 任意。空なら誰でも参加可
      questionNumber: 1
      questionText: ""        # 任意。出題者が入力
      result: ""              # "" | "correct" | "wrong"（演出トリガ）
      resultName: ""          # 直近で判定された回答者名
      createdAt: <ts>
    buzz:                      # null=誰も押していない（押せる状態）
      id: <playerId>
      name: "たろう"
      emoji: "🐶"
      ts: <ts>
    players/
      {playerId}:
        name: "たろう"
        emoji: "🐶"
        score: 0
```

## 早押しロック（肝）
- 回答者が押すと `rooms/{code}/buzz` に **トランザクション** で書き込む。
- 既に `buzz` が存在すれば書き込み失敗（＝最初の1人だけ勝ち）。同時押しでも1人に確定。
- `buzz != null` の間、全回答者の赤ボタンは無効（押せない）。
- 全画面に「◯◯さんが回答中！」を表示。控えめな黄色フラッシュ＋音。

## 判定フロー（出題者）
- **正解**: 該当プレイヤーの score を +1（トランザクション）。`result="correct"`,
  `resultName=名前`。全画面でピンポン演出。`buzz` は残す → そのまま「次の問題」へ。
- **不正解**: `result="wrong"`。✗演出。`buzz` を **クリア（null）** → 全員また押せる。
  （回答者を締め出す方式は口頭運用。MVPでは実装しない）
- **次の問題**: `buzz` クリア、`questionNumber++`、`questionText` を新規入力、`result=""`。

## 参加フロー
1. 出題者が host.html で「ルーム作成」→ 4桁コード自動発行 / パスワード任意ON。
2. 回答者は index.html でコード＋名前入力 → 参加。動物絵文字を自動割当。
3. 出題者画面・回答者画面とも `rooms/{code}` を購読してリアルタイム反映。

## 演出（目に優しく）
- フラッシュは `rgba(255,215,0,0.15)` 程度の控えめな点灯を短時間。激しい点滅はしない。
- 音は正解/不正解/早押しで簡単な効果音（WebAudioのビープ or 任意mp3）。

## MVPに入れる
ルーム作成・参加、名前＆キャラ絵文字、早押しトランザクションロック、◯✗判定、
得点、次の問題、（任意）問題文ストリーミング表示、（任意）パスワード、控えめ演出＋音。

## 後回し（将来）
Excel/CSVアップロードして出題者が問題を選んで流す、回答制限時間、ラウンド数設定、
音の切替、回答者ロック方式の選択。

## デプロイ
- GitHubリポジトリにファイルを置き、Settings → Pages → main / root で公開。
- Firebase は無料プロジェクトを作成し、Web設定を firebase-config.js に貼る。
- Realtime Database のルールは「公開（read/write true）」でMVP運用。後でコード単位に絞る。
