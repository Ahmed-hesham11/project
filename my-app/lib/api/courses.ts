import { mapCourse } from "./mappers";
import { apiRequest } from "./client";
import { CourseDetailsResponse, CourseListResponse } from "./types";

export async function getCourses(featured?: boolean) {
  const query = featured ? "?featured=true" : "";
  const response = await apiRequest<CourseListResponse>(`/api/courses${query}`, {
    cache: "no-store",
  });
  return response.courses.map(mapCourse);
}

export async function getCourseByIdOrSlug(idOrSlug: string) {
  const response = await apiRequest<CourseDetailsResponse>(`/api/courses/${idOrSlug}`, {
    cache: "no-store",
  });
  return mapCourse(response.course);
}
