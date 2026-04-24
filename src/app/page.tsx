import { headers } from "next/headers";
import { DashboardView } from "./dashboard-view";
import { DashboardClient } from "./dashboard-client";
import { storage, HISTORY_DAYS } from "@/lib/storage";

export default async function DashboardPage() {
  if (process.env.NEXT_PUBLIC_STORAGE === "localstorage") {
    return <DashboardClient />;
  }

  await headers();
  const [topics, streak, counts] = await Promise.all([
    storage.getMasteryByTopic({ historyDays: HISTORY_DAYS }),
    storage.getStreakDays(),
    storage.getAggregateCounts(),
  ]);

  return <DashboardView topics={topics} streak={streak} counts={counts} />;
}
