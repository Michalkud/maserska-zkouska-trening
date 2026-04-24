"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  SESSION_CAP,
  SESSION_GAP_MS,
  computeSessionStats,
} from "@/lib/session";
import { localStorageStorage } from "@/lib/storage/localstorage";
import { QuizView, type QuizViewData } from "./quiz-view";

export function QuizClient() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const sinceParam = searchParams.get("since");

  const [data, setData] = useState<QuizViewData | null>(null);

  const fetchData = useCallback(async (): Promise<QuizViewData> => {
    const sinceParsed = sinceParam ? new Date(sinceParam) : null;
    const since =
      sinceParsed && !Number.isNaN(sinceParsed.getTime()) ? sinceParsed : null;

    const allTopics = await localStorageStorage.listTopics();
    const scopedTopic = topicParam
      ? allTopics.find((t) => t.id === topicParam) ?? null
      : null;
    const scopeId = scopedTopic?.id;

    const [picked, counts, recentAttempts] = await Promise.all([
      localStorageStorage.getNextDueQuestion(
        scopeId ? { topicId: scopeId } : undefined,
      ),
      localStorageStorage.getAggregateCounts(
        scopeId ? { topicId: scopeId } : undefined,
      ),
      localStorageStorage.getRecentAttempts({ sinceMs: 4 * SESSION_GAP_MS }),
    ]);

    const session = computeSessionStats(recentAttempts, since);
    const now = new Date();
    const atCap = session.count >= SESSION_CAP;
    const exhausted = !picked;

    let nextDueAt: Date | undefined;
    if ((atCap || exhausted) && session.count > 0 && exhausted) {
      const scopedQuestions = await localStorageStorage.listQuestions(
        scopeId ? { topicId: scopeId } : undefined,
      );
      nextDueAt = scopedQuestions
        .map((q) => q.mastery?.dueAt)
        .filter((d): d is Date => !!d && d.getTime() > now.getTime())
        .sort((a, b) => a.getTime() - b.getTime())[0];
    }

    return {
      scopedTopic,
      picked,
      counts,
      session,
      nextDueAt,
      now,
      atCap,
      exhausted,
    };
  }, [topicParam, sinceParam]);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]);

  const onNext = useCallback(() => {
    fetchData().then(setData);
  }, [fetchData]);

  if (!data) return null;

  return <QuizView data={data} onNext={onNext} />;
}
