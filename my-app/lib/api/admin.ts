import { apiRequest } from "./client";
import { mapCourse, mapStudent } from "./mappers";
import { CourseApiItem } from "./types";

export async function getAdminMetrics(token: string) {
  const response = await apiRequest<{
    metrics: {
      courseCount: number;
      studentsCount: number;
      enrollmentsCount: number;
      averageRating: string;
      totalRevenue: number;
    };
  }>("/api/admin/dashboard/metrics", { token });
  return response.metrics;
}

export async function getAdminCourses(token: string) {
  const response = await apiRequest<{ courses: CourseApiItem[] }>("/api/admin/courses", { token });
  return response.courses.map(mapCourse);
}

export function createAdminCourse(
  payload: {
    slug: string;
    title: string;
    tagline: string;
    description: string;
    category: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    duration: string;
    lessonsCount: number;
    students: number;
    rating: number;
    price: number;
    image: string;
    featured: boolean;
    mentorId: string;
  },
  token: string,
) {
  return apiRequest<{ course: CourseApiItem }>("/api/admin/courses", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateAdminCourse(
  courseId: string,
  payload: { title?: string; tagline?: string; price?: number; level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" },
  token: string,
) {
  return apiRequest<{ course: unknown }>(`/api/admin/courses/${courseId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function getAdminStudents(token: string) {
  return getAdminStudentsWithSearch("", token);
}

export async function getAdminStudentsWithSearch(search: string, token: string) {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const response = await apiRequest<{
    students: Array<{
      id: string;
      email: string;
      completionRate: number;
      enrolledCourseIds: string[];
      profile?: { firstName?: string; secondName?: string; thirdName?: string; lastName?: string } | null;
    }>;
  }>(`/api/admin/students${query}`, { token });
  return response.students.map(mapStudent);
}

export function updateStudentEnrollments(studentId: string, enrolledCourseIds: string[], token: string) {
  return apiRequest<{ message: string }>(`/api/admin/students/${studentId}/enrollments`, {
    method: "PATCH",
    body: { enrolledCourseIds },
    token,
  });
}

export function deleteAdminCourse(courseId: string, token: string) {
  return apiRequest<{ message: string }>(`/api/admin/courses/${courseId}`, {
    method: "DELETE",
    token,
  });
}

export function createStudentByAdmin(
  payload: {
    firstName: string;
    secondName: string;
    thirdName: string;
    lastName: string;
    studentPhone: string;
    fatherPhone: string;
    motherPhone?: string;
    governorate: string;
    educationType: string;
    grade: string;
    department: string;
    email: string;
    password: string;
  },
  token: string,
) {
  return apiRequest<{ student: { id: string; email: string } }>("/api/admin/students", {
    method: "POST",
    body: payload,
    token,
  });
}
