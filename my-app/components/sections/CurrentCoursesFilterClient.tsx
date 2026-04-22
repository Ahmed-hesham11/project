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
        const courseIds = new Set<string>();
        enrollments.forEach((item) => {
          if (item) {
            courseIds.add(item.courseId);
          }
        });
        setEnrolledCourseIds(courseIds);
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
    <section className="relative overflow-hidden bg-white py-16 lg:py-20">
      <div className="ds-container relative">
        {/* Filter Chips */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full px-7 py-2.5 text-base font-semibold transition-all duration-300 ${
                activeFilter === filter.key
                  ? "bg-blue-600 text-white shadow-lg"
                  : "border border-gray-200 bg-white text-gray-600 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="mt-12">
          {filteredCourses.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}
