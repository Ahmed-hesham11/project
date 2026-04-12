import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Course } from "@/types/course";

interface CourseGridProps {
  courses: Course[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  if (!courses.length) {
    return (
      <EmptyState
        title="No courses found"
        description="Try a different filter or add a new course to populate this grid."
        actionHref="/register"
        actionLabel="Browse plans"
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course, index) => (
        <div
          key={course.id}
          className="section-reveal"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <CourseCard course={course} />
        </div>
      ))}
    </div>
  );
}
