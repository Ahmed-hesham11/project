import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MainLoading() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`loading-card-${index}`} className="p-0">
              <Skeleton className="aspect-[16/10] rounded-none rounded-t-3xl" />
              <div className="space-y-4 p-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
