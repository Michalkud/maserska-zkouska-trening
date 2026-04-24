import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

type Body = {
  questionId: string;
  reason?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  await storage.flagQuestion({
    questionId: body.questionId,
    reason: body.reason,
  });
  return NextResponse.json({ ok: true });
}
