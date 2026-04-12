import { Router } from "express";
import { getCourseDetailsHandler, listCoursesHandler } from "./courses.controller";

const router = Router();

router.get("/", listCoursesHandler);
router.get("/:idOrSlug", getCourseDetailsHandler);

export default router;
