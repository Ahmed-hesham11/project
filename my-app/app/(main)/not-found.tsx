import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <EmptyState
          title="Course not found"
          description="The page you’re looking for doesn’t exist or may have moved."
          actionHref="/courses"
          actionLabel="Back to courses"
        />
      </div>
    </section>
  );
}
