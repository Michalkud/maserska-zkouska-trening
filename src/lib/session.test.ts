import { describe, expect, it } from "vitest";
import {
  SESSION_GAP_MS,
  computeSessionStats,
  type SessionAttempt,
} from "./session";

function att(
  answeredAt: Date,
  correct: boolean,
  topicNameCs: string,
): SessionAttempt {
  return { answeredAt, correct, topicNameCs };
}

describe("computeSessionStats", () => {
  const t0 = new Date(2026, 3, 24, 12, 0, 0, 0);
  const mMs = 60 * 1000;

  it("returns zeroes for an empty input", () => {
    const s = computeSessionStats([]);
    expect(s.count).toBe(0);
    expect(s.correctCount).toBe(0);
    expect(s.accuracy).toBe(0);
    expect(s.topics).toEqual([]);
    expect(s.latestAt).toBeNull();
  });

  it("buckets attempts with gaps under 15 min into one session", () => {
    const attempts = [
      att(new Date(t0.getTime() - 0 * mMs), true, "A"),
      att(new Date(t0.getTime() - 5 * mMs), false, "A"),
      att(new Date(t0.getTime() - 12 * mMs), true, "B"),
    ];
    const s = computeSessionStats(attempts);
    expect(s.count).toBe(3);
    expect(s.correctCount).toBe(2);
    expect(s.accuracy).toBeCloseTo(2 / 3);
    expect(new Set(s.topics)).toEqual(new Set(["A", "B"]));
    expect(s.latestAt).toEqual(attempts[0].answeredAt);
  });

  it("stops the session at a gap larger than SESSION_GAP_MS", () => {
    const attempts = [
      att(new Date(t0.getTime() - 0 * mMs), true, "A"),
      att(new Date(t0.getTime() - 5 * mMs), true, "A"),
      att(new Date(t0.getTime() - SESSION_GAP_MS - 10 * mMs), true, "B"),
    ];
    const s = computeSessionStats(attempts);
    expect(s.count).toBe(2);
    expect(s.topics).toEqual(["A"]);
  });

  it("filters out attempts at or before sinceExclusive", () => {
    const attempts = [
      att(new Date(t0.getTime() - 0 * mMs), true, "A"),
      att(new Date(t0.getTime() - 2 * mMs), true, "A"),
      att(new Date(t0.getTime() - 5 * mMs), false, "B"),
    ];
    const cutoff = new Date(t0.getTime() - 3 * mMs);
    const s = computeSessionStats(attempts, cutoff);
    expect(s.count).toBe(2);
    expect(s.correctCount).toBe(2);
    expect(s.topics).toEqual(["A"]);
  });

  it("treats unsorted input as sorted by descending answeredAt", () => {
    const attempts = [
      att(new Date(t0.getTime() - 10 * mMs), false, "A"),
      att(new Date(t0.getTime() - 0 * mMs), true, "B"),
      att(new Date(t0.getTime() - 5 * mMs), true, "A"),
    ];
    const s = computeSessionStats(attempts);
    expect(s.count).toBe(3);
    expect(s.latestAt).toEqual(new Date(t0.getTime() - 0 * mMs));
  });

  it("dedupes topic names", () => {
    const attempts = [
      att(new Date(t0.getTime() - 0 * mMs), true, "A"),
      att(new Date(t0.getTime() - 2 * mMs), true, "A"),
      att(new Date(t0.getTime() - 3 * mMs), true, "A"),
    ];
    const s = computeSessionStats(attempts);
    expect(s.topics).toEqual(["A"]);
  });
});
