import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { UserRole } from "@prisma/client";

export async function dashboardMetricsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const [courseCount, studentsCount, enrollmentsCount, avgRating] = await Promise.all([
      prisma.course.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.enrollment.count(),
      prisma.course.aggregate({ _avg: { rating: true } }),
    ]);

    const enrollments = await prisma.enrollment.findMany({
      select: {
        enrolledAt: true,
        course: { select: { price: true } },
      },
    });

    const totalRevenue = enrollments.reduce((sum, item) => sum + Number(item.course.price), 0);

    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
    const now = new Date();
    const currentMonthStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
      const monthStart = new Date(currentMonthStartUtc);
      monthStart.setUTCMonth(currentMonthStartUtc.getUTCMonth() - (5 - index));
      const key = `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        month: monthFormatter.format(monthStart),
        revenue: 0,
      };
    });

    const revenueByMonthLookup = new Map(revenueByMonth.map((item) => [item.key, item]));

    for (const enrollment of enrollments) {
      const date = enrollment.enrolledAt;
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      const bucket = revenueByMonthLookup.get(key);
      if (!bucket) continue;
      bucket.revenue += Number(enrollment.course.price);
    }

    return res.status(200).json({
      metrics: {
        courseCount,
        studentsCount,
        enrollmentsCount,
        averageRating: Number(avgRating._avg.rating ?? 0).toFixed(2),
        totalRevenue,
        enrollmentsForRevenueCalculation: enrollments.length,
        revenueByMonth: revenueByMonth.map((item) => ({
          month: item.month,
          revenue: Number(item.revenue.toFixed(2)),
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function listStudentsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const search = String(_req.query.search ?? "").trim();
    const students = await prisma.user.findMany({
      where: {
        role: "USER",
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { profile: { firstName: { contains: search, mode: "insensitive" } } },
                { profile: { lastName: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        profile: true,
        enrollments: { select: { courseId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      students: students.map((student) => ({
        id: student.id,
        email: student.email,
        completionRate: student.profile?.completionRate ?? 0,
        enrolledCourseIds: student.enrollments.map((item) => item.courseId),
        profile: student.profile,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createStudentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const passwordHash = await bcrypt.hash(payload.password, 12);
    const student = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        role: UserRole.USER,
        profile: {
          create: {
            firstName: payload.firstName,
            secondName: payload.secondName,
            thirdName: payload.thirdName,
            lastName: payload.lastName,
            studentPhone: payload.studentPhone,
            fatherPhone: payload.fatherPhone,
            motherPhone: payload.motherPhone,
            governorate: payload.governorate,
            educationType: payload.educationType,
            grade: payload.grade,
            department: payload.department,
          },
        },
      },
      select: { id: true, email: true },
    });

    return res.status(201).json({ student });
  } catch (error) {
    return next(error);
  }
}

export async function updateStudentEnrollmentsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const studentId = String(req.params.studentId);
    const enrolledCourseIds: string[] = req.body.enrolledCourseIds;

    await prisma.$transaction(async (tx) => {
      await tx.enrollment.deleteMany({ where: { userId: studentId } });
      if (enrolledCourseIds.length) {
        await tx.enrollment.createMany({
          data: enrolledCourseIds.map((courseId) => ({ userId: studentId, courseId })),
          skipDuplicates: true,
        });
      }
    });

    return res.status(200).json({ message: "Student enrollments updated" });
  } catch (error) {
    return next(error);
  }
}

export async function listAdminCoursesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        tags: true,
        modules: { include: { lessons: true }, orderBy: { sortOrder: "asc" } },
        reviews: {
          include: { user: { select: { id: true, email: true, profile: true } } },
          orderBy: { createdAt: "desc" },
        },
        mentor: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ courses });
  } catch (error) {
    return next(error);
  }
}

export async function updateCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = String(req.params.courseId);
    const payload = req.body;
    const course = await prisma.course.update({
      where: { id: courseId },
      data: payload,
    });
    return res.status(200).json({ course });
  } catch (error) {
    return next(error);
  }
}

export async function createCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const course = await prisma.course.create({
      data: payload,
    });
    return res.status(201).json({ course });
  } catch (error) {
    return next(error);
  }
}

export async function deleteCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = String(req.params.courseId);
    await prisma.course.delete({ where: { id: courseId } });
    return res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    return next(error);
  }
}
