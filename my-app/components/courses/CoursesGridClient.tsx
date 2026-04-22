"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { getMyEnrollments } from "@/lib/api/enrollments";
import { Course } from "@/types/course";

interface CoursesGridClientProps {
  courses: Course[];
}

export function CoursesGridClient({ courses }: CoursesGridClientProps) {
  const { token } = useAuth();
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

  const enrolledSet = useMemo(() => enrolledCourseIds, [enrolledCourseIds]);

  return (
    <CourseGrid
      courses={courses}
      actionLabelBuilder={(course) => (enrolledSet.has(course.id) ? "شاهد الآن" : "عرض التفاصيل")}
      actionHrefBuilder={(course) =>
        enrolledSet.has(course.id) ? `/courses/${course.id}/learn` : `/courses/${course.id}`
      }
      hidePriceBuilder={(course) => enrolledSet.has(course.id)}
    />
  );
}
