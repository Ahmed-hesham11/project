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
  Beginner: "1st Secondary",
  Intermediate: "2nd Secondary",
  Advanced: "3rd Secondary",
} as const;

export function CourseTable({
  courses,
  courseStatus,
  onToggleStatus,
  onEdit,
  onDelete,
}: CourseTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/70 text-sm dark:divide-white/10">
          <thead className="bg-slate-50/80 dark:bg-slate-950/40">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Lessons</th>
              <th className="px-4 py-3">Students</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
            {courses.map((course) => {
              const active = courseStatus[course.id] ?? true;
              return (
                <tr key={course.id} className="transition hover:bg-sky-50/60 dark:hover:bg-sky-500/5">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{course.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{course.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{course.lessonsCount}</td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{course.students}</td>
                  <td className="px-4 py-4">
                    {course.price <= 0 ? (
                      <Badge className="border-emerald-300/30 bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                        Free
                      </Badge>
                    ) : (
                      <span className="font-medium text-slate-700 dark:text-slate-200">${course.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{levelLabels[course.level]}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(course.id)}
                      className={`relative inline-flex h-7 w-12 items-center overflow-hidden rounded-full transition ${
                        active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
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
                        className="h-9 px-3 text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
                      >
                        <Eye className="mr-1 h-4 w-4" /> View
                      </ButtonLink>
                      <button
                        type="button"
                        onClick={() => onEdit(course)}
                        className="inline-flex h-9 items-center rounded-lg px-3 text-amber-600 transition hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(course)}
                        className="inline-flex h-9 items-center rounded-lg px-3 text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
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
