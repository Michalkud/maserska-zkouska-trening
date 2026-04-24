import { describe, expect, it } from "vitest";
import { calculateStreak } from "./streak";

function localDayAt(year: number, month: number, day: number, hour = 12): Date {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

describe("calculateStreak", () => {
  const now = localDayAt(2026, 4, 24, 10);

  it("returns 0 for a brand-new user with no attempts", () => {
    expect(calculateStreak([], now)).toBe(0);
  });

  it("returns 1 when there is a single attempt today", () => {
    const attempts = [localDayAt(2026, 4, 24, 9)];
    expect(calculateStreak(attempts, now)).toBe(1);
  });

  it("returns 3 for three consecutive days ending today", () => {
    const attempts = [
      localDayAt(2026, 4, 22),
      localDayAt(2026, 4, 23),
      localDayAt(2026, 4, 24),
    ];
    expect(calculateStreak(attempts, now)).toBe(3);
  });

  it("breaks at a missed day in the middle", () => {
    const attempts = [
      localDayAt(2026, 4, 20),
      localDayAt(2026, 4, 21),
      localDayAt(2026, 4, 23),
      localDayAt(2026, 4, 24),
    ];
    expect(calculateStreak(attempts, now)).toBe(2);
  });

  it("counts attempts straddling local midnight as two distinct days", () => {
    const attempts = [
      new Date(2026, 3, 23, 23, 59, 30, 0),
      new Date(2026, 3, 24, 0, 0, 30, 0),
    ];
    expect(calculateStreak(attempts, now)).toBe(2);
  });

  it("preserves streak from yesterday when today has no attempt yet", () => {
    const attempts = [
      localDayAt(2026, 4, 22),
      localDayAt(2026, 4, 23),
    ];
    expect(calculateStreak(attempts, now)).toBe(2);
  });

  it("returns 0 when the most recent attempt is two or more days ago", () => {
    const attempts = [
      localDayAt(2026, 4, 20),
      localDayAt(2026, 4, 21),
    ];
    expect(calculateStreak(attempts, now)).toBe(0);
  });

  it("dedupes multiple attempts within the same local day", () => {
    const attempts = [
      localDayAt(2026, 4, 24, 8),
      localDayAt(2026, 4, 24, 14),
      localDayAt(2026, 4, 24, 22),
      localDayAt(2026, 4, 23, 9),
    ];
    expect(calculateStreak(attempts, now)).toBe(2);
  });
});
