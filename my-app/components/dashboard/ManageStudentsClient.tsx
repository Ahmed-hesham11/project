"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AdminLayout } from "@/components/dashboard/AdminLayout";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { getAdminCourses, getAdminStudentsWithSearch, updateStudentEnrollments, updateStudentStatus } from "@/lib/api/admin";
import { Course } from "@/types/course";

interface AdminStudent {
  id: string;
  name: string;
  email: string;
  completionRate: number;
  enrolledCourseIds: string[];
}

function getReadableError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = [record.message, record.error, record.details, record.hint].find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export function ManageStudentsClient() {
  const { token, user } = useAuth();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    if (user?.role === "ADMIN" && !user.adminProfile?.canManageUsers) {
      setError("ليس لديك صلاحية إدارة الطلاب.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [studentsResponse, coursesResponse] = await Promise.all([
          getAdminStudentsWithSearch(search, token),
          getAdminCourses(token),
        ]);
        setStudents(studentsResponse);
        setCourses(coursesResponse);
      } catch (fetchError) {
        setError(getReadableError(fetchError, "Failed to load students"));
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user, search]);

  const editingStudent =
    students.find((student) => student.id === editingStudentId) ?? null;

  async function toggleStudentCourse(studentId: string, courseId: string) {
    const targetStudent = students.find((student) => student.id === studentId);
    if (!targetStudent || !token) return;

    const isEnrolled = targetStudent.enrolledCourseIds.includes(courseId);
    const nextCourseIds = isEnrolled
      ? targetStudent.enrolledCourseIds.filter((id) => id !== courseId)
      : [...targetStudent.enrolledCourseIds, courseId];

    try {
      await updateStudentEnrollments(studentId, nextCourseIds, token);
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === studentId
            ? { ...student, enrolledCourseIds: nextCourseIds }
            : student,
        ),
      );
    } catch (err) {
      console.error("Failed to update enrollments:", err);
      setError(getReadableError(err, "Failed to update enrollments"));
    }
  }

  return (
    <AdminLayout
      title="Manage Students"
      description="See every student, check their courses, and edit their subscriptions."
    >
      {error ? (
        <ErrorState title="Students failed to load" description={error} />
      ) : null}

      <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by student name, email, or ID"
          className="h-11 rounded-xl bg-[var(--bg-secondary)] px-3 text-[var(--text-main)] md:col-span-2"
        />
        <Button onClick={() => setSearch((value) => value.trim())}>Search</Button>
      </div>

      {loading ? <p className="text-[var(--text-secondary)]">Loading students...</p> : null}

      <div className="space-y-4">
        {students.map((student, index) => (
          <div
            key={student.id}
            className="dashboard-card rounded-[30px] border border-[var(--border)] bg-[var(--bg-card)] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xl font-semibold text-[var(--text-main)]">
                    {student.name}
                  </p>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {student.email}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  ID: {student.id}
                </p>
              </div>

              <div className="flex flex-col gap-3 xl:items-end">
                <div className="grid gap-2 text-sm text-[var(--text-secondary)]">
                  <p>{student.enrolledCourseIds.length} enrolled courses</p>
                  <p>{student.completionRate}% completion</p>
                </div>
                <Button
                  variant="secondary"
                  className="border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--primary-light)] hover:border-[var(--primary-light)] hover:bg-[var(--primary)] hover:text-[var(--text-main)]"
                  onClick={() => setEditingStudentId(student.id)}
                >
                  Edit Student
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(editingStudent)}
        title={editingStudent ? `Edit ${editingStudent.name}` : "Edit student"}
        description="Update the student's enrolled courses."
        onClose={() => setEditingStudentId(null)}
      >
        {editingStudent ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[var(--text-main)]">
                Enrolled Courses
              </p>
              <div className="mt-3 space-y-3">
                {courses.map((course) => {
                  const checked = editingStudent.enrolledCourseIds.includes(course.id);

                  return (
                    <label
                      key={course.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudentCourse(editingStudent.id, course.id)}
                        className="mt-1 h-4 w-4 rounded border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--primary-light)] focus:ring-[var(--primary-light)]"
                      />
                      <div>
                        <p className="font-medium text-[var(--text-main)]">
                          {course.title}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {course.tagline}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setEditingStudentId(null)}>Done</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
