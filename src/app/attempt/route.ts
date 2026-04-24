import { NextResponse } from "next/server";
import { gradeFromCorrect } from "@/lib/sm2";
import { storage } from "@/lib/storage";

type McBody = {
  kind: "mc";
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  responseTimeMs: number;
};

type OpenBody = {
  kind: "open";
  questionId: string;
  selfGrade: number;
  responseTimeMs: number;
};

type Body = McBody | OpenBody;

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  let grade: number;
  if (body.kind === "open") {
    grade = body.selfGrade;
  } else {
    const correct = body.userAnswer.trim() === body.correctAnswer.trim();
    grade = gradeFromCorrect(correct, body.responseTimeMs);
  }

  const { dueAt } = await storage.recordAttempt({
    questionId: body.questionId,
    grade,
    responseTimeMs: body.responseTimeMs,
  });

  return NextResponse.json({ dueAt: dueAt.toISOString() });
}
