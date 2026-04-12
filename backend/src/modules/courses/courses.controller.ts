import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function listCoursesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const featured = req.query.featured === "true";
    const courses = await prisma.course.findMany({
      where: featured ? { featured: true } : {},
      include: {
        tags: true,
        modules: { include: { lessons: true }, orderBy: { sortOrder: "asc" } },
        reviews: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ courses });
  } catch (error) {
    return next(error);
  }
}

export async function getCourseDetailsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const idOrSlug = String(req.params.idOrSlug);
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        mentor: true,
        tags: true,
        modules: { include: { lessons: true }, orderBy: { sortOrder: "asc" } },
        reviews: {
          include: { user: { select: { id: true, email: true, profile: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ course });
  } catch (error) {
    return next(error);
  }
}
