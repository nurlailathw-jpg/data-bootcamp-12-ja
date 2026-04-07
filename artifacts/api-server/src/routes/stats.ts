import { Router, type IRouter } from "express";
import { sql, desc } from "drizzle-orm";
import { db, frameworksTable, templatesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [frameworkCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(frameworksTable);

  const [templateCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(templatesTable);

  const [starSum] = await db
    .select({ total: sql<number>`coalesce(sum(${frameworksTable.stars}), 0)` })
    .from(frameworksTable);

  const categoryRows = await db
    .select({
      category: frameworksTable.category,
      count: sql<number>`count(*)`,
    })
    .from(frameworksTable)
    .groupBy(frameworksTable.category)
    .orderBy(desc(sql<number>`count(*)`));

  const totalCategories = categoryRows.length;
  const mostPopularCategory = categoryRows[0]?.category ?? "None";

  res.json({
    totalFrameworks: Number(frameworkCount?.count ?? 0),
    totalTemplates: Number(templateCount?.count ?? 0),
    totalStars: Number(starSum?.total ?? 0),
    totalCategories,
    mostPopularCategory,
  });
});

router.get("/stats/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: frameworksTable.category,
      count: sql<number>`count(*)`,
      totalStars: sql<number>`coalesce(sum(${frameworksTable.stars}), 0)`,
    })
    .from(frameworksTable)
    .groupBy(frameworksTable.category)
    .orderBy(desc(sql<number>`count(*)`));

  res.json(rows.map((r) => ({
    category: r.category,
    count: Number(r.count),
    totalStars: Number(r.totalStars),
  })));
});

router.get("/stats/trending", async (_req, res): Promise<void> => {
  const frameworks = await db
    .select()
    .from(frameworksTable)
    .orderBy(desc(frameworksTable.stars))
    .limit(6);

  res.json(frameworks.map((f) => ({
    ...f,
    githubUrl: f.githubUrl ?? undefined,
    pypiUrl: f.pypiUrl ?? undefined,
    officialUrl: f.officialUrl ?? undefined,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  })));
});

export default router;
