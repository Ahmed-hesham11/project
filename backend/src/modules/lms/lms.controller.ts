import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PaymentMethod, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/http-error";

function lessonReleased(lesson: { releaseDate: Date | null }) {
  return !lesson.releaseDate || lesson.releaseDate <= new Date();
}

function youtubeEmbedUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return url;
  } catch {
    return url;
  }
}

export async function studentDashboardHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.id;
    const [enrollments, submissions] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: studentId },
        include: { course: true },
      }),
      prisma.submission.findMany({
        where: { studentId },
        include: { assignment: true },
        orderBy: { submittedAt: "desc" },
      }),
    ]);

    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        lesson: {
          module: {
            course: {
              enrollments: {
                some: { userId: studentId },
              },
            },
          },
        },
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: "asc" },
      take: 8,
    });

    return res.status(200).json({
      enrolledCourses: enrollments.map((item) => item.course),
      submissionsCount: submissions.length,
      upcomingAssignments,
    });
  } catch (error) {
    return next(error);
  }
}

export async function learningPageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.id;
    const courseId = String(req.params.courseId);

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: studentId, courseId } },
    });
    if (!enrollment) {
      throw new HttpError(403, "Not enrolled in this course");
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: {
              orderBy: { sortOrder: "asc" },
              include: {
                assignments: true,
                quizzes: { include: { questions: true } },
              },
            },
          },
        },
      },
    });
    if (!course) throw new HttpError(404, "Course not found");

    const submissions = await prisma.submission.findMany({
      where: { studentId, assignment: { lesson: { module: { courseId } } } },
    });
    const attempts = await prisma.quizAttempt.findMany({
      where: { studentId, quiz: { lesson: { module: { courseId } } } },
    });

    const submittedAssignmentIds = new Set(submissions.map((s) => s.assignmentId));
    const attemptedQuizIds = new Set(attempts.map((a) => a.quizId));

    const allLessons = course.modules.flatMap((module) => module.lessons);
    const customAssignmentRequirements = new Map<string, string[]>();
    const customQuizRequirements = new Map<string, string[]>();

    for (const lesson of allLessons) {
      for (const assignment of lesson.assignments) {
        if (!assignment.unlocksLessonId) continue;
        const current = customAssignmentRequirements.get(assignment.unlocksLessonId) ?? [];
        current.push(assignment.id);
        customAssignmentRequirements.set(assignment.unlocksLessonId, current);
      }
      for (const quiz of lesson.quizzes) {
        if (!quiz.unlocksLessonId) continue;
        const current = customQuizRequirements.get(quiz.unlocksLessonId) ?? [];
        current.push(quiz.id);
        customQuizRequirements.set(quiz.unlocksLessonId, current);
      }
    }

    let previousLessonCompleted = true;
    const modules = course.modules.map((module) => {
      const lessons = module.lessons.map((lesson) => {
        const ownAssignmentDone = lesson.assignments.every((a) => submittedAssignmentIds.has(a.id));
        const ownQuizDone = lesson.quizzes.every((q) => attemptedQuizIds.has(q.id));
        const lessonCompleted = ownAssignmentDone && ownQuizDone;
        const scheduleLocked = !lessonReleased(lesson);

        const assignmentRequirementsForThisLesson = customAssignmentRequirements.get(lesson.id) ?? [];
        const quizRequirementsForThisLesson = customQuizRequirements.get(lesson.id) ?? [];
        const customAssignmentDone = assignmentRequirementsForThisLesson.every((id) =>
          submittedAssignmentIds.has(id),
        );
        const customQuizDone = quizRequirementsForThisLesson.every((id) =>
          attemptedQuizIds.has(id),
        );
        const hasCustomRequirements =
          assignmentRequirementsForThisLesson.length > 0 || quizRequirementsForThisLesson.length > 0;

        const prerequisiteSatisfied = hasCustomRequirements
          ? customAssignmentDone && customQuizDone
          : previousLessonCompleted;
        const computedLocked =
          lesson.isLocked || scheduleLocked || !prerequisiteSatisfied;

        // Unlock sequence only when previous lesson is completed.
        previousLessonCompleted = lessonCompleted;

        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          videoUrl: lesson.videoUrl,
          embedUrl: youtubeEmbedUrl(lesson.videoUrl),
          isLocked: lesson.isLocked,
          computedLocked,
          releaseDate: lesson.releaseDate,
          assignmentDone: ownAssignmentDone,
          quizDone: ownQuizDone,
          lessonCompleted,
          assignments: lesson.assignments,
          quizzes: lesson.quizzes.map((quiz) => ({
            id: quiz.id,
            title: quiz.title,
            unlocksLessonId: quiz.unlocksLessonId,
            questions: quiz.questions.map((question) => ({
              id: question.id,
              questionText: question.questionText,
              options: Array.isArray(question.options)
                ? question.options.map((value) => String(value))
                : [],
            })),
          })),
        };
      });
      return {
        id: module.id,
        title: module.title,
        sortOrder: module.sortOrder,
        lessons,
      };
    });

    return res.status(200).json({
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        modules,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function submitAssignmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.id;
    const assignmentId = String(req.params.assignmentId);
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
    });
    if (!assignment) throw new HttpError(404, "Assignment not found");

    const enrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: assignment.lesson.module.courseId,
        },
      },
    });
    if (!enrolled) {
      throw new HttpError(403, "You are not enrolled in this course");
    }

    const submission = await prisma.submission.upsert({
      where: { studentId_assignmentId: { studentId, assignmentId } },
      update: {
        content: req.body.content,
        submittedAt: new Date(),
        isLate: new Date() > assignment.dueDate,
        status: "PENDING",
      },
      create: {
        studentId,
        assignmentId,
        content: req.body.content,
        isLate: new Date() > assignment.dueDate,
      },
    });
    console.log("[LMS] assignment submission saved", {
      studentId,
      assignmentId,
      submissionId: submission.id,
    });
    return res.status(201).json({ submission });
  } catch (error) {
    return next(error);
  }
}

