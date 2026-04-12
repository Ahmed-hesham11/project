import { apiRequest } from "./client";

export function getStudentDashboard(token: string) {
  return apiRequest<{
    enrolledCourses: Array<{ id: string; title: string; tagline: string }>;
    submissionsCount: number;
    upcomingAssignments: Array<{ id: string; title: string; dueDate: string }>;
  }>("/api/lms/student/dashboard", { token }).then((response) => {
    console.log("[API] student dashboard", response);
    return response;
  });
}

export function getLearningData(courseId: string, token: string) {
  return apiRequest<{
    course: {
      id: string;
      title: string;
      modules: Array<{
        id: string;
        title: string;
        lessons: Array<{
          id: string;
          title: string;
          description?: string | null;
          videoUrl?: string | null;
          embedUrl?: string | null;
          computedLocked: boolean;
          assignmentDone: boolean;
          quizDone: boolean;
          lessonCompleted: boolean;
          assignments: Array<{ id: string; title: string; dueDate: string }>;
          quizzes: Array<{
            id: string;
            title: string;
            questions: Array<{
              id: string;
              questionText: string;
              options: string[];
            }>;
          }>;
        }>;
      }>;
    };
  }>(`/api/lms/courses/${courseId}/learn`, { token }).then((response) => {
    console.log("[API] learning data", response);
    return response;
  });
}

export function submitAssignment(assignmentId: string, content: string, token: string) {
  return apiRequest(`/api/lms/assignments/${assignmentId}/submissions`, {
    method: "POST",
    token,
    body: { content },
  }).then((response) => {
    console.log("[API] assignment submission response", response);
    return response;
  });
}

export function submitQuiz(
  quizId: string,
  answers: Array<{ questionId: string; answer: string }>,
  token: string,
) {
  return apiRequest<{ score: number }>(`/api/lms/quizzes/${quizId}/attempts`, {
    method: "POST",
    token,
    body: { answers },
  }).then((response) => {
    console.log("[API] quiz attempt response", response);
    return response;
  });
}

export function getPayments(token: string) {
  return apiRequest<{ payments: Array<{ id: string; status: string; method: string; referenceCode: string; user: { email: string }; course: { title: string } }> }>(
    "/api/lms/admin/payments",
    { token },
  );
}

export function createPaymentRequest(
  courseId: string,
  method: "PAYMOB" | "FAWRY" | "INSTAPAY" | "VODAFONE_CASH",
  token: string,
) {
  return apiRequest("/api/lms/payments", {
    method: "POST",
    token,
    body: { courseId, method },
  });
}

export function createAdmin(email: string, password: string, token: string) {
  return apiRequest("/api/lms/super-admin/admins", {
    method: "POST",
    token,
    body: { email, password },
  });
}

export function createLesson(
  payload: {
    moduleId: string;
    title: string;
    description?: string;
    videoUrl?: string;
    duration: string;
    sortOrder: number;
    isLocked?: boolean;
  },
  token: string,
) {
  return apiRequest("/api/lms/admin/lessons", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateLesson(
  lessonId: string,
  payload: {
    title?: string;
    description?: string;
    videoUrl?: string | null;
    duration?: string;
    sortOrder?: number;
    isLocked?: boolean;
  },
  token: string,
) {
  return apiRequest(`/api/lms/admin/lessons/${lessonId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function deleteLesson(lessonId: string, token: string) {
  return apiRequest(`/api/lms/admin/lessons/${lessonId}`, {
    method: "DELETE",
    token,
  });
}

export function createModule(
  payload: { courseId: string; title: string; sortOrder: number },
  token: string,
) {
  return apiRequest("/api/lms/admin/modules", {
    method: "POST",
    token,
    body: payload,
  });
}

export function createAssignment(
  payload: { lessonId: string; title: string; description: string; dueDate: string; unlocksLessonId?: string },
  token: string,
) {
  return apiRequest("/api/lms/admin/assignments", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateAssignment(
  assignmentId: string,
  payload: {
    title?: string;
    description?: string;
    dueDate?: string;
    unlocksLessonId?: string | null;
  },
  token: string,
) {
  return apiRequest(`/api/lms/admin/assignments/${assignmentId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function deleteAssignment(assignmentId: string, token: string) {
  return apiRequest(`/api/lms/admin/assignments/${assignmentId}`, {
    method: "DELETE",
    token,
  });
}

export function createQuiz(
  payload: {
    lessonId: string;
    unlocksLessonId?: string;
    title: string;
    questions: Array<{ questionText: string; options: string[]; correctAnswer: string }>;
  },
  token: string,
) {
  return apiRequest("/api/lms/admin/quizzes", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateQuiz(
  quizId: string,
  payload: {
    title?: string;
    unlocksLessonId?: string | null;
    questions?: Array<{ questionText: string; options: string[]; correctAnswer: string }>;
  },
  token: string,
) {
  return apiRequest(`/api/lms/admin/quizzes/${quizId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function deleteQuiz(quizId: string, token: string) {
  return apiRequest(`/api/lms/admin/quizzes/${quizId}`, {
    method: "DELETE",
    token,
  });
}

export function getContentMap(courseId: string, token: string) {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
  return apiRequest<{
    lessons: Array<{
      id: string;
      title: string;
      module: { id: string; title: string; course: { id: string; title: string } };
      assignments: Array<{ id: string; title: string; unlocksLessonId?: string | null }>;
      quizzes: Array<{ id: string; title: string; unlocksLessonId?: string | null }>;
    }>;
  }>(`/api/lms/admin/content-map${query}`, { token });
}

export function updatePaymentStatus(paymentId: string, status: "PAID" | "FAILED" | "PENDING", token: string) {
  return apiRequest(`/api/lms/admin/payments/${paymentId}`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

export function getAdmins(token: string) {
  return apiRequest<{
    admins: Array<{
      id: string;
      email: string;
      adminProfile: {
        canManageCourses: boolean;
        canManageUsers: boolean;
        canManageContent: boolean;
        canManagePayments: boolean;
      } | null;
    }>;
  }>("/api/lms/super-admin/admins", {
    token,
  });
}

export function assignAdminPermissions(
  adminId: string,
  permissions: {
    canManageCourses: boolean;
    canManageUsers: boolean;
    canManageContent: boolean;
    canManagePayments: boolean;
  },
  token: string,
) {
  return apiRequest(`/api/lms/super-admin/admins/${adminId}/permissions`, {
    method: "PATCH",
    token,
    body: permissions,
  });
}
