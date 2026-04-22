import Image from "next/image";
import Link from "next/link";

import { formatCoursePrice } from "@/lib/utils";
import { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  actionLabel?: string;
  actionHref?: string;
  hidePrice?: boolean;
}

function getGradeLabel(category: string) {
  if (category === "1") {
    return "أولى ثانوي";
  }

  if (category === "2") {
    return "تانية ثانوي";
  }

  if (category === "3") {
    return "تالتة ثانوي";
  }

  return category;
}

export function CourseCard({
  course,
  actionLabel = "عرض التفاصيل",
  actionHref,
  hidePrice = false,
}: CourseCardProps) {
  const isFree = course.price === 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Image
          src={course.image || "/images/logo.jpg"}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Grade Badge - Top Right */}
        <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
          {getGradeLabel(String(course.category))}
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-4 p-6 text-right">
        {/* Title */}
        <div>
          <h3 className="text-lg font-bold leading-tight text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
            {course.tagline}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap justify-end gap-2">
          <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {course.lessonsCount} درس
          </span>
          <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {course.modules.length} وحدات
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Price and CTA */}
        <div className="flex flex-col gap-3">
          {/* Price Highlight */}
          {!hidePrice && (
            <div className={`rounded-lg px-3 py-2 text-center font-semibold ${
              isFree
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {isFree ? "مجاني" : formatCoursePrice(course.price)}
            </div>
          )}

          {/* CTA Button */}
          <Link
            href={actionHref ?? `/courses/${course.id}`}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
          >
            {actionLabel}
          </Link>

          {/* Subscribed Badge */}
          {hidePrice && (
            <div className="rounded-lg bg-green-50 px-3 py-2 text-center text-sm font-semibold text-green-700">
              مشترك
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
