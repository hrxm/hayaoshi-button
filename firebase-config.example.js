// ⚠️ ここに Firebase の設定を貼り付けてください（README の手順参照）
// Firebase コンソール → プロジェクトの設定 → 「マイアプリ」→ Web アプリ → firebaseConfig
//
// 下の中身を、あなたのプロジェクトの値に置き換えるだけでOKです。
// databaseURL が無い場合は Realtime Database を作成すると表示されます。

const firebaseConfig = {
  apiKey: "ここに貼る",
  authDomain: "ここに貼る",
  databaseURL: "ここに貼る",
  projectId: "ここに貼る",
  storageBucket: "ここに貼る",
  messagingSenderId: "ここに貼る",
  appId: "ここに貼る",
  measurementId: "ここに貼る",
};

// ↓ これは触らなくてOK
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
