import { prisma } from "./db";

const DAY_MS = 86_400_000;
export const HISTORY_DAYS = 30;

export type DailyAvg = number | null;

export async function masteryHistoryByTopic(
  days = HISTORY_DAYS,
): Promise<Map<string, DailyAvg[]>> {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const startDay = new Date(endOfToday.getTime() - (days - 1) * DAY_MS);
  startDay.setHours(0, 0, 0, 0);

  const attempts = await prisma.attempt.findMany({
    where: { answeredAt: { gte: startDay } },
    select: {
      answeredAt: true,
      grade: true,
      question: { select: { topicId: true } },
    },
  });

  const buckets = new Map<string, { sum: number; count: number }[]>();
  for (const a of attempts) {
    const dayStart = new Date(a.answeredAt);
    dayStart.setHours(0, 0, 0, 0);
    const idx = Math.floor((dayStart.getTime() - startDay.getTime()) / DAY_MS);
    if (idx < 0 || idx >= days) continue;
    let arr = buckets.get(a.question.topicId);
    if (!arr) {
      arr = Array.from({ length: days }, () => ({ sum: 0, count: 0 }));
      buckets.set(a.question.topicId, arr);
    }
    arr[idx].sum += a.grade;
    arr[idx].count += 1;
  }

  const result = new Map<string, DailyAvg[]>();
  for (const [topicId, arr] of buckets) {
    result.set(
      topicId,
      arr.map((b) => (b.count === 0 ? null : b.sum / b.count)),
    );
  }
  return result;
}
