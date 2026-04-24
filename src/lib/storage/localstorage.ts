import { questions as rawQuestions, topics as rawTopics } from "@/data/question-bank";
import { pickNextQuestion, type SelectorQuestion } from "@/lib/selector";
import { initialState, review } from "@/lib/sm2";
import { calculateStreak } from "@/lib/streak";
import {
  AggregateCounts,
  AttemptInput,
  AttemptOutcome,
  FlagInput,
  HISTORY_DAYS,
  MasteryState,
  MistakeEntry,
  QuestionWithContext,
  RecentAttemptWithTopic,
  Storage,
  Topic,
  TopicSummary,
} from "./types";

const DAY_MS = 86_400_000;
const ATTEMPTS_KEY = "mz.attempts";
const MASTERY_KEY = "mz.mastery";
const FLAGS_KEY = "mz.flags";

type StoredAttempt = {
  questionId: string;
  at: string;
  grade: number;
  responseTimeMs: number;
};

type StoredMasteryRec = {
  ease: number;
  interval: number;
  repetitions: number;
  dueAt: string;
};

type StoredMastery = Record<string, StoredMasteryRec>;

type StoredFlag = {
  questionId: string;
  reason?: string;
  at: string;
};

type StaticQuestion = Omit<QuestionWithContext, "mastery">;

const topicById: Map<string, Topic> = new Map(
  rawTopics.map((t) => [t.slug, { id: t.slug, nameCs: t.nameCs, weight: t.weight }]),
);

const topicCounters = new Map<string, number>();
const staticQuestions: StaticQuestion[] = rawQuestions.map((q) => {
  const idx = topicCounters.get(q.topicSlug) ?? 0;
  topicCounters.set(q.topicSlug, idx + 1);
  const topic = topicById.get(q.topicSlug);
  if (!topic) throw new Error(`Unknown topicSlug in question-bank: ${q.topicSlug}`);
  return {
    id: `${q.topicSlug}-q${idx}`,
    topicId: q.topicSlug,
    topic,
    kind: q.kind,
    stemCs: q.stemCs,
    choices: q.choices ?? null,
    correctAnswer: q.correctAnswer,
    explanationCs: q.explanationCs,
    sourceRef: q.sourceRef,
  };
});

const questionById = new Map(staticQuestions.map((q) => [q.id, q]));

