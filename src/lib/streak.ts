function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function calculateStreak(
  attemptDates: ReadonlyArray<Date>,
  now: Date = new Date(),
): number {
  const daySet = new Set(attemptDates.map(localDayKey));
  const cursor = new Date(now);
  if (!daySet.has(localDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (daySet.has(localDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
