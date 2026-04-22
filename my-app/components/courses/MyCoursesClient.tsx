"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { CourseGrid } from "./CourseGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getMyEnrollments } from "@/lib/api/enrollments";
import { Course } from "@/types/course";

export function MyCoursesClient() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const enrollments = await getMyEnrollments(token);
        const validCourses = enrollments
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .map((item) => item.course);
        setCourses(validCourses);
      } catch (fetchError) {
        console.error("[MyCoursesClient] Error:", fetchError);
        const errorMessage = fetchError instanceof Error ? fetchError.message : "Failed to load your courses";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <ProtectedRoute>
      <section className="page-shell py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-8 xl:px-10">
          <div className="section-reveal rounded-2xl border border-white/40 bg-white/30 p-6 text-right shadow-sm backdrop-blur-sm">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
              كورساتي
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-normal text-[var(--text-primary)] md:text-5xl">
              الكورسات التي اشتركت بها
            </h1>
            <p className="mt-3 text-base text-[var(--text-secondary)]">
              شاهد دروسك وتابع التقدم في أي وقت.
            </p>
          </div>

          {loading ? <p className="mt-6 text-[var(--text-secondary)]">جاري تحميل كورساتك...</p> : null}
          {error ? (
            <div className="mt-6">
              <ErrorState title="تعذر تحميل الكورسات" description={error} />
            </div>
          ) : null}
          {!loading && !error && !courses.length ? (
            <div className="mt-6">
              <EmptyState
                title="لا توجد كورسات مشتركة بعد"
                description="تصفح الكورسات واشترك في كورس ليظهر هنا."
                actionHref="/courses"
                actionLabel="تصفح الكورسات"
              />
            </div>
          ) : null}
          {!loading && !error && courses.length ? (
            <div className="section-reveal mt-6">
              <CourseGrid
                courses={courses}
                actionLabel="شاهد الآن"
                actionHrefBuilder={(course) => `/courses/${course.id}/learn`}
                hidePrice
              />
            </div>
          ) : null}
        </div>
      </section>
    </ProtectedRoute>
  );
}
