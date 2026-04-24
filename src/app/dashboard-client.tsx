"use client";

import { useEffect, useState } from "react";
import { DashboardView } from "./dashboard-view";
import { localStorageStorage } from "@/lib/storage/localstorage";
import { HISTORY_DAYS } from "@/lib/storage/types";
import type { AggregateCounts, TopicSummary } from "@/lib/storage/types";

type State = {
  topics: TopicSummary[];
  streak: number;
  counts: AggregateCounts;
};

export function DashboardClient() {
  const [data, setData] = useState<State | null>(null);

  useEffect(() => {
    Promise.all([
      localStorageStorage.getMasteryByTopic({ historyDays: HISTORY_DAYS }),
      localStorageStorage.getStreakDays(),
      localStorageStorage.getAggregateCounts(),
    ]).then(([topics, streak, counts]) => {
      setData({ topics, streak, counts });
    });
  }, []);

  if (!data) return null;

  return (
    <DashboardView
      topics={data.topics}
      streak={data.streak}
      counts={data.counts}
    />
  );
}
