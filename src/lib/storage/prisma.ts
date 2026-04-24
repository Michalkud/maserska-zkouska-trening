import { prisma } from "@/lib/db";
import { pickNextQuestion, type SelectorQuestion } from "@/lib/selector";
import { initialState, review } from "@/lib/sm2";
import { calculateStreak } from "@/lib/streak";
import {
  AggregateCounts,
  AttemptInput,
  AttemptOutcome,
  FlagInput,
  HISTORY_DAYS,
  MistakeEntry,
  QuestionKind,
  QuestionWithContext,
  RecentAttemptWithTopic,
  Storage,
  Topic,
  TopicSummary,
} from "./types";

const DAY_MS = 86_400_000;

function normalizeEase(ease: number): number {
  return Math.max(0, Math.min(1, (ease - 1.3) / (3.0 - 1.3)));
}

function endOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

type QuestionRow = Awaited<
  ReturnType<typeof prisma.question.findMany<{
    include: { topic: true; mastery: true };
  }>>
>[number];

function toQuestionWithContext(q: QuestionRow): QuestionWithContext {
  return {
    id: q.id,
    topicId: q.topicId,
    topic: { id: q.topic.id, nameCs: q.topic.nameCs, weight: q.topic.weight },
    kind: q.kind as QuestionKind,
    stemCs: q.stemCs,
    choices: q.choices ? (JSON.parse(q.choices) as string[]) : null,
    correctAnswer: q.correctAnswer,
    explanationCs: q.explanationCs,
    sourceRef: q.sourceRef,
    mastery: q.mastery
      ? {
          ease: q.mastery.ease,
          interval: q.mastery.interval,
          repetitions: q.mastery.repetitions,
          dueAt: q.mastery.dueAt,
        }
      : null,
  };
}

