import { Router } from "express";
import { UserRole } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth";
import { requireAdminPermission } from "../../middleware/permissions";
import { validate } from "../../middleware/validate";
import {
  createStudentHandler,
  createCourseHandler,
  dashboardMetricsHandler,
  deleteCourseHandler,
  listAdminCoursesHandler,
  listStudentsHandler,
  updateCourseHandler,
  updateStudentEnrollmentsHandler,
} from "./admin.controller";
import { createCourseSchema, createStudentByAdminSchema, updateCourseSchema, updateStudentEnrollmentsSchema } from "./admin.schema";

const router = Router();

router.use(requireAuth, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get("/dashboard/metrics", dashboardMetricsHandler);
router.get("/students", listStudentsHandler);
router.post(
  "/students",
  requireAdminPermission("canManageUsers"),
  validate(createStudentByAdminSchema),
  createStudentHandler,
);
router.patch(
  "/students/:studentId/enrollments",
  requireAdminPermission("canManageUsers"),
  validate(updateStudentEnrollmentsSchema),
  updateStudentEnrollmentsHandler,
);

router.get("/courses", listAdminCoursesHandler);
router.post(
  "/courses",
  requireAdminPermission("canManageCourses"),
  validate(createCourseSchema),
  createCourseHandler,
);
router.patch(
  "/courses/:courseId",
  requireAdminPermission("canManageCourses"),
  validate(updateCourseSchema),
  updateCourseHandler,
);
router.delete(
  "/courses/:courseId",
  requireAdminPermission("canManageCourses"),
  deleteCourseHandler,
);

export default router;
