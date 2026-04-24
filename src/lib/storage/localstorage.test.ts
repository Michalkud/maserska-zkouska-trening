import { beforeEach, describe, expect, it } from "vitest";
import { localStorageStorage } from "./localstorage";
import { questions as rawQuestions, topics as rawTopics } from "@/data/question-bank";
import { HISTORY_DAYS } from "./types";

beforeEach(() => {
  localStorage.clear();
});

describe("localStorageStorage", () => {
  it("listTopics returns the static bank's topics", async () => {
    const topics = await localStorageStorage.listTopics();
    expect(topics).toHaveLength(rawTopics.length);
    expect(topics.every((t) => typeof t.id === "string" && t.id.length > 0)).toBe(true);
    expect(topics[0]).toMatchObject({ id: rawTopics[0].slug, nameCs: rawTopics[0].nameCs });
  });

  it("listQuestions filters by topicId and attaches null mastery for unseen", async () => {
    const topicId = "anatomie";
    const all = await localStorageStorage.listQuestions();
    const filtered = await localStorageStorage.listQuestions({ topicId });
    expect(all.length).toBe(rawQuestions.length);
    expect(filtered.every((q) => q.topicId === topicId)).toBe(true);
    expect(filtered.every((q) => q.mastery === null)).toBe(true);
  });

  it("getAggregateCounts reports all questions as due on a fresh store", async () => {
    const counts = await localStorageStorage.getAggregateCounts();
    expect(counts.totalQuestions).toBe(rawQuestions.length);
    expect(counts.totalDue).toBe(rawQuestions.length);
  });

  it("recordAttempt persists to localStorage under the spec'd keys", async () => {
    const q = (await localStorageStorage.listQuestions())[0];
    await localStorageStorage.recordAttempt({
      questionId: q.id,
      grade: 5,
      responseTimeMs: 3000,
    });

    const attempts = JSON.parse(localStorage.getItem("mz.attempts")!);
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      questionId: q.id,
      grade: 5,
      responseTimeMs: 3000,
    });
    expect(typeof attempts[0].at).toBe("string");

    const mastery = JSON.parse(localStorage.getItem("mz.mastery")!);
    expect(mastery[q.id]).toBeDefined();
    expect(mastery[q.id].repetitions).toBe(1);
    expect(typeof mastery[q.id].dueAt).toBe("string");
  });

  it("recordAttempt advances SM-2 state across multiple passes", async () => {
    const q = (await localStorageStorage.listQuestions())[0];
    await localStorageStorage.recordAttempt({ questionId: q.id, grade: 5, responseTimeMs: 2000 });
    await localStorageStorage.recordAttempt({ questionId: q.id, grade: 4, responseTimeMs: 6000 });

    const mastery = JSON.parse(localStorage.getItem("mz.mastery")!);
    expect(mastery[q.id].repetitions).toBe(2);
    expect(mastery[q.id].interval).toBe(6);
  });

  it("getNextDueQuestion returns an unseen question when the bank is fresh", async () => {
    const picked = await localStorageStorage.getNextDueQuestion();
    expect(picked).not.toBeNull();
    expect(picked!.mastery).toBeNull();
  });

  it("getNextDueQuestion respects topicId scoping", async () => {
    const topicId = "hygiena-a-dezinfekce";
    const picked = await localStorageStorage.getNextDueQuestion({ topicId });
    expect(picked).not.toBeNull();
    expect(picked!.topicId).toBe(topicId);
  });

  it("getRecentMistakes returns only grade<3 attempts, deduped by questionId, latest first", async () => {
    const qs = await localStorageStorage.listQuestions();
    await localStorageStorage.recordAttempt({ questionId: qs[0].id, grade: 5, responseTimeMs: 2000 });
    await localStorageStorage.recordAttempt({ questionId: qs[1].id, grade: 1, responseTimeMs: 4000 });
    await new Promise((r) => setTimeout(r, 5));
    await localStorageStorage.recordAttempt({ questionId: qs[2].id, grade: 2, responseTimeMs: 8000 });
    await new Promise((r) => setTimeout(r, 5));
    await localStorageStorage.recordAttempt({ questionId: qs[1].id, grade: 2, responseTimeMs: 9000 });

    const mistakes = await localStorageStorage.getRecentMistakes(10);
    expect(mistakes.map((m) => m.questionId)).toEqual([qs[1].id, qs[2].id]);
    expect(mistakes[0].stemCs).toBe(qs[1].stemCs);
    expect(mistakes[0].correctAnswer).toBe(qs[1].correctAnswer);
  });

  it("getStreakDays returns 1 after one attempt today, 0 on a fresh store", async () => {
    expect(await localStorageStorage.getStreakDays()).toBe(0);
    const q = (await localStorageStorage.listQuestions())[0];
    await localStorageStorage.recordAttempt({ questionId: q.id, grade: 5, responseTimeMs: 2000 });
    expect(await localStorageStorage.getStreakDays()).toBe(1);
  });

  it("getMasteryByTopic reflects recorded attempts in the history bucket", async () => {
    const topicId = "anatomie";
    const qs = (await localStorageStorage.listQuestions({ topicId })).slice(0, 2);
    await localStorageStorage.recordAttempt({ questionId: qs[0].id, grade: 5, responseTimeMs: 2000 });
    await localStorageStorage.recordAttempt({ questionId: qs[1].id, grade: 3, responseTimeMs: 12000 });

    const summary = await localStorageStorage.getMasteryByTopic();
    const anatomy = summary.find((t) => t.id === topicId)!;
    expect(anatomy.seen).toBe(2);
    expect(anatomy.masteryPct).toBeGreaterThan(0);
    expect(anatomy.history).toHaveLength(HISTORY_DAYS);
    const filled = anatomy.history.filter((v) => v !== null);
    expect(filled).toHaveLength(1);
    expect(filled[0]).toBeCloseTo(4);
  });

  it("getRecentAttempts filters by time window and attaches topic name", async () => {
    const q = (await localStorageStorage.listQuestions())[0];
    await localStorageStorage.recordAttempt({ questionId: q.id, grade: 4, responseTimeMs: 5000 });

    const recent = await localStorageStorage.getRecentAttempts({ sinceMs: 60_000 });
    expect(recent).toHaveLength(1);
    expect(recent[0].correct).toBe(true);
    expect(recent[0].topicNameCs).toBe(q.topic.nameCs);

    const stale = await localStorageStorage.getRecentAttempts({ sinceMs: 0 });
    expect(stale).toHaveLength(0);
  });

  it("getAggregateCounts drops the due count after a passing attempt on the only-due card of a scope", async () => {
    const topicId = "anatomie";
    const qs = await localStorageStorage.listQuestions({ topicId });
    for (const q of qs) {
      await localStorageStorage.recordAttempt({ questionId: q.id, grade: 5, responseTimeMs: 2000 });
    }
    const after = await localStorageStorage.getAggregateCounts({ topicId });
    expect(after.totalQuestions).toBe(qs.length);
    expect(after.totalDue).toBe(0);
  });
});
