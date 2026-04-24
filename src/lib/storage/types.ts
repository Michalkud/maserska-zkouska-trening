export type QuestionKind = "mc" | "open";

export const HISTORY_DAYS = 30;

export interface Topic {
  id: string;
  nameCs: string;
  weight: number;
}

export interface MasteryState {
  ease: number;
  interval: number;
  repetitions: number;
  dueAt: Date;
}

export interface QuestionWithContext {
  id: string;
  topicId: string;
  topic: Topic;
  kind: QuestionKind;
  stemCs: string;
  choices: string[] | null;
  correctAnswer: string;
  explanationCs: string;
  sourceRef: string;
  mastery: MasteryState | null;
}

export interface TopicSummary {
  id: string;
  nameCs: string;
  weight: number;
  total: number;
  seen: number;
  masteryPct: number;
  due: number;
  history: (number | null)[];
}

export interface MistakeEntry {
  id: string;
  answeredAt: Date;
  questionId: string;
  stemCs: string;
  correctAnswer: string;
  explanationCs: string;
  topicNameCs: string;
}

export interface RecentAttemptWithTopic {
  answeredAt: Date;
  correct: boolean;
  topicNameCs: string;
}

export interface AttemptInput {
  questionId: string;
  grade: number;
  responseTimeMs: number;
}

export interface AttemptOutcome {
  dueAt: Date;
}

export interface AggregateCounts {
  totalQuestions: number;
  totalDue: number;
}

export interface FlagInput {
  questionId: string;
  reason?: string;
}

export interface Storage {
  listTopics(): Promise<Topic[]>;
  listQuestions(opts?: { topicId?: string }): Promise<QuestionWithContext[]>;
  getNextDueQuestion(opts?: {
    topicId?: string;
  }): Promise<QuestionWithContext | null>;
  recordAttempt(input: AttemptInput): Promise<AttemptOutcome>;
  getMasteryByTopic(opts?: {
    historyDays?: number;
  }): Promise<TopicSummary[]>;
  getRecentMistakes(limit: number): Promise<MistakeEntry[]>;
  getStreakDays(): Promise<number>;
  getAggregateCounts(opts?: { topicId?: string }): Promise<AggregateCounts>;
  getRecentAttempts(opts: {
    sinceMs: number;
    limit?: number;
  }): Promise<RecentAttemptWithTopic[]>;
  flagQuestion(input: FlagInput): Promise<void>;
}
