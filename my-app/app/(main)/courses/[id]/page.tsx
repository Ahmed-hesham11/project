import { notFound } from "next/navigation";

import { CourseDetails } from "@/components/courses/CourseDetails";
import { getCourseByIdOrSlug } from "@/lib/api/courses";

export default async function CourseDetailsPage(
  props: PageProps<"/courses/[id]">,
) {
  const { id } = await props.params;
  let course;
  try {
    course = await getCourseByIdOrSlug(id);
  } catch {
    course = null;
  }

  if (!course) {
    notFound();
  }

  return (
    <section className="page-shell py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <CourseDetails course={course} />
      </div>
    </section>
  );
}
