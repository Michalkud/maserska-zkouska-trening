"use client";

import { useEffect, useState } from "react";
import { ReviewView } from "./review-view";
import { localStorageStorage } from "@/lib/storage/localstorage";
import type { MistakeEntry } from "@/lib/storage/types";

const LIMIT = 20;

export function ReviewClient() {
  const [items, setItems] = useState<MistakeEntry[] | null>(null);

  useEffect(() => {
    localStorageStorage.getRecentMistakes(LIMIT).then(setItems);
  }, []);

  if (!items) return null;

  return <ReviewView items={items} />;
}
