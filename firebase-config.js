// ⚠️ ここに Firebase の設定を貼り付けてください（README の手順参照）
// Firebase コンソール → プロジェクトの設定 → 「マイアプリ」→ Web アプリ → firebaseConfig
//
// 下の中身を、あなたのプロジェクトの値に置き換えるだけでOKです。
// databaseURL が無い場合は Realtime Database を作成すると表示されます。

const firebaseConfig = {
  apiKey: "AIzaSyCuBgKFiHINuaHMR0CvcrO0LFh5ukhwrj0",
  authDomain: "tanoshii-hayaoshi-button.firebaseapp.com",
  databaseURL: "https://tanoshii-hayaoshi-button-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tanoshii-hayaoshi-button",
  storageBucket: "tanoshii-hayaoshi-button.firebasestorage.app",
  messagingSenderId: "647910118827",
  appId: "1:647910118827:web:bd27122a523d18aeb16eee",
  measurementId: "G-G28G8FYCFE"
};

// ↓ これは触らなくてOK
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
