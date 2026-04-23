import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { gradeFromCorrect, initialState, review } from "@/lib/sm2";

type Body = {
  questionId: string;
  userAnswer: string;
  responseTimeMs: number;
  selfGrade?: number;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const { questionId, userAnswer, responseTimeMs, selfGrade } = body;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { mastery: true },
  });
  if (!question) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let correct: boolean;
  let grade: number;
  if (question.kind === "open") {
    if (typeof selfGrade !== "number") {
      return NextResponse.json(
        { error: "selfGrade required for open questions" },
        { status: 400 },
      );
    }
    grade = selfGrade;
    correct = selfGrade >= 3;
  } else {
    correct = userAnswer.trim() === question.correctAnswer.trim();
    grade = gradeFromCorrect(correct, responseTimeMs);
  }

  const state = question.mastery
    ? {
        ease: question.mastery.ease,
        interval: question.mastery.interval,
        repetitions: question.mastery.repetitions,
      }
    : initialState();
  const next = review(state, grade);

  await prisma.$transaction([
    prisma.attempt.create({
      data: {
        questionId,
        correct,
        responseTimeMs,
        grade,
      },
    }),
    prisma.masteryScore.upsert({
      where: { questionId },
      create: {
        questionId,
        ease: next.ease,
        interval: next.interval,
        repetitions: next.repetitions,
        dueAt: next.dueAt,
      },
      update: {
        ease: next.ease,
        interval: next.interval,
        repetitions: next.repetitions,
        dueAt: next.dueAt,
      },
    }),
  ]);

  return NextResponse.json({
    correct,
    grade,
    correctAnswer: question.correctAnswer,
    explanationCs: question.explanationCs,
    dueAt: next.dueAt.toISOString(),
  });
}
