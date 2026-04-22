import { CoursesGridClient } from "@/components/courses/CoursesGridClient";
import { getCourses } from "@/lib/api/courses";
import { ErrorState } from "@/components/ui/ErrorState";
import { Course } from "@/types/course";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  let courses: Course[] = [];
  let errorMessage: string | null = null;
  try {
    courses = await getCourses();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Failed to load courses";
  }
  return (
    <section className="page-shell py-8 sm:py-10">
      <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-8 xl:px-10">
        <div className="section-reveal rounded-2xl border border-white/40 bg-white/30 p-6 text-right shadow-sm backdrop-blur-sm">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            الكورسات
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-normal text-[var(--text-primary)] md:text-5xl">
            جميع كورسات الرياضيات المتاحة على المنصة
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)]">
            اختار الكورس المناسب وابدأ التعلم مباشرة.
          </p>
        </div>

        <div className="section-reveal mt-6">
          {errorMessage ? (
            <ErrorState title="تعذر تحميل الكورسات" description={errorMessage} />
          ) : (
            <CoursesGridClient courses={courses} />
          )}
        </div>
      </div>
    </section>
  );
}
