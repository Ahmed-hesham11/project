"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { getStudentDashboard } from "@/lib/api/lms";

export default function StudentDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<{
    enrolledCourses: Array<{ id: string; title: string; tagline: string }>;
    submissionsCount: number;
    upcomingAssignments: Array<{ id: string; title: string; dueDate: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getStudentDashboard(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  return (
    <ProtectedRoute requiredRoles={["USER"]}>
      <section className="page-shell py-12">
        <div className="mx-auto w-full max-w-6xl px-5">
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Student Dashboard</h1>
          {error ? <p className="mt-4 text-rose-600">{error}</p> : null}
          {!data ? (
            <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
          ) : (
            <div className="mt-6 space-y-4 text-[var(--text-secondary)]">
              <p>Enrolled courses: {data.enrolledCourses.length}</p>
              <p>Submissions: {data.submissionsCount}</p>
              <p>Upcoming assignments: {data.upcomingAssignments.length}</p>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
