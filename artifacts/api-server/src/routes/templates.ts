import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, frameworksTable, templatesTable } from "@workspace/db";
import {
  ListTemplatesQueryParams,
  CreateTemplateBody,
  GetTemplateParams,
  DeleteTemplateParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/templates", async (req, res): Promise<void> => {
  const parsed = ListTemplatesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_query", message: parsed.error.message });
    return;
  }

  let query = db
    .select({
      id: templatesTable.id,
      name: templatesTable.name,
      description: templatesTable.description,
      frameworkId: templatesTable.frameworkId,
      frameworkName: frameworksTable.name,
      repoUrl: templatesTable.repoUrl,
      language: templatesTable.language,
      difficulty: templatesTable.difficulty,
      useCount: templatesTable.useCount,
      createdAt: templatesTable.createdAt,
    })
    .from(templatesTable)
    .innerJoin(frameworksTable, eq(templatesTable.frameworkId, frameworksTable.id))
    .$dynamic();

  if (parsed.data.frameworkId) {
    query = query.where(eq(templatesTable.frameworkId, parsed.data.frameworkId));
  }

  const templates = await query.orderBy(sql`${templatesTable.useCount} DESC`);

  res.json(templates.map((t) => ({
    ...t,
    repoUrl: t.repoUrl ?? undefined,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.post("/templates", async (req, res): Promise<void> => {
  const parsed = CreateTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", message: parsed.error.message });
    return;
  }

  const [framework] = await db
    .select()
    .from(frameworksTable)
    .where(eq(frameworksTable.id, parsed.data.frameworkId));

  if (!framework) {
    res.status(400).json({ error: "invalid_framework", message: "Framework not found" });
    return;
  }

  const [template] = await db
    .insert(templatesTable)
    .values({ ...parsed.data, useCount: 0 })
    .returning();

  res.status(201).json({
    ...template,
    frameworkName: framework.name,
    repoUrl: template.repoUrl ?? undefined,
    createdAt: template.createdAt.toISOString(),
  });
});

router.get("/templates/:id", async (req, res): Promise<void> => {
  const params = GetTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "invalid_params", message: params.error.message });
    return;
  }

  const [result] = await db
    .select({
      id: templatesTable.id,
      name: templatesTable.name,
      description: templatesTable.description,
      frameworkId: templatesTable.frameworkId,
      frameworkName: frameworksTable.name,
      repoUrl: templatesTable.repoUrl,
      language: templatesTable.language,
      difficulty: templatesTable.difficulty,
      useCount: templatesTable.useCount,
      createdAt: templatesTable.createdAt,
    })
    .from(templatesTable)
    .innerJoin(frameworksTable, eq(templatesTable.frameworkId, frameworksTable.id))
    .where(eq(templatesTable.id, params.data.id));

  if (!result) {
    res.status(404).json({ error: "not_found", message: "Template not found" });
    return;
  }

  res.json({
    ...result,
    repoUrl: result.repoUrl ?? undefined,
    createdAt: result.createdAt.toISOString(),
  });
});

router.delete("/templates/:id", async (req, res): Promise<void> => {
  const params = DeleteTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "invalid_params", message: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(templatesTable)
    .where(eq(templatesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "not_found", message: "Template not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
