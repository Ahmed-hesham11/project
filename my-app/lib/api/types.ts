export interface AuthUser {
  id: string;
  studentPhone: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  adminProfile?: {
    canManageCourses: boolean;
    canManageUsers: boolean;
    canManageContent: boolean;
    canManagePayments: boolean;
  } | null;
  profile?: {
    firstName: string;
    secondName: string;
    thirdName: string;
    lastName: string;
    completionRate?: number;
    hoursLearned?: number;
  } | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface CourseApiItem {
  id: string;
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
  price: number | string;
  image: string;
  featured: boolean;
  mentorId: string;
  mentor?: { id: string; name: string; role: string; bio: string; avatar?: string | null };
  tags?: Array<{ name: string }>;
  modules?: Array<{
    id: string;
    title: string;
    lessons: Array<{ id: string; title: string; duration: string; locked: boolean }>;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    roleLabel: string;
    user?: { profile?: { firstName?: string; lastName?: string } | null } | null;
  }>;
}

export interface CourseListResponse {
  courses: CourseApiItem[];
}

export interface CourseDetailsResponse {
  course: CourseApiItem;
}

export interface EnrollmentResponse {
  enrollments: Array<{
    id: string;
    courseId: string;
    course: CourseApiItem;
  }>;
}

export interface UiStudent {
  id: string;
  name: string;
  email: string;
  completionRate: number;
  enrolledCourseIds: string[];
  enabled?: boolean;
}
