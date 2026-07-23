import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { firebaseConfigError } from './lib/firebase';
import { ConfigError } from './components/ConfigError';
import { Join } from './pages/Join';
import { Play } from './pages/Play';
import { Host } from './pages/Host';

export function App() {
  // 安定化: Firebase の設定が無効な場合は白画面ではなく案内画面を出す
  // （firebase.ts 参照。以前は getDatabase() が例外を投げ、React がマウントできなかった）。
  if (firebaseConfigError) {
    return <ConfigError message={firebaseConfigError} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/play" element={<Play />} />
        <Route path="/host" element={<Host />} />
      </Routes>
    </BrowserRouter>
  );
}
