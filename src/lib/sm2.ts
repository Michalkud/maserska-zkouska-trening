export type Sm2State = {
  ease: number;
  interval: number;
  repetitions: number;
};

export type Sm2Result = Sm2State & {
  dueAt: Date;
};

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;

const DAY_MS = 24 * 60 * 60 * 1000;

export function review(
  state: Sm2State,
  grade: number,
  now: Date = new Date(),
): Sm2Result {
  if (grade < 0 || grade > 5 || !Number.isInteger(grade)) {
    throw new Error(`grade must be an integer 0–5, got ${grade}`);
  }

  const easeDelta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  const nextEase = Math.max(MIN_EASE, state.ease + easeDelta);

  if (grade < 3) {
    return {
      ease: nextEase,
      interval: 1,
      repetitions: 0,
      dueAt: new Date(now.getTime() + DAY_MS),
    };
  }

  const nextReps = state.repetitions + 1;
  let nextInterval: number;
  if (nextReps === 1) {
    nextInterval = 1;
  } else if (nextReps === 2) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(state.interval * nextEase);
  }

  return {
    ease: nextEase,
    interval: nextInterval,
    repetitions: nextReps,
    dueAt: new Date(now.getTime() + nextInterval * DAY_MS),
  };
}

export function initialState(): Sm2State {
  return { ease: DEFAULT_EASE, interval: 0, repetitions: 0 };
}

export function gradeFromCorrect(
  correct: boolean,
  responseTimeMs: number,
): number {
  if (!correct) {
    return responseTimeMs < 10_000 ? 2 : 1;
  }
  if (responseTimeMs < 4_000) return 5;
  if (responseTimeMs < 10_000) return 4;
  return 3;
}
