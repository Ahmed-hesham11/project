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
        setCourses(enrollments.map((item) => item.course));
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load your courses");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <ProtectedRoute>
      <section className="page-shell py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-8 xl:px-10">
          <h1 className="text-4xl font-bold text-white">My Courses</h1>
          {loading ? <p className="mt-6 text-slate-300">Loading your courses...</p> : null}
          {error ? (
            <div className="mt-6">
              <ErrorState title="Could not load courses" description={error} />
            </div>
          ) : null}
          {!loading && !error && !courses.length ? (
            <div className="mt-6">
              <EmptyState
                title="No enrolled courses yet"
                description="Browse courses and enroll in one to see it here."
                actionHref="/courses"
                actionLabel="Browse courses"
              />
            </div>
          ) : null}
          {!loading && !error && courses.length ? (
            <div className="mt-8">
              <CourseGrid
                courses={courses}
                actionLabel="شاهد الان"
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
