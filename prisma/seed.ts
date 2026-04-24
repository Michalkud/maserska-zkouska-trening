import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { topics, questions } from "../src/data/question-bank";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./data/app.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const t of topics) {
    await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { nameCs: t.nameCs, weight: t.weight },
      create: t,
    });
  }

  const topicRecords = await prisma.topic.findMany({
    where: { slug: { in: topics.map((t) => t.slug) } },
  });
  const topicIdBySlug: Record<string, string> = Object.fromEntries(
    topicRecords.map((t) => [t.slug, t.id]),
  );

  await prisma.question.deleteMany({
    where: { topicId: { in: Object.values(topicIdBySlug) } },
  });

  for (const q of questions) {
    await prisma.question.create({
      data: {
        topicId: topicIdBySlug[q.topicSlug],
        kind: q.kind,
        stemCs: q.stemCs,
        choices: q.choices ? JSON.stringify(q.choices) : null,
        correctAnswer: q.correctAnswer,
        explanationCs: q.explanationCs,
        sourceRef: q.sourceRef,
      },
    });
  }

  const counts = await prisma.question.groupBy({
    by: ["topicId"],
    _count: { _all: true },
  });
  const nameById = Object.fromEntries(topicRecords.map((t) => [t.id, t.nameCs]));
  for (const c of counts) {
    console.log(`${nameById[c.topicId]}: ${c._count._all} questions`);
  }
  console.log(`Total seeded: ${questions.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
