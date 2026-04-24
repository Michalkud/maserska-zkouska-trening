import {
  SESSION_CAP,
  SESSION_GAP_MS,
  computeSessionStats,
} from "@/lib/session";
import { storage } from "@/lib/storage";
import { QuizClient } from "./quiz-client";
import { QuizView } from "./quiz-view";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string | string[]; since?: string | string[] }>;
}) {
  if (process.env.NEXT_PUBLIC_STORAGE === "localstorage") {
    return <QuizClient />;
  }

  const params = await searchParams;
  const topicParam = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const sinceParam = Array.isArray(params.since) ? params.since[0] : params.since;
  const sinceParsed = sinceParam ? new Date(sinceParam) : null;
  const since = sinceParsed && !Number.isNaN(sinceParsed.getTime()) ? sinceParsed : null;

  const allTopics = await storage.listTopics();
  const scopedTopic = topicParam
    ? allTopics.find((t) => t.id === topicParam) ?? null
    : null;
  const scopeId = scopedTopic?.id;

  const [picked, counts, recentAttempts] = await Promise.all([
    storage.getNextDueQuestion(scopeId ? { topicId: scopeId } : undefined),
    storage.getAggregateCounts(scopeId ? { topicId: scopeId } : undefined),
    storage.getRecentAttempts({ sinceMs: 4 * SESSION_GAP_MS }),
  ]);

  const session = computeSessionStats(recentAttempts, since);
  const now = new Date();
  const atCap = session.count >= SESSION_CAP;
  const exhausted = !picked;

  let nextDueAt: Date | undefined;
  if ((atCap || exhausted) && session.count > 0 && exhausted) {
    const scopedQuestions = await storage.listQuestions(
      scopeId ? { topicId: scopeId } : undefined,
    );
    nextDueAt = scopedQuestions
      .map((q) => q.mastery?.dueAt)
      .filter((d): d is Date => !!d && d.getTime() > now.getTime())
      .sort((a, b) => a.getTime() - b.getTime())[0];
  }

  return (
    <QuizView
      data={{
        scopedTopic,
        picked,
        counts,
        session,
        nextDueAt,
        now,
        atCap,
        exhausted,
      }}
    />
  );
}
