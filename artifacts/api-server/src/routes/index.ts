import { Router, type IRouter } from "express";
import healthRouter from "./health";
import frameworksRouter from "./frameworks";
import templatesRouter from "./templates";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(frameworksRouter);
router.use(templatesRouter);
router.use(statsRouter);

export default router;
