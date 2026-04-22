export type UserProfileData = {
  name: string;
  email: string;
  avatar: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  progress: number;
};

export type UserCourse = {
  id: string;
  title: string;
  lessonCount: number;
  lastLesson: string;
  thumbnail: string;
};

export const MOCK_USER_PROFILE: UserProfileData = {
  name: "Ahmed Hesham",
  email: "ahmed@example.com",
  avatar: "/avatar.png",
  coursesEnrolled: 5,
  coursesCompleted: 2,
  progress: 40,
};

export const MOCK_USER_COURSES: UserCourse[] = [
  {
    id: "course-1",
    title: "Mathematics Basics",
    lessonCount: 18,
    lastLesson: "Algebra Fundamentals",
    thumbnail: "/images/logo.jpg",
  },
  {
    id: "course-2",
    title: "Geometry Masterclass",
    lessonCount: 24,
    lastLesson: "Angles and Proofs",
    thumbnail: "/images/logo.jpg",
  },
  {
    id: "course-3",
    title: "Calculus for Secondary",
    lessonCount: 30,
    lastLesson: "Derivatives Practice",
    thumbnail: "/images/logo.jpg",
  },
];

export const MOCK_CONTINUE_WATCHING: UserCourse[] = [
  {
    id: "continue-1",
    title: "Trigonometry Crash Course",
    lessonCount: 14,
    lastLesson: "Unit Circle Review",
    thumbnail: "/images/logo.jpg",
  },
  {
    id: "continue-2",
    title: "Problem Solving Skills",
    lessonCount: 20,
    lastLesson: "Speed Techniques",
    thumbnail: "/images/logo.jpg",
  },
];
