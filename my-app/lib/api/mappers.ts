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

  return {
    id: apiCourse.id,
    slug: apiCourse.slug,
    title: apiCourse.title,
    tagline: apiCourse.tagline,
    description: apiCourse.description,
    category: apiCourse.category,
    level: levelMap[apiCourse.level],
    duration: apiCourse.duration,
    lessonsCount: apiCourse.lessonsCount,
    students: apiCourse.students,
    rating: apiCourse.rating,
    price: Number(apiCourse.price),
    image: apiCourse.image,
    mentorId: apiCourse.mentorId,
    featured: apiCourse.featured,
    tags: tags.map((tag) => tag.name),
    modules: modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: (module.lessons ?? []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
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
