import { Course } from "@/types/course";
import { CourseApiItem, UiStudent } from "./types";

const levelMap: Record<CourseApiItem["level"], Course["level"]> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export function mapCourse(apiCourse: CourseApiItem): Course {
  const tags = Array.isArray(apiCourse.tags) ? apiCourse.tags : [];
  const modules = Array.isArray(apiCourse.modules) ? apiCourse.modules : [];
  const reviews = Array.isArray(apiCourse.reviews) ? apiCourse.reviews : [];
  const normalizedLevel =
    apiCourse.level && apiCourse.level in levelMap
      ? levelMap[apiCourse.level]
      : "Beginner";

  return {
    id: apiCourse.id,
    slug: apiCourse.slug ?? apiCourse.id,
    title: apiCourse.title ?? "Untitled Course",
    tagline: apiCourse.tagline ?? apiCourse.description ?? "",
    description: apiCourse.description ?? apiCourse.tagline ?? "",
    category: apiCourse.category ?? "General",
    level: normalizedLevel,
    duration: apiCourse.duration ?? "0h",
    lessonsCount: apiCourse.lessonsCount ?? modules.reduce((sum, module) => sum + (module.lessons?.length ?? 0), 0),
    students: apiCourse.students ?? 0,
    rating: apiCourse.rating ?? 0,
    price: Number(apiCourse.price),
    image: apiCourse.image ?? "/images/logo.jpg",
    mentorId: apiCourse.mentorId ?? "mentor-waleed",
    featured: apiCourse.featured,
    tags: tags.map((tag) => tag.name),
    modules: modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: (module.lessons ?? []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration ?? "0m",
        locked: lesson.locked ?? false,
      })),
    })),
    reviews: reviews.map((review) => ({
      id: review.id,
      name:
        review.user?.profile?.firstName && review.user?.profile?.lastName
          ? `${review.user.profile.firstName} ${review.user.profile.lastName}`
          : "طالب",
      role: review.roleLabel,
      rating: review.rating,
      comment: review.comment,
    })),
    mentor: apiCourse.mentor
      ? {
          id: apiCourse.mentor.id,
          name: apiCourse.mentor.name,
          role: apiCourse.mentor.role,
          bio: apiCourse.mentor.bio,
          avatar: apiCourse.mentor.avatar ?? "/images/logo.jpg",
        }
      : undefined,
  };
}

export function mapStudent(apiStudent: {
  id: string;
  email: string;
  completionRate: number;
  enrolledCourseIds: string[];
  profile?: { firstName?: string; secondName?: string; thirdName?: string; lastName?: string } | null;
}): UiStudent {
  const profile = apiStudent.profile;
  const name = [profile?.firstName, profile?.secondName, profile?.thirdName, profile?.lastName]
    .filter(Boolean)
    .join(" ");
  return {
    id: apiStudent.id,
    email: apiStudent.email,
    name: name || apiStudent.email,
    completionRate: apiStudent.completionRate,
    enrolledCourseIds: apiStudent.enrolledCourseIds,
  };
}
