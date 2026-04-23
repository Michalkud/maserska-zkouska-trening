import { describe, expect, it } from "vitest";
import {
  DEFAULT_EASE,
  MIN_EASE,
  gradeFromCorrect,
  initialState,
  review,
} from "./sm2";

const now = new Date("2026-04-23T10:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("review", () => {
  it("first successful review sets interval=1 and reps=1", () => {
    const r = review(initialState(), 5, now);
    expect(r.repetitions).toBe(1);
    expect(r.interval).toBe(1);
    expect(r.dueAt.getTime() - now.getTime()).toBe(DAY_MS);
  });

  it("second successful review sets interval=6", () => {
    const r = review({ ease: DEFAULT_EASE, interval: 1, repetitions: 1 }, 4, now);
    expect(r.repetitions).toBe(2);
    expect(r.interval).toBe(6);
    expect(r.dueAt.getTime() - now.getTime()).toBe(6 * DAY_MS);
  });

  it("third+ successful review multiplies interval by ease", () => {
    const state = { ease: 2.5, interval: 6, repetitions: 2 };
    const r = review(state, 4, now);
    expect(r.repetitions).toBe(3);
    expect(r.interval).toBe(Math.round(6 * r.ease));
  });

  it("failing grade (<3) resets repetitions and interval to 1", () => {
    const state = { ease: 2.4, interval: 20, repetitions: 5 };
    const r = review(state, 1, now);
    expect(r.repetitions).toBe(0);
    expect(r.interval).toBe(1);
    expect(r.dueAt.getTime() - now.getTime()).toBe(DAY_MS);
  });

  it("grade 5 leaves ease unchanged (delta=+0.1-0)", () => {
    const r = review({ ease: 2.5, interval: 6, repetitions: 2 }, 5, now);
    expect(r.ease).toBeCloseTo(2.6, 10);
  });

  it("grade 3 decreases ease", () => {
    const r = review({ ease: 2.5, interval: 1, repetitions: 1 }, 3, now);
    expect(r.ease).toBeLessThan(2.5);
  });

  it("grade 0 drives ease toward the 1.3 floor", () => {
    let state = initialState();
    for (let i = 0; i < 20; i++) {
      state = review(state, 0, now);
    }
    expect(state.ease).toBe(MIN_EASE);
  });

  it("ease never drops below 1.3", () => {
    const r = review({ ease: 1.35, interval: 1, repetitions: 1 }, 0, now);
    expect(r.ease).toBeGreaterThanOrEqual(MIN_EASE);
  });

  it("rejects non-integer grades", () => {
    expect(() => review(initialState(), 2.5, now)).toThrow();
  });

  it("rejects out-of-range grades", () => {
    expect(() => review(initialState(), 6, now)).toThrow();
    expect(() => review(initialState(), -1, now)).toThrow();
  });

  it("initialState matches defaults", () => {
    expect(initialState()).toEqual({ ease: 2.5, interval: 0, repetitions: 0 });
  });
});

describe("gradeFromCorrect", () => {
  it("fast correct is 5", () => {
    expect(gradeFromCorrect(true, 2000)).toBe(5);
  });

  it("medium correct is 4", () => {
    expect(gradeFromCorrect(true, 7000)).toBe(4);
  });

  it("slow correct is 3", () => {
    expect(gradeFromCorrect(true, 15_000)).toBe(3);
  });

  it("fast wrong is 2", () => {
    expect(gradeFromCorrect(false, 2000)).toBe(2);
  });

  it("slow wrong is 1", () => {
    expect(gradeFromCorrect(false, 15_000)).toBe(1);
  });
});
