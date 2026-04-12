"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AdminLayout } from "@/components/dashboard/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { getAdminCourses, updateAdminCourse } from "@/lib/api/admin";
import { formatCurrency } from "@/lib/utils";
import { Course } from "@/types/course";

const levelLabels = {
  Beginner: "الصف الأول الثانوي",
  Intermediate: "الصف الثاني الثانوي",
  Advanced: "الصف الثالث الثانوي",
} as const;

type CourseLevel = Course["level"];

interface CourseDraft {
  title: string;
  tagline: string;
  price: string;
  level: CourseLevel;
}

export function ManageCoursesClient() {
  const { token, user } = useAuth();
  const [managedCourses, setManagedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CourseDraft | null>(null);

  useEffect(() => {
    if (!token) return;
    if (user?.role === "ADMIN" && !user.adminProfile?.canManageCourses) {
      setError("ليس لديك صلاحية إدارة الكورسات. اطلب من السوبر أدمن تفعيل صلاحية Manage Courses.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const courses = await getAdminCourses(token);
        setManagedCourses(courses);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error && fetchError.message.includes("Missing admin permission")
            ? "ليس لديك صلاحية إدارة الكورسات."
            : fetchError instanceof Error
              ? fetchError.message
              : "Failed to load courses",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user]);

  const editingCourse = useMemo(
    () => managedCourses.find((course) => course.id === editingCourseId) ?? null,
    [editingCourseId, managedCourses],
  );

  function openEditor(course: Course) {
    setEditingCourseId(course.id);
    setDraft({
      title: course.title,
      tagline: course.tagline,
      price: String(course.price),
      level: course.level,
    });
  }

  function closeEditor() {
    setEditingCourseId(null);
    setDraft(null);
  }

  function updateDraft<Key extends keyof CourseDraft>(key: Key, value: CourseDraft[Key]) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [key]: value,
          }
        : currentDraft,
    );
  }

  async function saveCourseEdits() {
    if (!editingCourseId || !draft) {
      return;
    }

    const parsedPrice = Number(draft.price);
    const levelMap = {
      Beginner: "BEGINNER",
      Intermediate: "INTERMEDIATE",
      Advanced: "ADVANCED",
    } as const;

    if (token) {
      await updateAdminCourse(
        editingCourseId,
        {
          title: draft.title.trim(),
          tagline: draft.tagline.trim(),
          price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
          level: levelMap[draft.level],
        },
        token,
      );
    }

    setManagedCourses((currentCourses) =>
      currentCourses.map((course) =>
        course.id === editingCourseId
          ? {
              ...course,
              title: draft.title.trim() || course.title,
              tagline: draft.tagline.trim() || course.tagline,
              price: Number.isFinite(parsedPrice) ? parsedPrice : course.price,
              level: draft.level,
            }
          : course,
      ),
    );

    closeEditor();
  }

  return (
    <AdminLayout
      title="Manage Courses"
      description="See every course, enter each one, and manage its teaching content."
    >
      {error ? (
        <ErrorState title="Courses failed to load" description={error} />
      ) : null}
      {loading ? <p className="text-slate-300">Loading courses...</p> : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {managedCourses.map((course, index) => (
          <div
            key={course.id}
            className="dashboard-card rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.84))] p-7 shadow-[0_24px_48px_-30px_rgba(2,8,23,0.82)]"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xl font-semibold text-white">
                {course.title}
              </p>
              <Badge className="border-sky-300/20 bg-sky-400/10 text-sky-200">
                {levelLabels[course.level]}
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {course.tagline}
            </p>
            <div className="mt-5 grid gap-2 text-sm text-slate-400">
              <p>{course.lessonsCount} lessons</p>
              <p>{course.modules.length} modules</p>
              <p>{course.students.toLocaleString("en-US")} students</p>
              <p>{formatCurrency(course.price)}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink
                href={`/courses/${course.id}`}
                variant="secondary"
                className="px-5 border-white/10 bg-white/6 text-sky-200 hover:border-sky-300/30 hover:bg-sky-400/10 hover:text-white"
              >
                View Course
              </ButtonLink>
              <Button className="px-5" onClick={() => openEditor(course)}>
                Edit Course
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(editingCourse && draft)}
        title={editingCourse ? `Edit ${editingCourse.title}` : "Edit course"}
        description="Update the course card details shown in the dashboard."
        onClose={closeEditor}
      >
        {editingCourse && draft ? (
          <div className="space-y-5">
            <Input
              label="Course title"
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
            />
            <Input
              label="Short description"
              value={draft.tagline}
              onChange={(event) => updateDraft("tagline", event.target.value)}
            />
            <Input
              label="Price"
              type="number"
              min="0"
              value={draft.price}
              onChange={(event) => updateDraft("price", event.target.value)}
            />

            <label className="grid gap-2 text-sm text-slate-300">
              <span className="font-medium text-white">Level</span>
              <select
                value={draft.level}
                onChange={(event) =>
                  updateDraft("level", event.target.value as CourseLevel)
                }
                className="h-12 rounded-2xl border border-white/10 bg-white/6 px-4 text-white outline-none transition focus:border-[var(--primary)]"
              >
                <option value="Beginner">الصف الأول الثانوي</option>
                <option value="Intermediate">الصف الثاني الثانوي</option>
                <option value="Advanced">الصف الثالث الثانوي</option>
              </select>
            </label>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                className="border-white/10 bg-white/6 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                onClick={closeEditor}
              >
                Cancel
              </Button>
              <Button onClick={saveCourseEdits}>Save</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
