import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function myEnrollmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            tags: true,
            mentor: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
    return res.status(200).json({ enrollments });
  } catch (error) {
    return next(error);
  }
}

export async function enrollInCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const courseId = String(req.params.courseId);

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });

    return res.status(201).json({ message: "Enrolled successfully" });
  } catch (error) {
    return next(error);
  }
}

export async function unenrollInCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const courseId = String(req.params.courseId);

    await prisma.enrollment.deleteMany({
      where: { userId, courseId },
    });

    return res.status(200).json({ message: "Unenrolled successfully" });
  } catch (error) {
    return next(error);
  }
}
