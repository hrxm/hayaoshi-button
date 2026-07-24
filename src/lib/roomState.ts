import type { AwardsMap, Buzz, HistoryMap, Player, Result, RoomMeta } from '../types';

export interface TransactionRoom {
  meta: RoomMeta;
  players?: Record<string, Player>;
  buzz?: Buzz | null;
  history?: HistoryMap;
  awards?: AwardsMap;
  yaji?: { i: number; ts: number } | null;
}

export interface CorrectJudgment {
  expectedBuzzToken: string;
  questionNumber: number;
  points: number;
  historyKey: string;
  now: number;
}

export function getBuzzToken(buzz: Buzz): string {
  return buzz.token || `${buzz.id}:${String(buzz.ts ?? '')}`;
}

export function correctJudgmentBlocker(
  room: TransactionRoom | null,
  judgment: CorrectJudgment
): string | null {
  if (!room) return 'room unavailable';
  if (!room.buzz) return 'no active buzz';
  if (getBuzzToken(room.buzz) !== judgment.expectedBuzzToken) return 'buzz changed';
  if (room.meta.questionNumber !== judgment.questionNumber) return 'question changed';
  if (room.awards?.[String(judgment.questionNumber)]) return 'question already scored';
  if (!room.players?.[room.buzz.id]) return 'answering player unavailable';
  return null;
}

function copyRoom(room: TransactionRoom): TransactionRoom {
  return {
    ...room,
    meta: { ...room.meta },
    players: Object.fromEntries(
      Object.entries(room.players || {}).map(([id, player]) => [id, { ...player }])
    ),
    history: { ...room.history },
    awards: { ...room.awards },
    buzz: room.buzz ? { ...room.buzz } : null,
  };
}

export function applyCorrectJudgment(
  room: TransactionRoom | null,
  judgment: CorrectJudgment
): TransactionRoom | null {
  if (correctJudgmentBlocker(room, judgment) || !room?.buzz) return null;

  const next = copyRoom(room);
  const buzz = next.buzz!;
  const points = Math.max(1, judgment.points || 1);
  next.players![buzz.id].score = (next.players![buzz.id].score || 0) + points;
  next.awards![String(judgment.questionNumber)] = {
    playerId: buzz.id,
    name: buzz.name,
    pts: points,
    ts: judgment.now,
  };
  next.history![judgment.historyKey] = {
    name: buzz.name,
    pts: points,
    q: judgment.questionNumber,
    ts: judgment.now,
  };
  next.meta.result = {
    type: 'correct',
    name: buzz.name,
    pts: points,
    ts: judgment.now,
  };
  next.buzz = null;
  return next;
}

export function applyWrongJudgment(
  room: TransactionRoom | null,
  expectedBuzzToken: string,
  now: number
): TransactionRoom | null {
  if (!room?.buzz || getBuzzToken(room.buzz) !== expectedBuzzToken) return null;
  const next = copyRoom(room);
  const result: Result = {
    type: 'wrong',
    name: room.buzz.name,
    pts: 0,
    ts: now,
  };
  next.meta.result = result;
  next.buzz = null;
  return next;
}

export function applyCancelBuzz(current: Buzz | null, expectedBuzzToken: string): Buzz | null {
  if (!current || getBuzzToken(current) !== expectedBuzzToken) return current;
  return null;
}

export function applyNextQuestion(
  room: TransactionRoom | null,
  expectedQuestionNumber: number
): TransactionRoom | null {
  if (!room || room.meta.questionNumber !== expectedQuestionNumber) return null;
  const next = copyRoom(room);
  next.meta.questionNumber = expectedQuestionNumber + 1;
  next.meta.questionText = '';
  next.meta.questionPoints = 1;
  next.meta.result = null;
  next.buzz = null;
  return next;
}

export function applyHistoryClear(room: TransactionRoom): TransactionRoom {
  const next = copyRoom(room);
  next.history = {};
  return next;
}

export function applyFullReset(room: TransactionRoom): TransactionRoom {
  const next = copyRoom(room);
  for (const player of Object.values(next.players || {})) player.score = 0;
  next.meta.questionNumber = 1;
  next.meta.questionText = '';
  next.meta.questionPoints = 1;
  next.meta.result = null;
  next.buzz = null;
  next.history = {};
  next.awards = {};
  return next;
}

// ホストがプレイヤーを退出させる。対象が現在の回答者だった場合はbuzzも解除し、
// 誰も回答できない状態のまま固まらないようにする。
export function applyKickPlayer(
  room: TransactionRoom | null,
  playerId: string
): TransactionRoom | null {
  if (!room?.players?.[playerId]) return null;
  const next = copyRoom(room);
  delete next.players![playerId];
  if (next.buzz?.id === playerId) next.buzz = null;
  return next;
}
