export const SESSION_CAP = 20;
export const SESSION_GAP_MS = 15 * 60 * 1000;

export type SessionAttempt = {
  answeredAt: Date;
  correct: boolean;
  topicNameCs: string;
};

export type SessionStats = {
  count: number;
  correctCount: number;
  accuracy: number;
  topics: string[];
  latestAt: Date | null;
};

export function computeSessionStats(
  attempts: ReadonlyArray<SessionAttempt>,
  sinceExclusive: Date | null = null,
): SessionStats {
  const pool = sinceExclusive
    ? attempts.filter((a) => a.answeredAt > sinceExclusive)
    : attempts.slice();
  pool.sort((a, b) => b.answeredAt.getTime() - a.answeredAt.getTime());

  const session: SessionAttempt[] = [];
  let prev: number | null = null;
  for (const a of pool) {
    const t = a.answeredAt.getTime();
    if (prev !== null && prev - t > SESSION_GAP_MS) break;
    session.push(a);
    prev = t;
  }

  const correctCount = session.filter((s) => s.correct).length;
  const topicSet = new Set<string>();
  for (const s of session) topicSet.add(s.topicNameCs);

  return {
    count: session.length,
    correctCount,
    accuracy: session.length > 0 ? correctCount / session.length : 0,
    topics: [...topicSet],
    latestAt: session[0]?.answeredAt ?? null,
  };
}