export const prismaStorage: Storage = {
  async listTopics(): Promise<Topic[]> {
    const topics = await prisma.topic.findMany({
      select: { id: true, nameCs: true, weight: true },
    });
    return topics;
  },

  async listQuestions(opts) {
    const rows = await prisma.question.findMany({
      where: opts?.topicId ? { topicId: opts.topicId } : undefined,
      include: { topic: true, mastery: true },
    });
    return rows.map(toQuestionWithContext);
  },

  async getNextDueQuestion(opts) {
    const rows = await prisma.question.findMany({
      where: opts?.topicId ? { topicId: opts.topicId } : undefined,
      include: { topic: true, mastery: true },
    });
    if (rows.length === 0) return null;
    const candidates: SelectorQuestion[] = rows.map((q) => ({
      id: q.id,
      topicId: q.topicId,
      topicWeight: q.topic.weight,
      mastery: q.mastery
        ? { ease: q.mastery.ease, dueAt: q.mastery.dueAt }
        : null,
    }));
    const picked = pickNextQuestion(candidates);
    if (!picked) return null;
    const full = rows.find((q) => q.id === picked.id)!;
    return toQuestionWithContext(full);
  },

  async recordAttempt(input: AttemptInput): Promise<AttemptOutcome> {
    const mastery = await prisma.masteryScore.findUnique({
      where: { questionId: input.questionId },
    });
    const state = mastery
      ? {
          ease: mastery.ease,
          interval: mastery.interval,
          repetitions: mastery.repetitions,
        }
      : initialState();
    const next = review(state, input.grade);
    const correct = input.grade >= 3;

    await prisma.$transaction([
      prisma.attempt.create({
        data: {
          questionId: input.questionId,
          correct,
          responseTimeMs: input.responseTimeMs,
          grade: input.grade,
        },
      }),
      prisma.masteryScore.upsert({
        where: { questionId: input.questionId },
        create: {
          questionId: input.questionId,
          ease: next.ease,
          interval: next.interval,
          repetitions: next.repetitions,
          dueAt: next.dueAt,
        },
        update: {
          ease: next.ease,
          interval: next.interval,
          repetitions: next.repetitions,
          dueAt: next.dueAt,
        },
      }),
    ]);

    return { dueAt: next.dueAt };
  },

  async getMasteryByTopic(opts): Promise<TopicSummary[]> {
    const days = opts?.historyDays ?? HISTORY_DAYS;
    const endOfToday = endOfTodayLocal();
    const startDay = new Date(endOfToday.getTime() - (days - 1) * DAY_MS);
    startDay.setHours(0, 0, 0, 0);

    const [topics, attempts] = await Promise.all([
      prisma.topic.findMany({
        include: { questions: { include: { mastery: true } } },
      }),
      prisma.attempt.findMany({
        where: { answeredAt: { gte: startDay } },
        select: {
          answeredAt: true,
          grade: true,
          question: { select: { topicId: true } },
        },
      }),
    ]);

    const buckets = new Map<string, { sum: number; count: number }[]>();
    for (const a of attempts) {
      const dayStart = new Date(a.answeredAt);
      dayStart.setHours(0, 0, 0, 0);
      const idx = Math.floor(
        (dayStart.getTime() - startDay.getTime()) / DAY_MS,
      );
      if (idx < 0 || idx >= days) continue;
      let arr = buckets.get(a.question.topicId);
      if (!arr) {
        arr = Array.from({ length: days }, () => ({ sum: 0, count: 0 }));
        buckets.set(a.question.topicId, arr);
      }
      arr[idx].sum += a.grade;
      arr[idx].count += 1;
    }

    return topics.map((t) => {
      const total = t.questions.length;
      const seen = t.questions.filter((q) => q.mastery).length;
      const masterySum = t.questions.reduce(
        (acc, q) => acc + (q.mastery ? normalizeEase(q.mastery.ease) : 0),
        0,
      );
      const masteryPct = total > 0 ? (masterySum / total) * 100 : 0;
      const due = t.questions.filter(
        (q) => !q.mastery || q.mastery.dueAt <= endOfToday,
      ).length;
      const arr = buckets.get(t.id);
      const history = arr
        ? arr.map((b) => (b.count === 0 ? null : b.sum / b.count))
        : (Array.from({ length: days }, () => null) as (number | null)[]);
      return {
        id: t.id,
        nameCs: t.nameCs,
        weight: t.weight,
        total,
        seen,
        masteryPct,
        due,
        history,
      };
    });
  },

  async getRecentMistakes(limit: number): Promise<MistakeEntry[]> {
    const misses = await prisma.attempt.findMany({
      where: { correct: false },
      orderBy: { answeredAt: "desc" },
      take: limit * 4,
      include: { question: { include: { topic: true } } },
    });

    const latest = new Map<string, MistakeEntry>();
    for (const m of misses) {
      if (!latest.has(m.questionId)) {
        latest.set(m.questionId, {
          id: m.id,
          answeredAt: m.answeredAt,
          questionId: m.questionId,
          stemCs: m.question.stemCs,
          correctAnswer: m.question.correctAnswer,
          explanationCs: m.question.explanationCs,
          topicNameCs: m.question.topic.nameCs,
        });
      }
      if (latest.size >= limit) break;
    }
    return Array.from(latest.values());
  },

  async getStreakDays(): Promise<number> {
    const attempts = await prisma.attempt.findMany({
      orderBy: { answeredAt: "desc" },
      select: { answeredAt: true },
    });
    return calculateStreak(attempts.map((a) => a.answeredAt));
  },

  async getAggregateCounts(opts): Promise<AggregateCounts> {
    const where = opts?.topicId ? { topicId: opts.topicId } : undefined;
    const endOfToday = endOfTodayLocal();
    const startOfToday = startOfTodayLocal();
    const [totalQuestions, questions, todayAttempts] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        select: { mastery: { select: { dueAt: true } } },
      }),
      prisma.attempt.count({ where: { answeredAt: { gte: startOfToday } } }),
    ]);
    const totalDue = questions.filter(
      (q) => !q.mastery || q.mastery.dueAt <= endOfToday,
    ).length;
    return { totalQuestions, totalDue, todayAttempts };
  },

  async getRecentAttempts(opts): Promise<RecentAttemptWithTopic[]> {
    const since = new Date(Date.now() - opts.sinceMs);
    const attempts = await prisma.attempt.findMany({
      where: { answeredAt: { gte: since } },
      orderBy: { answeredAt: "desc" },
      take: opts.limit ?? 120,
      select: {
        answeredAt: true,
        correct: true,
        question: { select: { topic: { select: { nameCs: true } } } },
      },
    });
    return attempts.map((a) => ({
      answeredAt: a.answeredAt,
      correct: a.correct,
      topicNameCs: a.question.topic.nameCs,
    }));
  },

  async flagQuestion(input: FlagInput): Promise<void> {
    await prisma.questionFlag.create({
      data: {
        questionId: input.questionId,
        reason: input.reason?.trim() ? input.reason.trim() : null,
      },
    });
  },
};
