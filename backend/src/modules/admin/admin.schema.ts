import { z } from "zod";

export const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  tagline: z.string().min(1).optional(),
  price: z.coerce.number().positive().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

export const createCourseSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(3),
  tagline: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.string().min(1),
  lessonsCount: z.coerce.number().int().min(0).default(0),
  students: z.coerce.number().int().min(0).default(0),
  rating: z.coerce.number().min(0).max(5).default(0),
  price: z.coerce.number().positive(),
  image: z.string().min(1),
  featured: z.boolean().default(false),
  mentorId: z.string().min(1),
});

export const updateStudentEnrollmentsSchema = z.object({
  enrolledCourseIds: z.array(z.string().min(1)),
});

export const createStudentByAdminSchema = z.object({
  firstName: z.string().min(1),
  secondName: z.string().min(1),
  thirdName: z.string().min(1),
  lastName: z.string().min(1),
  studentPhone: z.string().min(11).max(11),
  fatherPhone: z.string().min(11).max(11),
  motherPhone: z.string().min(11).max(11).optional(),
  governorate: z.string().min(1),
  educationType: z.string().min(1),
  grade: z.string().min(1),
  department: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
