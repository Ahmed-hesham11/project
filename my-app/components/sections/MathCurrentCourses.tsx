import { getCourses } from "@/lib/api/courses";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Course } from "@/types/course";
import { CurrentCoursesFilterClient } from "@/components/sections/CurrentCoursesFilterClient";

export async function MathCurrentCourses() {
  let featuredCourses: Course[] = [];
  let errorMessage: string | null = null;

  try {
    featuredCourses = await getCourses();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Failed to load courses";
  }

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-20">
      <div className="ds-container">
        <div className="section-reveal text-right">
          <span className="inline-flex rounded-full border border-[var(--primary-light)] bg-[var(--primary-soft)] px-6 py-3 text-lg font-bold text-[var(--primary)] shadow-sm">
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
          <CurrentCoursesFilterClient courses={featuredCourses} />
        ) : null}
      </div>
    </section>
  );
}
