import { CourseDetailsAdminClient } from "@/components/dashboard/CourseDetailsAdminClient";

export default async function DashboardCourseDetailsPage(
  props: PageProps<"/dashboard/courses/[id]">,
) {
  const { id } = await props.params;

  return <CourseDetailsAdminClient courseId={id} />;
}
