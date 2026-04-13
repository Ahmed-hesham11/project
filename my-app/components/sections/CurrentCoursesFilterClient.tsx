"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { CourseCard } from "@/components/courses/CourseCard";
import { getMyEnrollments } from "@/lib/api/enrollments";
import { EmptyState } from "@/components/ui/EmptyState";
import { Course } from "@/types/course";

type GradeFilter = "all" | "Beginner" | "Intermediate" | "Advanced";

const filters: Array<{ key: GradeFilter; label: string }> = [
  { key: "all", label: "الكل" },
  { key: "Beginner", label: "اولي ثانوي" },
  { key: "Intermediate", label: "ثانيه ثانوي" },
  { key: "Advanced", label: "تالته ثانوي" },
];

interface CurrentCoursesFilterClientProps {
  courses: Course[];
}

export function CurrentCoursesFilterClient({ courses }: CurrentCoursesFilterClientProps) {
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] = useState<GradeFilter>("all");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) {
      setEnrolledCourseIds(new Set());
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const enrollments = await getMyEnrollments(token);
        if (cancelled) return;
        setEnrolledCourseIds(new Set(enrollments.map((item) => item.courseId)));
      } catch {
        if (!cancelled) {
          setEnrolledCourseIds(new Set());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredCourses = useMemo(() => {
    if (activeFilter === "all") {
      return courses;
    }
    return courses.filter((course) => course.level === activeFilter);
  }, [activeFilter, courses]);

  return (
    <div className="mt-10">
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`rounded-2xl border px-6 py-3 text-lg font-bold transition ${
              activeFilter === filter.key
                ? "border-transparent bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-white shadow-[0_18px_30px_-18px_rgba(79,70,229,0.55)]"
                : "border-white/10 bg-white/8 text-slate-200 hover:-translate-y-0.5 hover:border-sky-300/35 hover:bg-sky-400/10 hover:text-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredCourses.length ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className="section-reveal"
              style={{ animationDelay: `${index * 110}ms` }}
            >
              <CourseCard
                course={course}
                actionLabel={enrolledCourseIds.has(course.id) ? "شاهد الآن" : "عرض التفاصيل"}
                actionHref={enrolledCourseIds.has(course.id) ? `/courses/${course.id}/learn` : undefined}
                hidePrice={enrolledCourseIds.has(course.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد كورسات لهذا الصف"
          description="اختار صف مختلف أو ارجع لعرض كل الكورسات."
        />
      )}
    </div>
  );
}