export async function submitQuizHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.user!.id;
    const quizId = String(req.params.quizId);
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, lesson: { include: { module: true } } },
    });
    if (!quiz) throw new HttpError(404, "Quiz not found");

    const enrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: quiz.lesson.module.courseId,
        },
      },
    });
    if (!enrolled) {
      throw new HttpError(403, "You are not enrolled in this course");
    }

    const answers = new Map<string, string>(
      req.body.answers.map((item: { questionId: string; answer: string }) => [item.questionId, item.answer]),
    );
    let correct = 0;
    for (const question of quiz.questions) {
      if (answers.get(question.id) === question.correctAnswer) correct += 1;
    }
    const score = quiz.questions.length ? (correct / quiz.questions.length) * 100 : 0;

    const attempt = await prisma.quizAttempt.create({
      data: { studentId, quizId, score },
    });
    console.log("[LMS] quiz attempt saved", {
      studentId,
      quizId,
      score,
      attemptId: attempt.id,
    });
    return res.status(201).json({ attempt, score });
  } catch (error) {
    return next(error);
  }
}

export async function createPaymentRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { courseId, method } = req.body as { courseId: string; method: PaymentMethod };
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new HttpError(404, "Course not found");

    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount: course.price,
        method,
        status: PaymentStatus.PENDING,
        referenceCode: `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      },
    });
    return res.status(201).json({ payment });
  } catch (error) {
    return next(error);
  }
}

export async function verifyPaymentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const paymentId = String(req.params.paymentId);
    const status = req.body.status as PaymentStatus;
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status, verifiedAt: new Date() },
    });
    if (status === PaymentStatus.PAID) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
        create: { userId: payment.userId, courseId: payment.courseId },
        update: {},
      });
    }
    return res.status(200).json({ payment });
  } catch (error) {
    return next(error);
  }
}

export async function createLessonHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const lesson = await prisma.lesson.create({
      data: {
        moduleId: payload.moduleId,
        title: payload.title,
        description: payload.description,
        videoUrl: payload.videoUrl,
        duration: payload.duration,
        sortOrder: payload.sortOrder,
        isLocked: payload.isLocked ?? false,
        releaseDate: payload.releaseDate ? new Date(payload.releaseDate) : null,
      },
    });
    return res.status(201).json({ lesson });
  } catch (error) {
    return next(error);
  }
}

export async function createModuleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const module = await prisma.courseModule.create({
      data: {
        courseId: payload.courseId,
        title: payload.title,
        sortOrder: payload.sortOrder,
      },
    });
    return res.status(201).json({ module });
  } catch (error) {
    return next(error);
  }
}

export async function createAssignmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const assignment = await prisma.assignment.create({
      data: {
        lessonId: payload.lessonId,
        title: payload.title,
        description: payload.description,
        dueDate: new Date(payload.dueDate),
        unlocksLessonId: payload.unlocksLessonId,
      },
    });
    return res.status(201).json({ assignment });
  } catch (error) {
    return next(error);
  }
}

export async function createQuizHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        lessonId: payload.lessonId,
        unlocksLessonId: payload.unlocksLessonId,
        title: payload.title,
        questions: {
          create: payload.questions.map((question: { questionText: string; options: string[]; correctAnswer: string }) => ({
            questionText: question.questionText,
            options: question.options as Prisma.JsonArray,
            correctAnswer: question.correctAnswer,
          })),
        },
      },
      include: { questions: true },
    });
    return res.status(201).json({ quiz });
  } catch (error) {
    return next(error);
  }
}

export async function listContentMapHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = String(req.query.courseId ?? "");
    const lessons = await prisma.lesson.findMany({
      where: courseId ? { module: { courseId } } : {},
      include: {
        module: { select: { id: true, title: true, course: { select: { id: true, title: true } } } },
        assignments: true,
        quizzes: { include: { questions: true } },
      },
      orderBy: [{ module: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    });

    return res.status(200).json({
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        module: lesson.module,
        assignments: lesson.assignments,
        quizzes: lesson.quizzes,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateLessonHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const lessonId = String(req.params.lessonId);
    const payload = req.body;
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...payload,
        releaseDate:
          payload.releaseDate === null
            ? null
            : payload.releaseDate
              ? new Date(payload.releaseDate)
              : undefined,
      },
    });
    return res.status(200).json({ lesson });
  } catch (error) {
    return next(error);
  }
}

export async function deleteLessonHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const lessonId = String(req.params.lessonId);
    await prisma.lesson.delete({ where: { id: lessonId } });
    return res.status(200).json({ message: "Lesson deleted" });
  } catch (error) {
    return next(error);
  }
}

export async function updateAssignmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const assignmentId = String(req.params.assignmentId);
    const payload = req.body;
    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
        unlocksLessonId: payload.unlocksLessonId === null ? null : payload.unlocksLessonId,
      },
    });
    return res.status(200).json({ assignment });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAssignmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const assignmentId = String(req.params.assignmentId);
    await prisma.assignment.delete({ where: { id: assignmentId } });
    return res.status(200).json({ message: "Assignment deleted" });
  } catch (error) {
    return next(error);
  }
}

export async function updateQuizHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const quizId = String(req.params.quizId);
    const payload = req.body;
    const quiz = await prisma.$transaction(async (tx) => {
      const updatedQuiz = await tx.quiz.update({
        where: { id: quizId },
        data: {
          title: payload.title,
          unlocksLessonId: payload.unlocksLessonId === null ? null : payload.unlocksLessonId,
        },
      });
      if (payload.questions) {
        await tx.question.deleteMany({ where: { quizId } });
        await tx.question.createMany({
          data: payload.questions.map((question: { questionText: string; options: string[]; correctAnswer: string }) => ({
            quizId,
            questionText: question.questionText,
            options: question.options as Prisma.JsonArray,
            correctAnswer: question.correctAnswer,
          })),
        });
      }
      return tx.quiz.findUnique({
        where: { id: updatedQuiz.id },
        include: { questions: true },
      });
    });
    return res.status(200).json({ quiz });
  } catch (error) {
    return next(error);
  }
}

export async function deleteQuizHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const quizId = String(req.params.quizId);
    await prisma.quiz.delete({ where: { id: quizId } });
    return res.status(200).json({ message: "Quiz deleted" });
  } catch (error) {
    return next(error);
  }
}

export async function createAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new HttpError(409, "Email already exists");
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: { email, passwordHash, role: UserRole.ADMIN },
      select: { id: true, email: true, role: true },
    });
    await prisma.adminPermission.create({
      data: { adminId: admin.id },
    });
    return res.status(201).json({ admin });
  } catch (error) {
    return next(error);
  }
}

export async function assignAdminPermissionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = String(req.params.adminId);
    const permissions = await prisma.adminPermission.upsert({
      where: { adminId },
      create: { adminId, ...req.body },
      update: req.body,
    });
    return res.status(200).json({ permissions });
  } catch (error) {
    return next(error);
  }
}

export async function listAllPaymentsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { id: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ payments });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: {
        id: true,
        email: true,
        adminProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ admins });
  } catch (error) {
    return next(error);
  }
}
