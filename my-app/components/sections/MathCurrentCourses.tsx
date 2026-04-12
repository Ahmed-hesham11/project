import { CourseCard } from "@/components/courses/CourseCard";
import { getCourses } from "@/lib/api/courses";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Course } from "@/types/course";

export async function MathCurrentCourses() {
  let featuredCourses: Course[] = [];
  let errorMessage: string | null = null;

  try {
    featuredCourses = await getCourses(true);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Failed to load courses";
  }

  return (
    <section className="page-shell py-18">
      <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-8 xl:px-10">
        <div className="section-reveal text-right">
          <span className="inline-flex rounded-full border border-indigo-300/20 bg-indigo-400/10 px-6 py-3 text-lg font-bold text-indigo-200 shadow-sm">
            الكورسات الحالية
          </span>
          <h2 className="mt-5 font-display text-4xl font-bold leading-normal text-[var(--text-primary)]">
            ابدأ من الكورس المناسب لمستواك
          </h2>
        </div>

        {errorMessage ? (
          <div className="mt-10">
            <ErrorState title="تعذر تحميل الكورسات" description={errorMessage} />
          </div>
        ) : null}
        {!errorMessage && !featuredCourses.length ? (
          <div className="mt-10">
            <EmptyState title="لا توجد كورسات حالياً" description="حاول مرة أخرى بعد قليل." />
          </div>
        ) : null}
        {!errorMessage && featuredCourses.length ? (
          <div className="mt-10 grid gap-6 xl:grid-cols-3">
            {featuredCourses.map((course, index) => (
              <div
                key={course.id}
                className="section-reveal"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
