# 🔴 早押しボタン (Hayaoshi Button)

クイズ番組みたいな早押しボタンを、みんなのスマホで遊べるWebアプリ。
**サーバー不要**（GitHub Pages + Firebase）。

- 📱 回答者：スマホで大きい赤ボタンを押す → 最初の1人だけが回答できる
- 📺 出題者：中央スクリーンで問題を出し、◯／✗を判定。得点が自動でつく

---

## 必要なもの
- Google アカウント（Firebase 用・無料）
- GitHub アカウント（公開用・無料）

所要時間：**約10〜15分**

---

## ① Firebase をセットアップ（5分）

1. https://console.firebase.google.com/ を開く
2. 「**プロジェクトを追加**」→ 名前は何でもOK（例 `hayaoshi`）→ Google アナリティクスは**オフでOK** →作成
3. 左メニュー「**構築 → Realtime Database**」→「**データベースを作成**」
   - ロケーションはそのままでOK
   - セキュリティルールは「**テストモードで開始**」を選択（あとで下の④で設定します）
4. 左上の歯車 ⚙️ →「**プロジェクトの設定**」→ 下にスクロールして「**マイアプリ**」
5. **`</>`（ウェブ）アイコン**をクリック → アプリのニックネームを入れて「アプリを登録」
6. 表示される `firebaseConfig = { ... }` の中身をコピー

7. このプロジェクトの **`firebase-config.js`** を開いて、`firebaseConfig` の中身を貼り替える：

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "hayaoshi-xxxx.firebaseapp.com",
  databaseURL: "https://hayaoshi-xxxx-default-rtdb.firebaseio.com", // ← Realtime DBのURL
  projectId: "hayaoshi-xxxx",
  storageBucket: "hayaoshi-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
};
```

> ⚠️ `databaseURL` が config に無い場合は、Realtime Database の画面の上部に表示されている
> `https://....firebaseio.com` をコピーして貼ってください。

---

## ② ローカルで試す（任意・1分）

ファイルをダブルクリックでもだいたい動きますが、確実に動かすなら：

```bash
cd ~/Documents/Hayaoshi-button
python3 -m http.server 8000
```

ブラウザで:
- 出題者：`http://localhost:8000/host.html`
- 回答者：`http://localhost:8000/index.html`（別タブ／別端末）

---

## ③ GitHub Pages で公開（5分）

1. GitHub で新しいリポジトリを作る（例 `hayaoshi-button`、Public）
2. このフォルダのファイルを全部アップロード（またはpush）：

```bash
cd ~/Documents/Hayaoshi-button
git add .
git commit -m "早押しボタン MVP"
git branch -M main
git remote add origin https://github.com/＜あなた＞/hayaoshi-button.git
git push -u origin main
```

3. リポジトリの **Settings → Pages** →
   - **Source: Deploy from a branch**
   - **Branch: main / (root)** → Save
4. 数分待つと `https://＜あなた＞.github.io/hayaoshi-button/` で公開されます

公開URL：
- 出題者／中央スクリーン：`.../host.html`
- 回答者：`.../index.html`（トップ）

---

## ④ Firebase のセキュリティルール（おすすめ）

「テストモード」は約30日で読み書きできなくなります。パーティ用途なら下記でOK
（誰でも読み書きできる簡易ルール。本格運用ならコード単位で絞ってください）：

Realtime Database →「ルール」タブに貼り付けて公開：

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

## 遊び方

1. 出題者が `host.html` を開く →「ルーム作成」→ **4桁コード**が出る（パスワードは任意）
2. みんなは `index.html` を開く → **コード**と**名前**を入れて参加
3. 出題者が（必要なら）問題文を入れて「📢 この問題を出す」→ 文字が流れて表示
4. 回答者が赤ボタンを押す → **最初の1人だけ**ロック、「◯◯さんが回答中」
5. 出題者が **⭕正解（+1点）** か **❌不正解（全員また押せる）** を判定
6. 「▶ 次の問題へ」で次へ。得点はランキングに自動反映

---

## ファイル構成
| ファイル | 役割 |
|---|---|
| `index.html` | 回答者の参加画面 |
| `play.html` | 回答者の早押しボタン画面 |
| `host.html` | 出題者＝中央スクリーン（操作＋表示） |
| `common.js` | 絵文字・効果音・演出など共通処理 |
| `firebase-config.js` | ★あなたのFirebase設定を貼る場所 |
| `sfx/` | クイズ効果音（早押し・正解・不正解・出題）|

効果音は `common.js` の `SFX` で割り当てています。差し替えたい場合はファイル名を変更するだけ。

---

## 将来やりたいこと（後回し）
- Excel/CSV で問題をアップロードして出題者が選んで流す
- 回答制限時間、ラウンド数設定、音の切替
- 不正解した人をその問題だけロックする方式

🎤 by [@hrxm](https://instagram.com/hrxm) · 🍸 x-garden · 🇯🇵 Tokyo &copy; 2026

---
### メモ（セキュリティ）
CDNから読む `firebase-*.js` に `integrity`（SRI）を付けるとより安全ですが、
バージョン更新のたびにハッシュ更新が必要なため、本MVPでは省略しています。
