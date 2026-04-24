import { ReviewView } from "./review-view";
import { ReviewClient } from "./review-client";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const LIMIT = 20;

export default async function ReviewPage() {
  if (process.env.NEXT_PUBLIC_STORAGE === "localstorage") {
    return <ReviewClient />;
  }

  const items = await storage.getRecentMistakes(LIMIT);
  return <ReviewView items={items} />;
}
