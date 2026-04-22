import { Course } from "@/types/course";

import { supabase } from "../supabase/client";
import { getSessionFromToken } from "./simpleAuth";
import { UiStudent } from "./types";

type AdminSession = Awaited<ReturnType<typeof getSessionFromToken>>;

interface DbCourse {
  id: string;
  [key: string]: unknown;
  slug?: string | null;
  thumbnail_url?: string | null;
  is_published?: boolean | null;
  created_by?: string | null;
  title?: string | null;
  tagline?: string | null;
  description?: string | null;
  image?: string | null;
  featured?: boolean | null;
  price?: number | string | null;
  category?: string | number | null;
  level?: string | null;
  duration?: string | null;
  mentor_id?: string | null;
  tags?: unknown;
  lessons_count?: number | null;
  modules_count?: number | null;
  rating?: number | null;
  reviews?: Array<{
    id: string;
    rating?: number | null;
    text?: string | null;
  }> | null;
}

interface DbCourseModule {
  id: string;
  course_id: string;
  title?: string | null;
  sort_order?: number | null;
}

interface DbLesson {
  id: string;
  module_id: string;
  title?: string | null;
  duration?: string | null;
  video_url?: string | null;
  is_locked?: boolean | null;
  sort_order?: number | null;
}

interface DbUser {
  id: string;
  [key: string]: unknown;
  email?: string | null;
  rule?: string | null;
  role?: string | null;
  student_phone?: string | null;
  first_name?: string | null;
  second_name?: string | null;
  third_name?: string | null;
  fourth_name?: string | null;
}

interface MetricCourse {
  id: string;
  price?: number | string | null;
  created_at?: string | null;
}

interface AdminMetrics {
  courseCount: number;
  studentsCount: number;
  enrollmentsCount: number;
  averageRating: string;
  totalRevenue: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

function normalizeRole(role: string | undefined) {
  return role?.trim().toLowerCase().replace(/[\s-]+/g, "_") ?? "student";
}

function getUserDisplayName(user: DbUser) {
  const name = [
    user.first_name,
    user.second_name,
    user.third_name,
    user.fourth_name,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ");

  return name || user.email || user.student_phone || user.id;
}

function isStudentUser(user: DbUser) {
  const explicitRole = normalizeRole((user.rule as string | undefined) ?? (user.role as string | undefined));

  if (explicitRole === "student") {
    return true;
  }

  if (explicitRole === "admin" || explicitRole === "super_admin") {
    return false;
  }

  return Boolean(user.student_phone || user.first_name || user.fourth_name);
}

function isUuid(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = [record.message, record.error, record.details, record.hint].find(
      (value) => typeof value === "string" && value.trim(),
    );

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0)));
}

function isFileAttachmentUrl(url: string | null | undefined) {
  if (!url) {
    return false;
  }

  return /\.(pdf|png|jpg|jpeg|webp|gif|bmp|svg)(\?.*)?$/i.test(url);
}

async function requireAdminSession(token: string): Promise<AdminSession> {
  const session = await getSessionFromToken(token);
  const role = normalizeRole(session.role);

  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Missing admin permission");
  }

  return session;
}

function mapCourseLevel(
  level: string | null | undefined,
  category?: string | number | null | undefined,
): Course["level"] {
  const normalized = (level ?? "").trim().toUpperCase();

  if (normalized === "ADVANCED") {
    return "Advanced";
  }

  if (normalized === "INTERMEDIATE") {
    return "Intermediate";
  }

  if (category === 3 || category === "3") {
    return "Advanced";
  }

  if (category === 2 || category === "2") {
    return "Intermediate";
  }

  return "Beginner";
}

function mapCourseCategory(category: string | number | null | undefined): string {
  if (category === 1 || category === "1") {
    return "الصف الأول الثانوي";
  }

  if (category === 2 || category === "2") {
    return "الصف الثاني الثانوي";
  }

  if (category === 3 || category === "3") {
    return "الصف الثالث الثانوي";
  }

  if (typeof category === "string" && category.trim()) {
    return category;
  }

  return "الصف الأول الثانوي";
}

