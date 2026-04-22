import { supabase } from "../supabase/client";
import { apiRequest } from "./client";
import { getSessionFromToken } from "./simpleAuth";

function getReadableError(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = [record.message, record.error, record.details, record.hint].find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

interface LearningQuestionItem {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface LearningQuizItem {
  id: string;
  title: string;
  unlocksLessonId: string | null;
  questions: LearningQuestionItem[];
}

interface LearningAssignmentItem {
  id: string;
  title: string;
  unlocksLessonId: string | null;
}

interface LearningLessonItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  embedUrl: string;
  computedLocked: boolean;
  sort_order: number;
  assignmentDone: boolean;
  quizDone: boolean;
  lessonCompleted: boolean;
  assignments: LearningAssignmentItem[];
  quizzes: LearningQuizItem[];
}

interface LearningModuleItem {
  id: string;
  title: string;
  sortOrder: number;
  lessons: LearningLessonItem[];
}

interface LearningCourseData {
  course: {
    id: string;
    title: string;
    modules: LearningModuleItem[];
  };
}

function getYoutubeId(url: string) {
  const trimmed = url.trim();

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch) {
    return shortMatch[1];
  }

  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shortsMatch) {
    return shortsMatch[1];
  }

  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch) {
    return watchMatch[1];
  }

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
}

function getVimeoId(url: string) {
  const trimmed = url.trim();
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d{5,})/);
  return match ? match[1] : null;
}

