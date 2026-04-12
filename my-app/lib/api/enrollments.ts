import { apiRequest } from "./client";
import { EnrollmentResponse } from "./types";
import { mapCourse } from "./mappers";

export async function getMyEnrollments(token: string) {
  const response = await apiRequest<EnrollmentResponse>("/api/enrollments/me", { token });
  return response.enrollments.map((item) => ({
    id: item.id,
    courseId: item.courseId,
    course: mapCourse(item.course),
  }));
}

export function enrollInCourse(courseId: string, token: string) {
  return apiRequest<{ message: string }>(`/api/enrollments/${courseId}`, {
    method: "POST",
    token,
  });
}
