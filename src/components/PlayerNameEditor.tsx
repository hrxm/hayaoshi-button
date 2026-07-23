import { useEffect, useState } from 'react';
import styles from './PlayerNameEditor.module.css';

interface PlayerNameEditorProps {
  emoji: string;
  name: string;
  onSave: (name: string) => void;
}

export function PlayerNameEditor({ emoji, name, onSave }: PlayerNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  useEffect(() => setDraft(name), [name]);

  function save() {
    const clean = draft.trim();
    if (!clean || clean.length > 20) return;
    onSave(clean);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button className={styles.nameButton} onClick={() => setEditing(true)} aria-label="名前を変更">
        <span>{emoji}</span>
        <strong>{name}</strong>
        <small>変更</small>
      </button>
    );
  }

  return (
    <div className={styles.editor}>
      <input
        aria-label="新しい名前"
        maxLength={20}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') save();
          if (event.key === 'Escape') setEditing(false);
        }}
        autoFocus
      />
      <button onClick={save} disabled={!draft.trim()}>
        保存
      </button>
      <button className={styles.cancel} onClick={() => setEditing(false)}>
        戻る
      </button>
    </div>
  );
}