function endOfTodayLocal(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfTodayLocal(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

function normalizeEase(ease: number): number {
  return Math.max(0, Math.min(1, (ease - 1.3) / (3.0 - 1.3)));
}

function ls(): globalThis.Storage {
  if (typeof localStorage === "undefined") {
    throw new Error("localStorage is not available in this environment");
  }
  return localStorage;
}

function readAttempts(): StoredAttempt[] {
  const raw = ls().getItem(ATTEMPTS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as StoredAttempt[];
}

function writeAttempts(a: StoredAttempt[]): void {
  ls().setItem(ATTEMPTS_KEY, JSON.stringify(a));
}

function readMastery(): StoredMastery {
  const raw = ls().getItem(MASTERY_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as StoredMastery;
}

function writeMastery(m: StoredMastery): void {
  ls().setItem(MASTERY_KEY, JSON.stringify(m));
}

function masteryStateFor(questionId: string, mastery: StoredMastery): MasteryState | null {
  const rec = mastery[questionId];
  if (!rec) return null;
  return {
    ease: rec.ease,
    interval: rec.interval,
    repetitions: rec.repetitions,
    dueAt: new Date(rec.dueAt),
  };
}

export const localStorageStorage: Storage = {
  async listTopics(): Promise<Topic[]> {
    return rawTopics.map((t) => ({ id: t.slug, nameCs: t.nameCs, weight: t.weight }));
  },

  async listQuestions(opts): Promise<QuestionWithContext[]> {
    const mastery = readMastery();
    return staticQuestions
      .filter((q) => !opts?.topicId || q.topicId === opts.topicId)
      .map((q) => ({ ...q, mastery: masteryStateFor(q.id, mastery) }));
  },

  async getNextDueQuestion(opts): Promise<QuestionWithContext | null> {
    const qs = await this.listQuestions(opts);
    if (qs.length === 0) return null;
    const candidates: SelectorQuestion[] = qs.map((q) => ({
      id: q.id,
      topicId: q.topicId,
      topicWeight: q.topic.weight,
      mastery: q.mastery ? { ease: q.mastery.ease, dueAt: q.mastery.dueAt } : null,
    }));
    const picked = pickNextQuestion(candidates);
    if (!picked) return null;
    return qs.find((q) => q.id === picked.id) ?? null;
  },

  async recordAttempt(input: AttemptInput): Promise<AttemptOutcome> {
    const mastery = readMastery();
    const rec = mastery[input.questionId];
    const state = rec
      ? { ease: rec.ease, interval: rec.interval, repetitions: rec.repetitions }
      : initialState();
    const next = review(state, input.grade);
    mastery[input.questionId] = {
      ease: next.ease,
      interval: next.interval,
      repetitions: next.repetitions,
      dueAt: next.dueAt.toISOString(),
    };
    writeMastery(mastery);

    const attempts = readAttempts();
    attempts.push({
      questionId: input.questionId,
      at: new Date().toISOString(),
      grade: input.grade,
      responseTimeMs: input.responseTimeMs,
    });
    writeAttempts(attempts);

    return { dueAt: next.dueAt };
  },

  async getMasteryByTopic(opts): Promise<TopicSummary[]> {
    const days = opts?.historyDays ?? HISTORY_DAYS;
    const endOfToday = endOfTodayLocal();
    const startDay = new Date(endOfToday.getTime() - (days - 1) * DAY_MS);
    startDay.setHours(0, 0, 0, 0);

    const mastery = readMastery();
    const attempts = readAttempts();

    const buckets = new Map<string, { sum: number; count: number }[]>();
    for (const a of attempts) {
      const q = questionById.get(a.questionId);
      if (!q) continue;
      const at = new Date(a.at);
      if (at.getTime() < startDay.getTime()) continue;
      const dayStart = new Date(at);
      dayStart.setHours(0, 0, 0, 0);
      const idx = Math.floor((dayStart.getTime() - startDay.getTime()) / DAY_MS);
      if (idx < 0 || idx >= days) continue;
      let arr = buckets.get(q.topicId);
      if (!arr) {
        arr = Array.from({ length: days }, () => ({ sum: 0, count: 0 }));
        buckets.set(q.topicId, arr);
      }
      arr[idx].sum += a.grade;
      arr[idx].count += 1;
    }

    return rawTopics.map((t) => {
      const qs = staticQuestions.filter((q) => q.topicId === t.slug);
      const total = qs.length;
      let seen = 0;
      let masterySum = 0;
      let due = 0;
      for (const q of qs) {
        const rec = mastery[q.id];
        if (rec) {
          seen += 1;
          masterySum += normalizeEase(rec.ease);
          if (new Date(rec.dueAt) <= endOfToday) due += 1;
        } else {
          due += 1;
        }
      }
      const masteryPct = total > 0 ? (masterySum / total) * 100 : 0;
      const arr = buckets.get(t.slug);
      const history = arr
        ? arr.map((b) => (b.count === 0 ? null : b.sum / b.count))
        : (Array.from({ length: days }, () => null) as (number | null)[]);
      return {
        id: t.slug,
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
    const attempts = readAttempts()
      .filter((a) => a.grade < 3)
      .sort((a, b) => (a.at < b.at ? 1 : -1));
    const seen = new Set<string>();
    const out: MistakeEntry[] = [];
    for (const a of attempts) {
      if (seen.has(a.questionId)) continue;
      const q = questionById.get(a.questionId);
      if (!q) continue;
      seen.add(a.questionId);
      out.push({
        id: `${a.questionId}@${a.at}`,
        answeredAt: new Date(a.at),
        questionId: a.questionId,
        stemCs: q.stemCs,
        correctAnswer: q.correctAnswer,
        explanationCs: q.explanationCs,
        topicNameCs: q.topic.nameCs,
      });
      if (out.length >= limit) break;
    }
    return out;
  },

  async getStreakDays(): Promise<number> {
    const attempts = readAttempts().map((a) => new Date(a.at));
    return calculateStreak(attempts);
  },

  async getAggregateCounts(opts): Promise<AggregateCounts> {
    const mastery = readMastery();
    const endOfToday = endOfTodayLocal();
    const startOfToday = startOfTodayLocal();
    const qs = staticQuestions.filter((q) => !opts?.topicId || q.topicId === opts.topicId);
    const totalQuestions = qs.length;
    const totalDue = qs.filter((q) => {
      const rec = mastery[q.id];
      return !rec || new Date(rec.dueAt) <= endOfToday;
    }).length;
    const todayAttempts = readAttempts().filter(
      (a) => new Date(a.at) >= startOfToday,
    ).length;
    return { totalQuestions, totalDue, todayAttempts };
  },

  async getRecentAttempts(opts): Promise<RecentAttemptWithTopic[]> {
    const cutoff = Date.now() - opts.sinceMs;
    const limit = opts.limit ?? 120;
    return readAttempts()
      .filter((a) => new Date(a.at).getTime() >= cutoff)
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, limit)
      .map((a) => {
        const q = questionById.get(a.questionId);
        return {
          answeredAt: new Date(a.at),
          correct: a.grade >= 3,
          topicNameCs: q ? q.topic.nameCs : "",
        };
      });
  },

  async flagQuestion(input: FlagInput): Promise<void> {
    const raw = ls().getItem(FLAGS_KEY);
    const flags = raw ? (JSON.parse(raw) as StoredFlag[]) : [];
    flags.push({
      questionId: input.questionId,
      reason: input.reason?.trim() || undefined,
      at: new Date().toISOString(),
    });
    ls().setItem(FLAGS_KEY, JSON.stringify(flags));
  },
};
