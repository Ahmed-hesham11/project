import { CoursesGridClient } from "@/components/courses/CoursesGridClient";
import { getCourses } from "@/lib/api/courses";
import { ErrorState } from "@/components/ui/ErrorState";
import { Course } from "@/types/course";

export default async function CoursesPage() {
  let courses: Course[] = [];
  let errorMessage: string | null = null;
  try {
    courses = await getCourses();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Failed to load courses";
  }
  return (
    <section className="page-shell py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 lg:px-8 xl:px-10">
        <div className="section-reveal max-w-3xl text-right">
          <span className="inline-flex rounded-full border border-indigo-300/20 bg-indigo-400/10 px-4 py-2 text-sm font-semibold text-indigo-200 shadow-sm">
            الكورسات
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-normal text-[var(--text-primary)] md:text-5xl">
            جميع كورسات الرياضيات المتاحة على المنصة
          </h1>
        </div>

        <div className="section-reveal mt-12">
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
