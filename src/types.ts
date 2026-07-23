// rooms/{code} の Firebase データモデル。旧 common.js / 各HTMLの inline script から抽出。

export interface Player {
  name: string;
  emoji: string;
  score: number;
  lastYajiAt?: number;
}

export interface RoomSettings {
  defaultPlayerSound: boolean;
  yajiCooldownSeconds: number;
}

export interface RoomMeta {
  password: string;
  questionNumber: number;
  questionText: string;
  questionPoints?: number;
  result: Result | null;
  createdAt: number | object; // ServerValue.TIMESTAMP は書き込み時はオブジェクト、読み込み時は number
  settings?: Partial<RoomSettings>;
}

export interface Buzz {
  id: string;
  name: string;
  emoji: string;
  token?: string;
  ts: number | object;
}

export interface Result {
  type: 'correct' | 'wrong';
  name: string;
  pts: number;
  ts: number;
}

export interface HistoryEntry {
  name: string;
  pts: number;
  q: number;
  ts: number;
}

export interface Award {
  playerId: string;
  name: string;
  pts: number;
  ts: number;
}

export interface Yaji {
  i: number;
  ts: number;
}

export type PlayersMap = Record<string, Player>;
export type HistoryMap = Record<string, HistoryEntry>;
export type AwardsMap = Record<string, Award>;
