import { headers } from "next/headers";
import { ReviewView } from "./review-view";
import { ReviewClient } from "./review-client";
import { storage } from "@/lib/storage";

const LIMIT = 20;

export default async function ReviewPage() {
  if (process.env.NEXT_PUBLIC_STORAGE === "localstorage") {
    return <ReviewClient />;
  }

  await headers();
  const items = await storage.getRecentMistakes(LIMIT);
  return <ReviewView items={items} />;
}
