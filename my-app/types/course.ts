export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  locked?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseReview {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessonsCount: number;
  students: number;
  rating: number;
  price: number;
  image: string;
  mentorId: string;
  tags: string[];
  featured?: boolean;
  modules: CourseModule[];
  reviews: CourseReview[];
  mentor?: {
    id: string;
    name: string;
    role: string;
    bio: string;
    avatar?: string;
  };
}
