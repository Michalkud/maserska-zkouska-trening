export type SelectorQuestion = {
  id: string;
  topicId: string;
  topicWeight: number;
  mastery: { ease: number; dueAt: Date } | null;
};

export type SelectorOptions = {
  now?: Date;
  random?: () => number;
};

export function scoreQuestion(
  q: SelectorQuestion,
  now: Date = new Date(),
): number {
  if (!q.mastery) return Number.POSITIVE_INFINITY;

  const daysOverdue = Math.max(
    0,
    (now.getTime() - q.mastery.dueAt.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (daysOverdue === 0) return 0;

  const easeFactor = 1 / Math.max(q.mastery.ease, 0.01);
  return easeFactor * daysOverdue * q.topicWeight;
}

export function pickNextQuestion(
  questions: SelectorQuestion[],
  opts: SelectorOptions = {},
): SelectorQuestion | null {
  if (questions.length === 0) return null;

  const now = opts.now ?? new Date();
  const random = opts.random ?? Math.random;

  const unseen = questions.filter((q) => q.mastery === null);
  if (unseen.length > 0) {
    return unseen[Math.floor(random() * unseen.length)];
  }

  const scored = questions
    .map((q) => ({ q, score: scoreQuestion(q, now) }))
    .filter((x) => x.score > 0);

  if (scored.length === 0) return null;

  const maxScore = Math.max(...scored.map((x) => x.score));
  const top = scored.filter((x) => x.score >= maxScore * 0.999);
  return top[Math.floor(random() * top.length)].q;
}
