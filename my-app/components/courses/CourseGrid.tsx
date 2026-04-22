import { CourseCard } from "@/components/courses/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Course } from "@/types/course";

interface CourseGridProps {
  courses: Course[];
  actionLabel?: string;
  actionLabelBuilder?: (course: Course) => string;
  actionHrefBuilder?: (course: Course) => string;
  hidePrice?: boolean;
  hidePriceBuilder?: (course: Course) => boolean;
}

export function CourseGrid({
  courses,
  actionLabel,
  actionLabelBuilder,
  actionHrefBuilder,
  hidePrice = false,
  hidePriceBuilder,
}: CourseGridProps) {
  if (!courses.length) {
    return (
      <EmptyState
        title="لا توجد كورسات حالياً"
        description="جرّب مرة أخرى بعد قليل أو أضف كورسات جديدة من لوحة التحكم."
        actionHref="/dashboard/courses"
        actionLabel="إدارة الكورسات"
      />
    );
  }

  const gridClassName =
    courses.length === 1
      ? "mx-auto grid max-w-[420px] gap-6 grid-cols-1"
      : "grid gap-6 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={gridClassName}>
      {courses.map((course, index) => (
        <div
          key={course.id}
          className="section-reveal"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <CourseCard
            course={course}
            actionLabel={actionLabelBuilder ? actionLabelBuilder(course) : actionLabel}
            actionHref={actionHrefBuilder?.(course)}
            hidePrice={hidePriceBuilder ? hidePriceBuilder(course) : hidePrice}
          />
        </div>
      ))}
    </div>
  );
}
