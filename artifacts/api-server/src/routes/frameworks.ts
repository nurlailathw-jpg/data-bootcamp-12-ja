import { Router, type IRouter } from "express";
import { eq, sql, ilike, and } from "drizzle-orm";
import { db, frameworksTable } from "@workspace/db";
import {
  ListFrameworksQueryParams,
  CreateFrameworkBody,
  GetFrameworkParams,
  UpdateFrameworkParams,
  UpdateFrameworkBody,
  DeleteFrameworkParams,
  StarFrameworkParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/frameworks", async (req, res): Promise<void> => {
  const parsed = ListFrameworksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_query", message: parsed.error.message });
    return;
  }

  const { category, search } = parsed.data;

  let query = db.select().from(frameworksTable).$dynamic();

  const conditions = [];
  if (category) {
    conditions.push(eq(frameworksTable.category, category));
  }
  if (search) {
    conditions.push(
      sql`(${ilike(frameworksTable.name, `%${search}%`)} OR ${ilike(frameworksTable.description, `%${search}%`)})`
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const frameworks = await query.orderBy(sql`${frameworksTable.stars} DESC`);

  const result = frameworks.map((f) => ({
    ...f,
    githubUrl: f.githubUrl ?? undefined,
    pypiUrl: f.pypiUrl ?? undefined,
    officialUrl: f.officialUrl ?? undefined,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  res.json(result);
});

router.post("/frameworks", async (req, res): Promise<void> => {
  const parsed = CreateFrameworkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", message: parsed.error.message });
    return;
  }

  const [framework] = await db.insert(frameworksTable).values({
    ...parsed.data,
    stars: 0,
    weeklyDownloads: 0,
  }).returning();

  res.status(201).json({
    ...framework,
    githubUrl: framework.githubUrl ?? undefined,
    pypiUrl: framework.pypiUrl ?? undefined,
    officialUrl: framework.officialUrl ?? undefined,
    createdAt: framework.createdAt.toISOString(),
    updatedAt: framework.updatedAt.toISOString(),
  });
});

router.get("/frameworks/:id", async (req, res): Promise<void> => {
  const params = GetFrameworkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "invalid_params", message: params.error.message });
    return;
  }

  const [framework] = await db.select().from(frameworksTable).where(eq(frameworksTable.id, params.data.id));

  if (!framework) {
    res.status(404).json({ error: "not_found", message: "Framework not found" });
    return;
  }

  res.json({
    ...framework,
    githubUrl: framework.githubUrl ?? undefined,
    pypiUrl: framework.pypiUrl ?? undefined,
    officialUrl: framework.officialUrl ?? undefined,
    createdAt: framework.createdAt.toISOString(),
    updatedAt: framework.updatedAt.toISOString(),
  });
});

router.put("/frameworks/:id", async (req, res): Promise<void> => {
  const params = UpdateFrameworkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "invalid_params", message: params.error.message });
    return;
  }

  const body = UpdateFrameworkBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid_body", message: body.error.message });
    return;
  }

  const [framework] = await db
    .update(frameworksTable)
    .set(body.data)
    .where(eq(frameworksTable.id, params.data.id))
    .returning();

  if (!framework) {
    res.status(404).json({ error: "not_found", message: "Framework not found" });
    return;
  }

  res.json({
    ...framework,
    githubUrl: framework.githubUrl ?? undefined,
    pypiUrl: framework.pypiUrl ?? undefined,
    officialUrl: framework.officialUrl ?? undefined,
    createdAt: framework.createdAt.toISOString(),
    updatedAt: framework.updatedAt.toISOString(),
  });
});

router.delete("/frameworks/:id", async (req, res): Promise<void> => {
  const params = DeleteFrameworkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "invalid_params", message: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(frameworksTable)
    .where(eq(frameworksTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "not_found", message: "Framework not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/frameworks/:id/star", async (req, res): Promise<void> => {
  const params = StarFrameworkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "invalid_params", message: params.error.message });
    return;
  }

  const [framework] = await db
    .update(frameworksTable)
    .set({ stars: sql`${frameworksTable.stars} + 1` })
    .where(eq(frameworksTable.id, params.data.id))
    .returning();

  if (!framework) {
    res.status(404).json({ error: "not_found", message: "Framework not found" });
    return;
  }

  res.json({
    ...framework,
    githubUrl: framework.githubUrl ?? undefined,
    pypiUrl: framework.pypiUrl ?? undefined,
    officialUrl: framework.officialUrl ?? undefined,
    createdAt: framework.createdAt.toISOString(),
    updatedAt: framework.updatedAt.toISOString(),
  });
});

export default router;
