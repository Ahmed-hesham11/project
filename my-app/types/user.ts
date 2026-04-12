export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  enrolledCourseIds: string[];
  completionRate: number;
  hoursLearned: number;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
}
