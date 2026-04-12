import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  enrollInCourseHandler,
  myEnrollmentsHandler,
  unenrollInCourseHandler,
} from "./enrollments.controller";

const router = Router();

router.use(requireAuth);
router.get("/me", myEnrollmentsHandler);
router.post("/:courseId", enrollInCourseHandler);
router.delete("/:courseId", unenrollInCourseHandler);

export default router;
