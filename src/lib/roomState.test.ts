import { describe, expect, test } from 'vitest';
import {
  applyCancelBuzz,
  applyCorrectJudgment,
  applyFullReset,
  applyHistoryClear,
  applyKickPlayer,
  applyNextQuestion,
  applyWrongJudgment,
  type TransactionRoom,
} from './roomState';

function room(): TransactionRoom {
  return {
    meta: {
      password: '',
      questionNumber: 5,
      questionText: '日本で一番高い山は？',
      result: null,
      createdAt: 1,
    },
    players: {
      p1: { name: 'Hiro', emoji: '🐯', score: 2 },
      p2: { name: 'Mika', emoji: '🐼', score: 1 },
    },
    buzz: { id: 'p1', name: 'Hiro', emoji: '🐯', token: 'buzz-1', ts: 10 },
    history: {},
    awards: {},
  };
}

describe('atomic room state transitions', () => {
  test('awards the first correct judgment and clears the buzz', () => {
    const next = applyCorrectJudgment(room(), {
      expectedBuzzToken: 'buzz-1',
      questionNumber: 5,
      points: 3,
      historyKey: 'history-1',
      now: 100,
    });

    expect(next?.players?.p1.score).toBe(5);
    expect(next?.buzz).toBeNull();
    expect(next?.awards?.['5']).toMatchObject({ playerId: 'p1', pts: 3 });
    expect(next?.history?.['history-1']).toMatchObject({ name: 'Hiro', pts: 3, q: 5 });
    expect(next?.meta.result).toMatchObject({ type: 'correct', name: 'Hiro', pts: 3 });
  });

  test('rejects another correct award for the same question', () => {
    const current = room();
    current.awards = { '5': { playerId: 'p2', name: 'Mika', pts: 1, ts: 90 } };

    expect(
      applyCorrectJudgment(current, {
        expectedBuzzToken: 'buzz-1',
        questionNumber: 5,
        points: 3,
        historyKey: 'history-2',
        now: 100,
      })
    ).toBeNull();
  });

  test('rejects a stale judgment after a newer player buzzes', () => {
    expect(
      applyCorrectJudgment(room(), {
        expectedBuzzToken: 'older-buzz',
        questionNumber: 5,
        points: 3,
        historyKey: 'history-1',
        now: 100,
      })
    ).toBeNull();
  });

  test('wrong clears only the expected buzz and records the result', () => {
    const next = applyWrongJudgment(room(), 'buzz-1', 100);
    expect(next?.buzz).toBeNull();
    expect(next?.meta.result).toMatchObject({ type: 'wrong', name: 'Hiro', pts: 0 });
    expect(applyWrongJudgment(room(), 'older-buzz', 100)).toBeNull();
  });

  test('cancel clears only the expected buzz', () => {
    expect(applyCancelBuzz(room().buzz!, 'buzz-1')).toBeNull();
    expect(applyCancelBuzz(room().buzz!, 'older-buzz')).toEqual(room().buzz);
  });

  test('next question advances only from the expected question', () => {
    const next = applyNextQuestion(room(), 5);
    expect(next?.meta.questionNumber).toBe(6);
    expect(next?.meta.questionText).toBe('');
    expect(next?.meta.result).toBeNull();
    expect(next?.buzz).toBeNull();
    expect(applyNextQuestion(next!, 5)).toBeNull();
  });

  test('full reset clears awards while history clear preserves them', () => {
    const current = room();
    current.awards = { '5': { playerId: 'p1', name: 'Hiro', pts: 3, ts: 100 } };
    current.history = { h1: { name: 'Hiro', pts: 3, q: 5, ts: 100 } };

    const historyCleared = applyHistoryClear(current);
    expect(historyCleared.history).toEqual({});
    expect(historyCleared.awards).toEqual(current.awards);

    const reset = applyFullReset(current);
    expect(reset.awards).toEqual({});
    expect(reset.history).toEqual({});
    expect(reset.players?.p1.score).toBe(0);
    expect(reset.meta.questionNumber).toBe(1);
  });

  test('kicking the current answerer removes them and clears the buzz', () => {
    const next = applyKickPlayer(room(), 'p1');
    expect(next?.players?.p1).toBeUndefined();
    expect(next?.players?.p2).toBeDefined();
    expect(next?.buzz).toBeNull();
  });

  test('kicking a non-answering player leaves the buzz untouched', () => {
    const next = applyKickPlayer(room(), 'p2');
    expect(next?.players?.p2).toBeUndefined();
    expect(next?.players?.p1).toBeDefined();
    expect(next?.buzz).toEqual(room().buzz);
  });

  test('kicking a nonexistent player id is a no-op', () => {
    expect(applyKickPlayer(room(), 'ghost')).toBeNull();
  });
});