function normalizeVideoSources(rawValue: unknown) {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";

  if (!value) {
    return { videoUrl: "", embedUrl: "" };
  }

  const youtubeId = getYoutubeId(value);
  if (youtubeId) {
    return {
      videoUrl: value,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    };
  }

  const vimeoId = getVimeoId(value);
  if (vimeoId) {
    return {
      videoUrl: value,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(value)) {
    return { videoUrl: value, embedUrl: "" };
  }

  if (/youtube\.com\/embed\//i.test(value) || /player\.vimeo\.com\/video\//i.test(value)) {
    return { videoUrl: value, embedUrl: value };
  }

  return { videoUrl: value, embedUrl: "" };
}

function parseDurationMinutes(duration: string | number | null | undefined) {
  if (typeof duration === "number" && Number.isFinite(duration)) {
    return Math.max(0, Math.round(duration));
  }

  if (typeof duration === "string") {
    const match = duration.match(/\d+/);
    if (match) {
      return Number(match[0]);
    }
  }

  return 0;
}

type QuizQuestionPayload = {
  questionText: string;
  options: string[];
  correctAnswer: string;
};

async function insertQuizQuestionsWithFallback(quizId: string, questions: QuizQuestionPayload[]) {
  if (!questions.length) {
    return;
  }

  const rows = questions.map((question) => ({
    quiz_id: quizId,
    question_text: question.questionText,
    options: question.options,
    correct_answer: question.correctAnswer,
  }));

  const { error: quizQuestionsError } = await supabase.from("quiz_questions").insert(rows);
  if (!quizQuestionsError) {
    return;
  }

  const { error: questionsError } = await supabase.from("questions").insert(rows);
  if (!questionsError) {
    return;
  }

  const { error: questionError } = await supabase.from("question").insert(rows);
  if (questionError) {
    throw new Error(getReadableError(questionError, "Failed to create quiz questions"));
  }
}

async function deleteQuizQuestionsWithFallback(quizId: string) {
  const { error: quizQuestionsError } = await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
  if (!quizQuestionsError) {
    return;
  }

  const { error: questionsError } = await supabase.from("questions").delete().eq("quiz_id", quizId);
  if (!questionsError) {
    return;
  }

  const { error: questionError } = await supabase.from("question").delete().eq("quiz_id", quizId);
  if (questionError) {
    throw new Error(getReadableError(questionError, "Failed to delete quiz questions"));
  }
}

async function fetchQuizQuestionsWithFallback(quizIds: string[]) {
  if (!quizIds.length) {
    return [] as Array<{
      id: string;
      quiz_id: string;
      questionText: string;
      options: string[];
      correctAnswer: string;
    }>;
  }

  const mapRows = (
    rows: Array<{
      id: string;
      quiz_id: string;
      question_text?: string | null;
      options?: unknown;
      correct_answer?: string | null;
    }>,
  ) =>
    rows.map((question) => ({
      id: question.id,
      quiz_id: question.quiz_id,
      questionText: question.question_text ?? "Question",
      options: Array.isArray(question.options) ? question.options.map((option) => String(option)) : [],
      correctAnswer: question.correct_answer ?? "",
    }));

  const { data: quizQuestionsData, error: quizQuestionsError } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, question_text, options, correct_answer")
    .in("quiz_id", quizIds);

  if (!quizQuestionsError) {
    return mapRows((quizQuestionsData ?? []) as Array<{
      id: string;
      quiz_id: string;
      question_text?: string | null;
      options?: unknown;
      correct_answer?: string | null;
    }>);
  }

  const { data: questionsData, error: questionsError } = await supabase
    .from("questions")
    .select("id, quiz_id, question_text, options, correct_answer")
    .in("quiz_id", quizIds);

  if (!questionsError) {
    return mapRows((questionsData ?? []) as Array<{
      id: string;
      quiz_id: string;
      question_text?: string | null;
      options?: unknown;
      correct_answer?: string | null;
    }>);
  }

  const { data: questionData, error: questionError } = await supabase
    .from("question")
    .select("id, quiz_id, question_text, options, correct_answer")
    .in("quiz_id", quizIds);

  if (questionError) {
    throw questionError;
  }

  return mapRows((questionData ?? []) as Array<{
    id: string;
    quiz_id: string;
    question_text?: string | null;
    options?: unknown;
    correct_answer?: string | null;
  }>);
}

/**
 * TODO: Get student dashboard data from Supabase
 * Note: Requires queries to enrollments, submissions, and assignments tables
 */
export async function getStudentDashboard(token: string) {
  try {
    const session = await getSessionFromToken(token);
    if (!session) throw new Error("Unauthorized");

    console.log("[getStudentDashboard] Fetching dashboard for user:", session.id);

    // Fetch enrollments with course titles
    let enrolledCourses: any[] = [];
    const { data: enrollmentsData, error: enrollError } = await supabase
      .from("enrollments")
      .select("id, course_id")
      .eq("user_id", session.id);

    if (!enrollError && enrollmentsData) {
      // Fetch course details
      const courseIds = enrollmentsData.map((e: any) => e.course_id);
      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);

        enrolledCourses = coursesData || [];
      }
    }

    console.log("[getStudentDashboard] Enrolled courses:", enrolledCourses.length);

    return {
      enrolledCourses,
      submissionsCount: 0, // TODO: Count from submissions table
      upcomingAssignments: [], // TODO: Query due assignments
    };
  } catch (error) {
    console.error("[getStudentDashboard] Error:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Get learning page data from Supabase
 * Note: Fetch course, modules, lessons, assignments, quizzes
 */
export async function getLearningData(
  courseId: string,
  token: string
): Promise<LearningCourseData> {
  try {
    const session = await getSessionFromToken(token);
    if (!session) throw new Error("Unauthorized");

    console.log("[getLearningData] Fetching course:", courseId);

    // Fetch course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("id", courseId)
      .single();

    if (courseError) {
      console.error("[getLearningData] Course fetch error:", courseError);
      throw courseError;
    }

    if (!course) {
      throw new Error("Course not found");
    }

    console.log("[getLearningData] Course found:", course);

    const { data: chapterRows, error: chapterError } = await supabase
      .from("chapter")
      .select("*")
      .eq("course_id", course.id);

    let modules = (chapterRows ?? []).map((module: Record<string, unknown>) => ({
      id: String(module.id ?? ""),
      course_id: String(module.course_id ?? course.id),
      title: typeof module.title === "string" ? module.title : "Untitled Chapter",
      sort_order: Number(module.order_index ?? 0),
    }));

    if (chapterError) {
      const { data: moduleRows, error: moduleError } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", course.id);

      if (moduleError) {
        throw moduleError;
      }

      modules = (moduleRows ?? []).map((module: Record<string, unknown>) => ({
        id: String(module.id ?? ""),
        course_id: String(module.course_id ?? course.id),
        title: typeof module.title === "string" ? module.title : "Untitled Chapter",
        sort_order: Number(module.sort_order ?? 0),
      }));
    }

    const moduleIds = modules.map((module) => module.id).filter(Boolean);

    const { data: lessonRows, error: lessonsError } = moduleIds.length
      ? await supabase.from("lessons").select("*").in("section_id", moduleIds)
      : { data: [], error: null };

    let normalizedLessons = (lessonRows ?? []).map((lesson: Record<string, unknown>) => ({
      id: String(lesson.id ?? ""),
      module_id: String(lesson.section_id ?? ""),
      title: typeof lesson.title === "string" ? lesson.title : "Untitled Lesson",
      description: typeof lesson.description === "string" ? lesson.description : "",
      duration:
        typeof lesson.duration === "number"
          ? `${lesson.duration} دقيقة`
          : typeof lesson.duration === "string"
            ? lesson.duration
            : "0 دقيقة",
      is_locked: !(Boolean(lesson.is_free)),
      sort_order: Number(lesson.order_index ?? 0),
      video_value:
        (lesson.video_url as string | undefined) ??
        (lesson.video_link as string | undefined) ??
        (lesson.video as string | undefined) ??
        "",
    }));

    if (lessonsError) {
      const { data: fallbackLessonRows, error: fallbackLessonsError } = moduleIds.length
        ? await supabase.from("lessons").select("*").in("module_id", moduleIds)
        : { data: [], error: null };

      if (fallbackLessonsError) {
        throw fallbackLessonsError;
      }

      normalizedLessons = (fallbackLessonRows ?? []).map((lesson: Record<string, unknown>) => ({
        id: String(lesson.id ?? ""),
        module_id: String(lesson.module_id ?? ""),
        title: typeof lesson.title === "string" ? lesson.title : "Untitled Lesson",
        description: typeof lesson.description === "string" ? lesson.description : "",
        duration:
          typeof lesson.duration === "number"
            ? `${lesson.duration} دقيقة`
            : typeof lesson.duration === "string"
              ? lesson.duration
              : "0 دقيقة",
        is_locked: Boolean(lesson.is_locked),
        sort_order: Number(lesson.sort_order ?? 0),
        video_value:
          (lesson.video_url as string | undefined) ??
          (lesson.video_link as string | undefined) ??
          (lesson.video as string | undefined) ??
          "",
      }));
    }

    const lessonIds = normalizedLessons.map((lesson) => lesson.id).filter(Boolean);

    const [{ data: assignmentsData, error: assignmentsError }, { data: quizzesData, error: quizzesError }] = await Promise.all([
      lessonIds.length
        ? supabase.from("assignments").select("id, title, lesson_id").in("lesson_id", lessonIds)
        : Promise.resolve({ data: [], error: null }),
      lessonIds.length
        ? supabase.from("quizzes").select("id, title, lesson_id").in("lesson_id", lessonIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const assignments = assignmentsError
      ? []
      : (assignmentsData ?? []).map((assignment: { id: string; title: string | null; lesson_id: string }) => ({
          id: assignment.id,
          title: assignment.title ?? "Assignment",
          lesson_id: assignment.lesson_id,
        }));

    const quizzes = quizzesError
      ? []
      : (quizzesData ?? []).map((quiz: { id: string; title: string | null; lesson_id: string }) => ({
          id: quiz.id,
          title: quiz.title ?? "Quiz",
          lesson_id: quiz.lesson_id,
        }));

    const quizIds = quizzes.map((quiz) => quiz.id);

    const quizQuestions = await fetchQuizQuestionsWithFallback(quizIds);

    return {
      course: {
        id: course.id,
        title: course.title,
        modules: modules
          .sort((first, second) => first.sort_order - second.sort_order)
          .map((module) => ({
            id: module.id,
            title: module.title,
            sortOrder: module.sort_order,
            lessons: normalizedLessons
              .filter((lesson) => lesson.module_id === module.id)
              .sort((first, second) => first.sort_order - second.sort_order)
              .map((lesson, lessonIndex) => {
                const media = normalizeVideoSources(lesson.video_value);
                const hasPreviousRequirement = lessonIndex > 0;
                const lessonAssignments = assignments
                  .filter((assignment) => assignment.lesson_id === lesson.id)
                  .map((assignment) => ({
                    id: assignment.id,
                    title: assignment.title,
                    unlocksLessonId: null,
                  }));
                const lessonQuizzes = quizzes
                  .filter((quiz) => quiz.lesson_id === lesson.id)
                  .map((quiz) => ({
                    id: quiz.id,
                    title: quiz.title,
                    unlocksLessonId: null,
                    questions: quizQuestions
                      .filter((question) => question.quiz_id === quiz.id)
                      .map((question) => ({
                        id: question.id,
                        questionText: question.questionText,
                        options: question.options,
                        correctAnswer: question.correctAnswer,
                      })),
                  }));
                const hasEvaluations = lessonAssignments.length > 0 || lessonQuizzes.length > 0;

                return {
                  id: lesson.id,
                  title: lesson.title,
                  description: lesson.description,
                  videoUrl: media.videoUrl,
                  embedUrl: media.embedUrl,
                  computedLocked: hasPreviousRequirement ? lesson.is_locked && hasEvaluations : false,
                  sort_order: lesson.sort_order,
                  assignmentDone: false,
                  quizDone: false,
                  lessonCompleted: false,
                  assignments: lessonAssignments,
                  quizzes: lessonQuizzes,
                };
              }),
          })),
      },
    };
  } catch (error) {
    console.error("[getLearningData] Error:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * TODO: Submit assignment on Supabase
 */
export async function submitAssignment(
  assignmentId: string,
  content: string,
  token: string
) {
  try {
    const session = await getSessionFromToken(token);
    if (!session) throw new Error("Unauthorized");

    console.log("[submitAssignment] Submitting assignment:", assignmentId);

    // TODO: Create assignment submission record when table is available
    // For now, just log the submission
    return { message: "Assignment submitted (demo mode)" };
  } catch (error) {
    console.error("[submitAssignment] Error:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * TODO: Submit quiz attempt on Supabase
 */
export async function submitQuiz(
  quizId: string,
  answers: Array<{ questionId: string; answer: string }>,
  token: string
) {
  try {
    const session = await getSessionFromToken(token);
    if (!session) throw new Error("Unauthorized");

    console.log("[submitQuiz] Submitting quiz:", quizId);

    // TODO: Create quiz attempt record when table is available
    // For now, just log the submission
    return { score: 100 }; // Demo score
  } catch (error) {
    console.error("[submitQuiz] Error:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * TODO: Create payment request on Supabase
 */
export async function createPaymentRequest(
  courseId: string,
  method: "PAYMOB" | "FAWRY" | "INSTAPAY" | "VODAFONE_CASH",
  token: string
) {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser(
      token
    );

    if (authError || !authData.user) throw authError || new Error("Unauthorized");

    // TODO: Create payment request record
    const { error } = await supabase.from("payments").insert({
      user_id: authData.user.id,
      course_id: courseId,
      method,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return { message: "Payment request created" };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// TODO: Admin functions below need RLS policies for admin role verification

export function createAdmin(email: string, password: string, token: string) {
  // TODO: Implement createAdmin with Supabase
  return Promise.reject(new Error("TODO: Implement createAdmin with Supabase"));
}

export async function createLesson(
  payload: {
    moduleId: string;
    title: string;
    description?: string;
    videoUrl?: string;
    duration: string;
    sortOrder: number;
    isLocked?: boolean;
  },
  token: string
) {
  try {
    await getSessionFromToken(token);

    const { data, error } = await supabase.from("lessons").insert({
      section_id: payload.moduleId,
      title: payload.title,
      video_url: payload.videoUrl,
      duration: parseDurationMinutes(payload.duration),
      order_index: payload.sortOrder,
      is_free: !(payload.isLocked || false),
    }).select("id").single();

    if (!error && data) {
      return { message: "Lesson created", lessonId: data.id };
    }

    const { data: fallbackData, error: fallbackError } = await supabase.from("lessons").insert({
      module_id: payload.moduleId,
      title: payload.title,
      video_url: payload.videoUrl,
      duration: parseDurationMinutes(payload.duration),
      sort_order: payload.sortOrder,
      is_locked: payload.isLocked || false,
    }).select("id").single();

    if (fallbackError || !fallbackData) {
      throw new Error(getReadableError(fallbackError ?? error, "Failed to create lesson"));
    }

    return { message: "Lesson created", lessonId: fallbackData.id };
  } catch (error) {
    throw new Error(getReadableError(error, "Failed to create lesson"));
  }
}

export async function updateLesson(
  lessonId: string,
  payload: {
    title?: string;
    description?: string;
    videoUrl?: string | null;
    duration?: string;
    sortOrder?: number;
    isLocked?: boolean;
  },
  token: string
) {
  try {
    await getSessionFromToken(token);

    const { error } = await supabase
      .from("lessons")
      .update({
        title: payload.title,
        video_url: payload.videoUrl,
        duration: payload.duration !== undefined ? parseDurationMinutes(payload.duration) : undefined,
        order_index: payload.sortOrder,
        is_free: payload.isLocked !== undefined ? !payload.isLocked : undefined,
      })
      .eq("id", lessonId);

    if (!error) {
      return { message: "Lesson updated" };
    }

    const { error: fallbackError } = await supabase
      .from("lessons")
      .update({
        title: payload.title,
        video_url: payload.videoUrl,
        duration: payload.duration !== undefined ? parseDurationMinutes(payload.duration) : undefined,
        sort_order: payload.sortOrder,
        is_locked: payload.isLocked,
      })
      .eq("id", lessonId);

    if (fallbackError) {
      throw new Error(getReadableError(fallbackError, "Failed to update lesson"));
    }

    return { message: "Lesson updated" };
  } catch (error) {
    throw new Error(getReadableError(error, "Failed to update lesson"));
  }
}

export async function deleteLesson(lessonId: string, token: string) {
  try {
    // TODO: Verify admin role using RLS
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) throw error;

    return { message: "Lesson deleted" };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export function createModule(
  payload: {
    courseId: string;
    title: string;
    sortOrder: number;
  },
  token: string,
) {
  return (async () => {
    try {
      // Primary schema: chapter(order_index)
      const { data: chapterData, error: chapterError } = await supabase
        .from("chapter")
        .insert({
          course_id: payload.courseId,
          title: payload.title,
          order_index: payload.sortOrder,
        })
        .select("id, course_id, title, order_index")
        .single();

      if (!chapterError && chapterData) {
        return {
          message: "Module created",
          module: {
            id: chapterData.id,
            course_id: chapterData.course_id,
            title: chapterData.title,
            sort_order: chapterData.order_index,
          },
        };
      }

      // Backward compatibility schema: course_modules(sort_order)
      const { data: moduleData, error: moduleError } = await supabase
        .from("course_modules")
        .insert({
          course_id: payload.courseId,
          title: payload.title,
          sort_order: payload.sortOrder,
        })
        .select("id, course_id, title, sort_order")
        .single();

      if (moduleError || !moduleData) {
        throw new Error(
          getReadableError(moduleError ?? chapterError, "Failed to create chapter"),
        );
      }

      return { message: "Module created", module: moduleData };
    } catch (error) {
      throw new Error(getReadableError(error, "Failed to create chapter"));
    }
  })();
}

export async function deleteModule(moduleId: string, token: string) {
  try {
    // TODO: Verify admin role using RLS
    const { error: chapterDeleteError } = await supabase
      .from("chapter")
      .delete()
      .eq("id", moduleId);

    if (!chapterDeleteError) {
      return { message: "Chapter deleted" };
    }

    const { error: moduleDeleteError } = await supabase
      .from("course_modules")
      .delete()
      .eq("id", moduleId);

    if (moduleDeleteError) {
      throw new Error(
        getReadableError(moduleDeleteError, getReadableError(chapterDeleteError, "Failed to delete chapter")),
      );
    }

    return { message: "Chapter deleted" };
  } catch (error) {
    throw new Error(getReadableError(error, "Failed to delete chapter"));
  }
}

export function createAssignment(
  payload: { lessonId: string; title: string; description: string; dueDate: string; unlocksLessonId?: string },
  token: string,
) {
  return (async () => {
    try {
      const { error } = await supabase.from("assignments").insert({
        lesson_id: payload.lessonId,
        title: payload.title,
        description: payload.description,
        due_date: payload.dueDate || null,
        unlocks_lesson_id: payload.unlocksLessonId ?? null,
      });

      if (error) {
        throw error;
      }

      return { message: "Assignment created" };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  })();
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
  return (async () => {
    try {
      const updates: Record<string, unknown> = {};

      if (payload.title !== undefined) {
        updates.title = payload.title;
      }

      if (payload.description !== undefined) {
        updates.description = payload.description;
      }

      if (payload.dueDate !== undefined) {
        updates.due_date = payload.dueDate || null;
      }

      if (payload.unlocksLessonId !== undefined) {
        updates.unlocks_lesson_id = payload.unlocksLessonId;
      }

      const { error } = await supabase.from("assignments").update(updates).eq("id", assignmentId);

      if (error) {
        throw error;
      }

      return { message: "Assignment updated" };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  })();
}

export function deleteAssignment(assignmentId: string, token: string) {
  return (async () => {
    try {
      const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);

      if (error) {
        throw error;
      }

      return { message: "Assignment deleted" };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  })();
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
  return (async () => {
    try {
      await getSessionFromToken(token);

      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          lesson_id: payload.lessonId,
          title: payload.title,
          unlocks_lesson_id: payload.unlocksLessonId ?? null,
        })
        .select("id")
        .single();

      if (quizError || !quiz) {
        throw new Error(getReadableError(quizError, "Failed to create quiz"));
      }

      if (payload.questions.length) {
        await insertQuizQuestionsWithFallback(quiz.id, payload.questions);
      }

      return { message: "Quiz created", quizId: quiz.id };
    } catch (error) {
      throw new Error(getReadableError(error, "Failed to create quiz"));
    }
  })();
}

export async function uploadLessonMedia(file: File, token: string) {
  await getSessionFromToken(token);

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "course-files";
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `lessons/${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
    upsert: true,
    cacheControl: "3600",
  });

  if (uploadError) {
    throw new Error(
      `${getReadableError(uploadError, "Failed to upload lesson media")}. Make sure storage bucket '${bucket}' exists and allows uploads.`,
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return {
    path: filePath,
    publicUrl: data.publicUrl,
    bucket,
  };
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
  return (async () => {
    try {
      const updates: Record<string, unknown> = {};

      if (payload.title !== undefined) {
        updates.title = payload.title;
      }

      if (payload.unlocksLessonId !== undefined) {
        updates.unlocks_lesson_id = payload.unlocksLessonId;
      }

      if (Object.keys(updates).length) {
        const { error } = await supabase.from("quizzes").update(updates).eq("id", quizId);

        if (error) {
          throw error;
        }
      }

      if (payload.questions) {
        await deleteQuizQuestionsWithFallback(quizId);

        if (payload.questions.length) {
          await insertQuizQuestionsWithFallback(quizId, payload.questions);
        }
      }

      return { message: "Quiz updated" };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  })();
}

export function deleteQuiz(quizId: string, token: string) {
  return (async () => {
    try {
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

      if (error) {
        throw error;
      }

      return { message: "Quiz deleted" };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  })();
}

export function getContentMap(courseId: string, token: string) {
  return (async () => {
    try {
      const courseFilter = courseId ? [courseId] : [];
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, title");

      if (coursesError) {
        throw coursesError;
      }

      const selectedCourses = courseFilter.length
        ? (courses ?? []).filter((course) => course.id === courseId)
        : (courses ?? []);

      const courseIds = selectedCourses.map((course) => course.id);

      const { data: modules, error: modulesError } = courseIds.length
        ? await supabase
            .from("chapter")
            .select("id, title, course_id, order_index")
            .in("course_id", courseIds)
        : { data: [], error: null };

      let normalizedModules = (modules ?? []).map(
        (module: { id: string; title: string | null; course_id: string; order_index?: number | null }) => ({
          id: module.id,
          title: module.title,
          course_id: module.course_id,
          sort_order: module.order_index ?? 0,
        }),
      );

      if (modulesError) {
        const { data: fallbackModules, error: fallbackModulesError } = courseIds.length
          ? await supabase.from("course_modules").select("id, title, course_id, sort_order").in("course_id", courseIds)
          : { data: [], error: null };

        if (fallbackModulesError) {
          throw fallbackModulesError;
        }

        normalizedModules = (fallbackModules ?? []).map(
          (module: { id: string; title: string | null; course_id: string; sort_order?: number | null }) => ({
            id: module.id,
            title: module.title,
            course_id: module.course_id,
            sort_order: module.sort_order ?? 0,
          }),
        );
      }

      const moduleIds = normalizedModules.map((module) => module.id);

      const { data: lessons, error: lessonsError } = moduleIds.length
        ? await supabase.from("lessons").select("id, title, section_id").in("section_id", moduleIds)
        : { data: [], error: null };

      let normalizedLessons = (lessons ?? []).map(
        (lesson: { id: string; title: string | null; section_id: string }) => ({
          id: lesson.id,
          title: lesson.title,
          module_id: lesson.section_id,
        }),
      );

      if (lessonsError) {
        const { data: fallbackLessons, error: fallbackLessonsError } = moduleIds.length
          ? await supabase.from("lessons").select("id, title, module_id").in("module_id", moduleIds)
          : { data: [], error: null };

        if (fallbackLessonsError) {
          throw fallbackLessonsError;
        }

        normalizedLessons = (fallbackLessons ?? []).map(
          (lesson: { id: string; title: string | null; module_id: string }) => ({
            id: lesson.id,
            title: lesson.title,
            module_id: lesson.module_id,
          }),
        );
      }

      const lessonIds = normalizedLessons.map((lesson) => lesson.id);

      const [{ data: assignments, error: assignmentsError }, { data: quizzes, error: quizzesError }] = await Promise.all([
        lessonIds.length
          ? supabase.from("assignments").select("id, title, lesson_id, unlocks_lesson_id").in("lesson_id", lessonIds)
          : Promise.resolve({ data: [], error: null }),
        lessonIds.length
          ? supabase.from("quizzes").select("id, title, lesson_id, unlocks_lesson_id").in("lesson_id", lessonIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (assignmentsError) {
        throw assignmentsError;
      }

      if (quizzesError) {
        throw quizzesError;
      }

      const courseMap = Object.fromEntries((selectedCourses ?? []).map((course) => [course.id, course]));
      const moduleMap = Object.fromEntries(normalizedModules.map((module) => [module.id, module]));

      return {
        lessons: normalizedLessons.map((lesson) => {
          const module = moduleMap[lesson.module_id];
          const course = module ? courseMap[module.course_id] : null;

          return {
            id: lesson.id,
            title: lesson.title,
            module: {
              id: module?.id ?? "",
              title: module?.title ?? "",
              course: {
                id: course?.id ?? "",
                title: course?.title ?? "",
              },
            },
            assignments: (assignments ?? [])
              .filter((assignment) => assignment.lesson_id === lesson.id)
              .map((assignment) => ({
                id: assignment.id,
                title: assignment.title,
                unlocksLessonId: assignment.unlocks_lesson_id ?? null,
              })),
            quizzes: (quizzes ?? [])
              .filter((quiz) => quiz.lesson_id === lesson.id)
              .map((quiz) => ({
                id: quiz.id,
                title: quiz.title,
                unlocksLessonId: quiz.unlocks_lesson_id ?? null,
              })),
          };
        }),
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  })();
}

export function getPayments(token: string) {
  return (async () => {
    try {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("id, status, method, reference_code, user_id, course_id, created_at");

      if (error) {
        throw error;
      }

      const userIds = [...new Set((payments ?? []).map((payment) => payment.user_id).filter(Boolean))];
      const courseIds = [...new Set((payments ?? []).map((payment) => payment.course_id).filter(Boolean))];

      const [{ data: users }, { data: courses }] = await Promise.all([
        userIds.length
          ? supabase.from("users").select("id, email, student_phone").in("id", userIds).then((result) => result)
          : Promise.resolve({ data: [] }),
        courseIds.length
          ? supabase.from("courses").select("id, title").in("id", courseIds).then((result) => result)
          : Promise.resolve({ data: [] }),
      ]);

      const userMap = Object.fromEntries((users ?? []).map((user) => [user.id, user]));
      const courseMap = Object.fromEntries((courses ?? []).map((course) => [course.id, course]));

      return {
        payments: (payments ?? []).map((payment) => ({
          id: payment.id,
          status: payment.status ?? "pending",
          method: payment.method ?? "manual",
          referenceCode: payment.reference_code ?? "",
          user: {
            email: userMap[payment.user_id]?.email ?? userMap[payment.user_id]?.student_phone ?? "",
          },
          course: {
            title: courseMap[payment.course_id]?.title ?? "Untitled Course",
          },
        })),
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  })();
}

export function updatePaymentStatus(paymentId: string, status: "PAID" | "FAILED" | "PENDING", token: string) {
  return (async () => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", paymentId);

      if (error) {
        throw error;
      }

      return { message: "Payment updated" };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  })();
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
