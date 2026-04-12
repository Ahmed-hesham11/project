import { Router } from "express";
import { UserRole } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth";
import { requireAdminPermission } from "../../middleware/permissions";
import { validate } from "../../middleware/validate";
import {
  assignAdminPermissionsHandler,
  createAdminHandler,
  createAssignmentHandler,
  createLessonHandler,
  createModuleHandler,
  createPaymentRequestHandler,
  createQuizHandler,
  deleteAssignmentHandler,
  deleteLessonHandler,
  deleteQuizHandler,
  learningPageHandler,
  listAdminsHandler,
  listAllPaymentsHandler,
  listContentMapHandler,
  studentDashboardHandler,
  submitAssignmentHandler,
  submitQuizHandler,
  updateAssignmentHandler,
  updateLessonHandler,
  updateQuizHandler,
  verifyPaymentHandler,
} from "./lms.controller";
import {
  assignPermissionsSchema,
  createAdminSchema,
  createAssignmentSchema,
  createLessonSchema,
  createModuleSchema,
  createPaymentSchema,
  createQuizSchema,
  submitAssignmentSchema,
  submitQuizSchema,
  updatePaymentStatusSchema,
  updateAssignmentSchema,
  updateLessonSchema,
  updateQuizSchema,
} from "./lms.schema";

const router = Router();

router.use(requireAuth);

router.get("/student/dashboard", requireRole(UserRole.USER), studentDashboardHandler);
router.get("/courses/:courseId/learn", requireRole(UserRole.USER), learningPageHandler);
router.post(
  "/assignments/:assignmentId/submissions",
  requireRole(UserRole.USER),
  validate(submitAssignmentSchema),
  submitAssignmentHandler,
);
router.post(
  "/quizzes/:quizId/attempts",
  requireRole(UserRole.USER),
  validate(submitQuizSchema),
  submitQuizHandler,
);

router.post("/payments", requireRole(UserRole.USER), validate(createPaymentSchema), createPaymentRequestHandler);

router.post(
  "/admin/modules",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  validate(createModuleSchema),
  createModuleHandler,
);
router.post(
  "/admin/lessons",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  validate(createLessonSchema),
  createLessonHandler,
);
router.post(
  "/admin/assignments",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  validate(createAssignmentSchema),
  createAssignmentHandler,
);
router.post(
  "/admin/quizzes",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  validate(createQuizSchema),
  createQuizHandler,
);
router.get(
  "/admin/content-map",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  listContentMapHandler,
);
router.patch(
  "/admin/lessons/:lessonId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  validate(updateLessonSchema),
  updateLessonHandler,
);
router.delete(
  "/admin/lessons/:lessonId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  deleteLessonHandler,
);
router.patch(
  "/admin/assignments/:assignmentId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  validate(updateAssignmentSchema),
  updateAssignmentHandler,
);
router.delete(
  "/admin/assignments/:assignmentId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  deleteAssignmentHandler,
);
router.patch(
  "/admin/quizzes/:quizId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  validate(updateQuizSchema),
  updateQuizHandler,
);
router.delete(
  "/admin/quizzes/:quizId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManageContent"),
  deleteQuizHandler,
);
router.get(
  "/admin/payments",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManagePayments"),
  listAllPaymentsHandler,
);
router.patch(
  "/admin/payments/:paymentId",
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  requireAdminPermission("canManagePayments"),
  validate(updatePaymentStatusSchema),
  verifyPaymentHandler,
);

router.post(
  "/super-admin/admins",
  requireRole(UserRole.SUPER_ADMIN),
  validate(createAdminSchema),
  createAdminHandler,
);
router.get(
  "/super-admin/admins",
  requireRole(UserRole.SUPER_ADMIN),
  listAdminsHandler,
);
router.patch(
  "/super-admin/admins/:adminId/permissions",
  requireRole(UserRole.SUPER_ADMIN),
  validate(assignPermissionsSchema),
  assignAdminPermissionsHandler,
);

export default router;
