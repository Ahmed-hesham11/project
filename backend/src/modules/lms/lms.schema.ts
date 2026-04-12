import { z } from "zod";

export const submitAssignmentSchema = z.object({
  content: z.string().min(3),
});

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: z.string().min(1),
    }),
  ),
});

export const createLessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.string().min(1).default("0 دقيقة"),
  sortOrder: z.coerce.number().int().min(1),
  isLocked: z.boolean().optional(),
  releaseDate: z.string().datetime().optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  videoUrl: z.string().url().nullable().optional(),
  duration: z.string().min(1).optional(),
  sortOrder: z.coerce.number().int().min(1).optional(),
  isLocked: z.boolean().optional(),
  releaseDate: z.string().datetime().nullable().optional(),
});

export const createModuleSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  sortOrder: z.coerce.number().int().min(1),
});

export const createAssignmentSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().datetime(),
  unlocksLessonId: z.string().min(1).optional(),
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  dueDate: z.string().datetime().optional(),
  unlocksLessonId: z.string().min(1).nullable().optional(),
});

export const createQuizSchema = z.object({
  lessonId: z.string().min(1),
  unlocksLessonId: z.string().min(1).optional(),
  title: z.string().min(1),
  questions: z.array(
    z.object({
      questionText: z.string().min(1),
      options: z.array(z.string().min(1)).min(2),
      correctAnswer: z.string().min(1),
    }),
  ),
});

export const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  unlocksLessonId: z.string().min(1).nullable().optional(),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        correctAnswer: z.string().min(1),
      }),
    )
    .optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PAID", "FAILED", "PENDING"]),
});

export const createPaymentSchema = z.object({
  courseId: z.string().min(1),
  method: z.enum(["FAWRY", "INSTAPAY", "VODAFONE_CASH", "PAYMOB"]),
});

export const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const assignPermissionsSchema = z.object({
  canManageCourses: z.boolean().default(false),
  canManageUsers: z.boolean().default(false),
  canManageContent: z.boolean().default(false),
  canManagePayments: z.boolean().default(false),
});
