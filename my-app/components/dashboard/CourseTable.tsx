"use client";

import Image from "next/image";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Course } from "@/types/course";

interface CourseTableProps {
  courses: Course[];
  courseStatus: Record<string, boolean>;
  onToggleStatus: (courseId: string) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

const levelLabels = {
  Beginner: "الصف الأول الثانوي",
  Intermediate: "الصف الثاني الثانوي",
  Advanced: "الصف الثالث الثانوي",
} as const;

export function CourseTable({
  courses,
  courseStatus,
  onToggleStatus,
  onEdit,
  onDelete,
}: CourseTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--bg-main)]">
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Lessons</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {courses.map((course) => {
              const active = courseStatus[course.id] ?? true;
              return (
                <tr key={course.id} className="transition hover:bg-[var(--hover-soft)]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-[var(--border)]">
                        <Image
                          src={course.image || "/images/logo.jpg"}
                          alt={course.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-main)]">{course.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{course.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[var(--text-muted)]">{course.lessonsCount}</td>
                  <td className="px-4 py-4 text-[var(--text-muted)]">{course.students}</td>
                  <td className="px-4 py-4">
                    {course.price <= 0 ? (
                      <Badge className="border-emerald-300/30 bg-emerald-100 text-emerald-700">
                        Free
                      </Badge>
                    ) : (
                      <span className="font-medium text-[var(--text-main)]">${course.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-muted)]">{levelLabels[course.level]}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(course.id)}
                      className={`relative inline-flex h-7 w-12 items-center overflow-hidden rounded-full transition ${
                        active ? "bg-emerald-500" : "bg-[var(--border)]"
                      }`}
                      aria-label={`Toggle status for ${course.title}`}
                    >
                      <span
                        className={`absolute left-1 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <ButtonLink
                        href={`/dashboard/courses/${course.id}`}
                        variant="ghost"
                        className="h-9 px-3 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="mr-1 h-4 w-4" /> View
                      </ButtonLink>
                      <button
                        type="button"
                        onClick={() => onEdit(course)}
                        className="inline-flex h-9 items-center rounded-lg px-3 text-amber-600 transition hover:bg-amber-50"
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(course)}
                        className="inline-flex h-9 items-center rounded-lg px-3 text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
