import { describe, expect, it } from "vitest";
import {
  pickNextQuestion,
  scoreQuestion,
  type SelectorQuestion,
} from "./selector";

const now = new Date("2026-04-23T10:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function seen(
  id: string,
  ease: number,
  dueDaysAgo: number,
  topicWeight = 1,
  topicId = "t1",
): SelectorQuestion {
  return {
    id,
    topicId,
    topicWeight,
    mastery: { ease, dueAt: new Date(now.getTime() - dueDaysAgo * DAY_MS) },
  };
}

function unseen(
  id: string,
  topicWeight = 1,
  topicId = "t1",
): SelectorQuestion {
  return { id, topicId, topicWeight, mastery: null };
}

describe("scoreQuestion", () => {
  it("returns +Infinity for unseen questions", () => {
    expect(scoreQuestion(unseen("u1"), now)).toBe(Number.POSITIVE_INFINITY);
  });

  it("returns 0 for questions not yet due", () => {
    const q: SelectorQuestion = {
      id: "q1",
      topicId: "t1",
      topicWeight: 1,
      mastery: { ease: 2.5, dueAt: new Date(now.getTime() + DAY_MS) },
    };
    expect(scoreQuestion(q, now)).toBe(0);
  });

  it("returns 0 exactly on dueAt", () => {
    const q: SelectorQuestion = {
      id: "q1",
      topicId: "t1",
      topicWeight: 1,
      mastery: { ease: 2.5, dueAt: now },
    };
    expect(scoreQuestion(q, now)).toBe(0);
  });

  it("default-ease card at 1 day overdue with weight 1 scores 1.0", () => {
    expect(scoreQuestion(seen("q", 2.5, 1, 1), now)).toBeCloseTo(1);
  });

  it("minimum-ease (1.3) card scores ≈1.92× a default-ease card at same overdue/weight", () => {
    const hard = scoreQuestion(seen("hard", 1.3, 2, 1), now);
    const easy = scoreQuestion(seen("easy", 2.5, 2, 1), now);
    expect(hard / easy).toBeCloseTo(2.5 / 1.3, 5);
  });

  it("scales linearly with daysOverdue", () => {
    const a = scoreQuestion(seen("a", 2.5, 1, 1), now);
    const b = scoreQuestion(seen("b", 2.5, 3, 1), now);
    expect(b / a).toBeCloseTo(3);
  });

  it("scales linearly with topic weight", () => {
    const a = scoreQuestion(seen("a", 2.5, 2, 1), now);
    const b = scoreQuestion(seen("b", 2.5, 2, 2), now);
    expect(b / a).toBeCloseTo(2);
  });
});

describe("pickNextQuestion — unseen-first fallback", () => {
  it("prefers an unseen question over a long-overdue seen one", () => {
    const picked = pickNextQuestion(
      [seen("s1", 1.3, 30, 2), unseen("u1")],
      { now, random: () => 0 },
    );
    expect(picked?.id).toBe("u1");
  });

  it("picks among multiple unseen questions using the random source", () => {
    const qs = [unseen("u1"), unseen("u2"), unseen("u3")];
    expect(pickNextQuestion(qs, { now, random: () => 0 })?.id).toBe("u1");
    expect(pickNextQuestion(qs, { now, random: () => 0.5 })?.id).toBe("u2");
    expect(pickNextQuestion(qs, { now, random: () => 0.99 })?.id).toBe("u3");
  });
});

describe("pickNextQuestion — scored selection", () => {
  it("returns null on empty list", () => {
    expect(pickNextQuestion([], { now })).toBeNull();
  });

  it("returns null when every seen question is up-to-date", () => {
    const q: SelectorQuestion = {
      id: "q1",
      topicId: "t1",
      topicWeight: 1,
      mastery: { ease: 2.5, dueAt: new Date(now.getTime() + DAY_MS) },
    };
    expect(pickNextQuestion([q], { now })).toBeNull();
  });

  it("picks the highest-scoring overdue question", () => {
    const picked = pickNextQuestion(
      [
        seen("low", 2.5, 1, 1),
        seen("mid", 2.0, 3, 1),
        seen("high", 1.3, 10, 2),
      ],
      { now, random: () => 0 },
    );
    expect(picked?.id).toBe("high");
  });
});

describe("pickNextQuestion — tie-breaking", () => {
  it("picks deterministically among identically-scored candidates via the random source", () => {
    const tied = [
      seen("a", 2.5, 2, 1),
      seen("b", 2.5, 2, 1),
      seen("c", 2.5, 2, 1),
    ];
    expect(pickNextQuestion(tied, { now, random: () => 0 })?.id).toBe("a");
    expect(pickNextQuestion(tied, { now, random: () => 0.5 })?.id).toBe("b");
    expect(pickNextQuestion(tied, { now, random: () => 0.99 })?.id).toBe("c");
  });

  it("distributes picks across tied candidates over many trials (no streak lock-in)", () => {
    const tied = [seen("a", 2.5, 2, 1), seen("b", 2.5, 2, 1)];
    const hits: Record<string, number> = { a: 0, b: 0 };
    for (let i = 0; i < 1000; i++) {
      const p = pickNextQuestion(tied, { now });
      hits[p!.id] += 1;
    }
    expect(hits.a).toBeGreaterThan(350);
    expect(hits.b).toBeGreaterThan(350);
  });

  it("treats scores within 0.1% of the max as tied", () => {
    const tied = [
      seen("a", 2.5, 10, 1),
      seen("b", 2.5, 10.005, 1),
    ];
    const hits: Record<string, number> = { a: 0, b: 0 };
    for (let i = 0; i < 400; i++) {
      hits[pickNextQuestion(tied, { now })!.id] += 1;
    }
    expect(hits.a).toBeGreaterThan(50);
    expect(hits.b).toBeGreaterThan(50);
  });
});