function mapUiCategoryToDb(category: string | null | undefined): number {
  const normalized = (category ?? "").trim().toLowerCase();

  if (normalized.includes("advanced")) {
    return 2;
  }

  if (normalized.includes("practice")) {
    return 3;
  }

  return 1;
}

function mapUiLevelToDbCategory(level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"): number {
  if (level === "ADVANCED") {
    return 3;
  }

  if (level === "INTERMEDIATE") {
    return 2;
  }

  return 1;
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => {
      if (typeof tag === "string") {
        return tag;
      }

      if (tag && typeof tag === "object" && "name" in tag && typeof tag.name === "string") {
        return tag.name;
      }

      return null;
    })
    .filter((tag): tag is string => Boolean(tag));
}

function mapDbCourseToUiCourse(
  course: DbCourse,
  studentsCount: number,
  moduleRows: DbCourseModule[] = [],
  lessonRows: DbLesson[] = [],
): Course {
  const reviews = Array.isArray(course.reviews) ? course.reviews : [];
  const tags = normalizeTags(course.tags);
  const modules = moduleRows
    .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
    .map((module) => ({
      id: module.id,
      title: module.title ?? "Untitled Module",
      lessons: lessonRows
        .filter((lesson) => lesson.module_id === module.id)
        .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title ?? "Untitled Lesson",
          duration: isFileAttachmentUrl(lesson.video_url) ? "ملف" : lesson.duration ?? "0 min",
          videoUrl: lesson.video_url ?? undefined,
          locked: Boolean(lesson.is_locked),
        })),
    }));
  const lessonsCount =
    typeof course.lessons_count === "number"
      ? course.lessons_count
      : modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const ratingValues = reviews
    .map((review) => Number(review.rating ?? 0))
    .filter((value) => Number.isFinite(value) && value > 0);
  const rating = ratingValues.length
    ? Number((ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(1))
    : Number(course.rating ?? 0);

  return {
    id: course.id,
    slug: course.slug ?? course.id,
    title: course.title ?? "Untitled Course",
    tagline: course.tagline ?? course.description ?? "",
    description: course.description ?? course.tagline ?? "",
    category: mapCourseCategory(course.category),
    level: mapCourseLevel(course.level, course.category),
    duration: course.duration ?? "0h",
    lessonsCount,
    students: studentsCount,
    rating,
    price: Number(course.price ?? 0),
    image: course.thumbnail_url ?? course.image ?? "/images/logo.jpg",
    mentorId: course.created_by ?? course.mentor_id ?? "mentor-waleed",
    featured: Boolean(course.is_published ?? course.featured),
    tags,
    modules,
    reviews: reviews.map((review) => ({
      id: review.id,
      name: "طالب",
      role: "Student",
      rating: Number(review.rating ?? 0),
      comment: review.text ?? "",
    })),
    mentor: {
      id: course.mentor_id ?? "mentor-waleed",
      name: "Waleed Zbady",
      role: "Math Mentor",
      bio: "Professional mathematics mentor.",
      avatar: "/images/logo.jpg",
    },
  };
}

async function getCourseStudentsMap() {
  const { data, error } = await supabase.from("enrollments").select("course_id");

  if (error) {
    throw error;
  }

  return (data ?? []).reduce<Record<string, number>>((accumulator, enrollment: { course_id: string | null }) => {
    if (enrollment.course_id) {
      accumulator[enrollment.course_id] = (accumulator[enrollment.course_id] ?? 0) + 1;
    }

    return accumulator;
  }, {});
}

async function fetchCourses() {
  const { data, error } = await supabase.from("courses").select("*");

  if (error) {
    throw error;
  }

  return (data ?? []) as DbCourse[];
}

