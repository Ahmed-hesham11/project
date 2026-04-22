import { mapCourse } from "./mappers";
import { supabase } from "../supabase/client";
import { CourseApiItem } from "./types";

interface DbCourseRow {
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
  lessons_count?: number | null;
  modules_count?: number | null;
  rating?: number | null;
}

interface DbModuleRow {
  id: string;
  course_id: string;
  [key: string]: unknown;
  title?: string | null;
  sort_order?: number | null;
}

interface DbLessonRow {
  id: string;
  module_id: string;
  [key: string]: unknown;
  title?: string | null;
  duration?: string | null;
  is_locked?: boolean | null;
  sort_order?: number | null;
}

function mapDbLevel(
  level: string | null | undefined,
  category?: string | number | null | undefined,
): CourseApiItem["level"] {
  const normalized = (level ?? "").trim().toUpperCase();

  if (normalized === "INTERMEDIATE") {
    return "INTERMEDIATE";
  }

  if (normalized === "ADVANCED") {
    return "ADVANCED";
  }

  if (category === 2 || category === "2") {
    return "INTERMEDIATE";
  }

  if (category === 3 || category === "3") {
    return "ADVANCED";
  }

  return "BEGINNER";
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

function toCourseApiItem(
  course: DbCourseRow,
  modules: DbModuleRow[] = [],
  lessons: DbLessonRow[] = [],
): CourseApiItem {
  const resolvedTitle = typeof course.title === "string" ? course.title : "Untitled Course";
  const resolvedTagline =
    typeof course.tagline === "string"
      ? course.tagline
      : typeof course.description === "string"
        ? course.description
        : "";

  return {
    id: course.id,
    slug: course.slug ?? course.id,
    title: resolvedTitle,
    tagline: resolvedTagline,
    description: course.description ?? course.tagline ?? "",
    category: mapCourseCategory(course.category),
    level: mapDbLevel(course.level, course.category),
    duration: course.duration ?? "0h",
    lessonsCount: lessons.length || course.lessons_count || 0,
    students: 0,
    rating: Number(course.rating ?? 0),
    price: Number(course.price ?? 0),
    image: course.thumbnail_url || course.image || "",
    featured: Boolean(course.is_published ?? course.featured),
    mentorId: course.created_by ?? course.mentor_id ?? "mentor-waleed",
    tags: [],
    reviews: [],
    modules: modules
      .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
      .map((module) => ({
        id: module.id,
        title: module.title ?? "Untitled Module",
        lessons: lessons
          .filter((lesson) => lesson.module_id === module.id)
          .sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0))
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title ?? "Untitled Lesson",
            duration: lesson.duration ?? "0m",
            locked: Boolean(lesson.is_locked),
          })),
      })),
  };
}

async function fetchCourseRows(featured?: boolean) {
  let query = supabase.from("courses").select("*");

  if (featured) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DbCourseRow[];
}

async function fetchModulesForCourses(courseIds: string[]) {
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
    ) as DbModuleRow[];
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("course_modules")
    .select("*")
    .in("course_id", courseIds);

  if (fallbackError) {
    return [];
  }

  return (fallbackData ?? []) as DbModuleRow[];
}

async function fetchLessonsForModules(moduleIds: string[]) {
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
        is_locked: lesson.is_free !== undefined ? !lesson.is_free : false,
        sort_order: lesson.order_index,
      }),
    ) as DbLessonRow[];
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
      is_locked: lesson.is_locked,
      sort_order: lesson.sort_order,
    }),
  ) as DbLessonRow[];
}

export async function getCourses(featured?: boolean) {
  try {
    const courses = await fetchCourseRows(featured);
    const courseIds = courses.map((course) => course.id);
    const modules = await fetchModulesForCourses(courseIds);
    const lessons = await fetchLessonsForModules(modules.map((module) => module.id));

    return courses.map((course) => {
      const courseModules = modules.filter((module) => module.course_id === course.id);
      const moduleIds = new Set(courseModules.map((module) => module.id));
      const courseLessons = lessons.filter((lesson) => moduleIds.has(lesson.module_id));

      return mapCourse(toCourseApiItem(course, courseModules, courseLessons));
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function getCourseByIdOrSlug(idOrSlug: string) {
  try {
    const { data: byId, error: idError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", idOrSlug)
      .maybeSingle();

    if (idError) {
      throw new Error(idError.message);
    }

    let data = byId as DbCourseRow | null;

    if (!data) {
      const allCourses = await fetchCourseRows();
      data =
        allCourses.find((course) => typeof course.slug === "string" && course.slug === idOrSlug) ??
        null;
    }

    if (!data) {
      throw new Error("Course not found");
    }

    const course = data as DbCourseRow;
    const modules = await fetchModulesForCourses([course.id]);
    const lessons = await fetchLessonsForModules(modules.map((module) => module.id));

    return mapCourse(toCourseApiItem(course, modules, lessons));
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