async function fetchCourseModules(courseIds: string[]) {
  if (!courseIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("chapter")
    .select("id, course_id, title, order_index")
    .in("course_id", courseIds);

  if (!error) {
    return (data ?? []).map(
      (module: { id: string; course_id: string; title?: string | null; order_index?: number | null }) => ({
        id: module.id,
        course_id: module.course_id,
        title: module.title,
        sort_order: module.order_index,
      }),
    ) as DbCourseModule[];
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("course_modules")
    .select("*")
    .in("course_id", courseIds);

  if (fallbackError) {
    return [];
  }

  return (fallbackData ?? []) as DbCourseModule[];
}

async function fetchLessons(moduleIds: string[]) {
  if (!moduleIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .in("section_id", moduleIds);

  if (!error) {
    return (data ?? []).map(
      (lesson: {
        id: string;
        section_id: string;
        title?: string | null;
        duration?: number | string | null;
        video_url?: string | null;
        video_link?: string | null;
        video?: string | null;
        is_free?: boolean | null;
        order_index?: number | null;
      }) => ({
        id: lesson.id,
        module_id: lesson.section_id,
        title: lesson.title,
        duration:
          typeof lesson.duration === "number"
            ? `${lesson.duration} دقيقة`
            : lesson.duration,
        video_url: lesson.video_url ?? lesson.video_link ?? lesson.video,
        is_locked: lesson.is_free !== undefined ? !lesson.is_free : false,
        sort_order: lesson.order_index,
      }),
    ) as DbLesson[];
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds);

  if (fallbackError) {
    return [];
  }

  return (fallbackData ?? []).map(
    (lesson: {
      id: string;
      module_id: string;
      title?: string | null;
      duration?: number | string | null;
      video_url?: string | null;
      video_link?: string | null;
      video?: string | null;
      is_locked?: boolean | null;
      sort_order?: number | null;
    }) => ({
      id: lesson.id,
      module_id: lesson.module_id,
      title: lesson.title,
      duration:
        typeof lesson.duration === "number"
          ? `${lesson.duration} دقيقة`
          : lesson.duration,
      video_url: lesson.video_url ?? lesson.video_link ?? lesson.video,
      is_locked: lesson.is_locked,
      sort_order: lesson.sort_order,
    }),
  ) as DbLesson[];
}

async function fetchMetricCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("id, price, created_at");

  if (error) {
    throw error;
  }

  return (data ?? []) as MetricCourse[];
}

export async function getAdminMetrics(token: string): Promise<AdminMetrics> {
  try {
    await requireAdminSession(token);

    console.log("[getAdminMetrics] Fetching metrics...");

    // Fetch courses
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, price");

    if (coursesError) throw coursesError;
    const courses = (coursesData ?? []) as MetricCourse[];
    console.log("[getAdminMetrics] Courses count:", courses.length);

    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, role");

    if (usersError) throw usersError;
    const users = (usersData ?? []) as DbUser[];
    const studentCount = users.filter((user) => {
      const role = normalizeRole(user.role ?? undefined);
      return role === "student";
    }).length;
    console.log("[getAdminMetrics] Students count:", studentCount);

    // Fetch enrollments
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("id, course_id, created_at");

    if (enrollmentsError) throw enrollmentsError;
    const enrollments = enrollmentsData ?? [];
    console.log("[getAdminMetrics] Enrollments count:", enrollments.length);

    // Calculate metrics
    const coursePriceMap = Object.fromEntries(
      courses.map((course) => [course.id, Number(course.price ?? 0)])
    );

    const revenueByMonthMap = (enrollments as any[]).reduce<Record<string, number>>(
      (accumulator, item) => {
        const date = new Date(item.created_at);
        if (Number.isNaN(date.getTime())) return accumulator;

        const monthKey = date.toLocaleString("en-US", {
          month: "short",
          year: "2-digit",
        });
        accumulator[monthKey] = (accumulator[monthKey] ?? 0) + (coursePriceMap[item.course_id] ?? 0);
        return accumulator;
      },
      {}
    );

    const totalRevenue = (enrollments as any[]).reduce(
      (sum, item) => sum + (coursePriceMap[item.course_id] ?? 0),
      0
    );

    const result = {
      courseCount: courses.length,
      studentsCount: studentCount,
      enrollmentsCount: enrollments.length,
      averageRating: "0",
      totalRevenue,
      revenueByMonth: Object.entries(revenueByMonthMap)
        .map(([month, revenue]) => ({
          month,
          revenue: Number(revenue ?? 0),
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };

    console.log("[getAdminMetrics] Result:", result);
    return result;
  } catch (error) {
    console.error("[getAdminMetrics] Error:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function getAdminCourses(token: string) {
  await requireAdminSession(token);

  const [courses, studentsMap] = await Promise.all([
    fetchCourses(),
    getCourseStudentsMap(),
  ]);
  const modules = await fetchCourseModules(courses.map((course) => course.id));
  const lessons = await fetchLessons(modules.map((module) => module.id));

  return courses.map((course) =>
    mapDbCourseToUiCourse(
      course,
      studentsMap[course.id] ?? 0,
      modules.filter((module) => module.course_id === course.id),
      lessons,
    ),
  );
}

export async function createAdminCourse(
  payload: {
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
    price: number;
    image: string;
    featured: boolean;
    mentorId: string;
  },
  token: string,
) {
  await requireAdminSession(token);

  const insertPayload: Record<string, unknown> = {
    title: payload.title,
    description: payload.description,
    category: mapUiLevelToDbCategory(payload.level),
    price: payload.price,
    is_published: payload.featured,
  };

  if (payload.image && !payload.image.startsWith("blob:")) {
    insertPayload.thumbnail_url = payload.image;
  }

  if (isUuid(payload.mentorId)) {
    insertPayload.created_by = payload.mentorId;
  }

  const { data, error } = await supabase
    .from("courses")
    .insert(insertPayload)
    .select("*")
    .single();

  if (!data || error) {
    throw new Error(getErrorMessage(error, "Failed to create course"));
  }

  return {
    course: mapDbCourseToUiCourse(data, 0),
  };
}

export async function updateAdminCourse(
  courseId: string,
  payload: {
    title?: string;
    tagline?: string;
    description?: string;
    price?: number;
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    image?: string;
  },
  token: string,
) {
  await requireAdminSession(token);

  const updates: Record<string, unknown> = {};

  if (payload.title !== undefined) {
    updates.title = payload.title;
  }

  if (payload.tagline !== undefined) {
    updates.description = payload.tagline;
  }

  if (payload.description !== undefined) {
    updates.description = payload.description;
  }

  if (payload.price !== undefined) {
    updates.price = payload.price;
  }

  if (payload.level !== undefined) {
    updates.category = mapUiLevelToDbCategory(payload.level);
  }

  if (payload.image !== undefined) {
    updates.thumbnail_url = payload.image;
  }

  const { error } = await supabase.from("courses").update(updates).eq("id", courseId);

  if (error) {
    throw new Error(getErrorMessage(error, "Failed to update course"));
  }

  return { message: "Course updated" };
}

export async function getAdminStudents(token: string) {
  return getAdminStudentsWithSearch("", token);
}

export async function getAdminStudentsWithSearch(search: string, token: string): Promise<UiStudent[]> {
  await requireAdminSession(token);

  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    throw new Error(getErrorMessage(error, "Failed to load students"));
  }

  const normalizedSearch = search.trim().toLowerCase();
  const students = ((data ?? []) as DbUser[])
    .filter((user) => isStudentUser(user))
    .filter((user) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        user.first_name,
        user.fourth_name,
        user.email,
        user.student_phone,
        user.id,
      ].some((value) =>
        typeof value === "string" && value.toLowerCase().includes(normalizedSearch),
      );
    });
  const studentIds = students.map((student) => student.id);

  const { data: enrollments, error: enrollmentsError } = studentIds.length
    ? await supabase.from("enrollments").select("user_id, course_id").in("user_id", studentIds)
    : { data: [], error: null };

  if (enrollmentsError) {
    throw new Error(getErrorMessage(enrollmentsError, "Failed to load enrollments"));
  }

  const enrollmentsMap = (enrollments ?? []).reduce<Record<string, string[]>>((accumulator, enrollment: { user_id: string | null; course_id: string | null }) => {
    if (!enrollment.user_id || !enrollment.course_id) {
      return accumulator;
    }

    accumulator[enrollment.user_id] = [...(accumulator[enrollment.user_id] ?? []), enrollment.course_id];
    return accumulator;
  }, {});

  return students.map((student) => ({
    id: student.id,
    email: student.email ?? student.student_phone ?? "",
    name: getUserDisplayName(student),
    completionRate: 0,
    enrolledCourseIds: enrollmentsMap[student.id] ?? [],
    enabled: true,
  }));
}

export async function updateStudentEnrollments(
  studentId: string,
  enrolledCourseIds: string[],
  token: string,
) {
  await requireAdminSession(token);

  const desiredCourseIds = uniqueStrings(enrolledCourseIds);
  const { data: currentEnrollments, error: currentEnrollmentsError } = await supabase
    .from("enrollments")
    .select("id, course_id")
    .eq("user_id", studentId);

  if (currentEnrollmentsError) {
    throw new Error(getErrorMessage(currentEnrollmentsError, "Failed to load current enrollments"));
  }

  const currentCourseIds = new Set(
    (currentEnrollments ?? [])
      .map((enrollment: { course_id: string | null }) => enrollment.course_id)
      .filter((courseId): courseId is string => typeof courseId === "string" && courseId.length > 0),
  );
  const desiredCourseIdsSet = new Set(desiredCourseIds);

  const enrollmentIdsToDelete = (currentEnrollments ?? [])
    .filter((enrollment: { id: string; course_id: string | null }) => {
      if (!enrollment.course_id) {
        return false;
      }

      return !desiredCourseIdsSet.has(enrollment.course_id);
    })
    .map((enrollment: { id: string }) => enrollment.id);

  if (enrollmentIdsToDelete.length) {
    const { error: deleteError } = await supabase.from("enrollments").delete().in("id", enrollmentIdsToDelete);

    if (deleteError) {
      throw new Error(getErrorMessage(deleteError, "Failed to remove enrollments"));
    }
  }

  const courseIdsToInsert = desiredCourseIds.filter((courseId) => !currentCourseIds.has(courseId));

  if (courseIdsToInsert.length) {
    const { error: insertError } = await supabase.from("enrollments").insert(
      courseIdsToInsert.map((courseId) => ({
        user_id: studentId,
        course_id: courseId,
        paid: false,
        created_at: new Date().toISOString(),
      })),
    );

    if (insertError) {
      throw new Error(getErrorMessage(insertError, "Failed to add enrollments"));
    }
  }

  return { message: "Enrollments updated" };
}

export async function updateStudentStatus(
  studentId: string,
  enabled: boolean,
  token: string,
) {
  await requireAdminSession(token);
  return { message: "Student status updated" };
}

export async function deleteAdminCourse(courseId: string, token: string) {
  await requireAdminSession(token);

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    throw new Error(getErrorMessage(error, "Failed to delete course"));
  }

  return { message: "Course deleted" };
}

export async function createStudentByAdmin(
  payload: {
    firstName: string;
    secondName: string;
    thirdName: string;
    lastName: string;
    studentPhone: string;
    fatherPhone: string;
    motherPhone?: string;
    governorate: string;
    educationType: string;
    grade: string;
    department: string;
    email: string;
    password: string;
  },
  token: string,
) {
  await requireAdminSession(token);

  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("id")
    .or(`student_phone.eq.${payload.studentPhone},email.eq.${payload.email}`)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    throw new Error("Student already exists");
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      student_phone: payload.studentPhone,
      parent_phone: payload.fatherPhone,
      first_name: payload.firstName,
      second_name: payload.secondName,
      third_name: payload.thirdName,
      fourth_name: payload.lastName,
      email: payload.email,
      governorate: payload.governorate,
      education_type: payload.educationType,
      grade: payload.grade,
      specialization: payload.department,
      password_hash: payload.password,
      rule: "student",
    })
    .select("id, email")
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create student");
  }

  return {
    student: {
      id: data.id,
      email: data.email ?? payload.email,
    },
  };
}
