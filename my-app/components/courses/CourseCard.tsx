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

const levelLabels = {
  Beginner: "الصف الأول الثانوي",
  Intermediate: "الصف الثاني الثانوي",
  Advanced: "الصف الثالث الثانوي",
} as const;

export function CourseCard({
  course,
  actionLabel = "عرض التفاصيل",
  actionHref,
  hidePrice = false,
}: CourseCardProps) {
  return (
    <article className="surface-card surface-card-hover section-reveal group rounded-[30px]">
      <div className="relative aspect-[1.12/0.62] overflow-hidden rounded-[26px]">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),transparent_45%,rgba(15,23,42,0.46)_100%)]" />
        <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_18px_30px_-16px_rgba(79,70,229,0.45)]">
          {levelLabels[course.level]}
        </div>
        <div className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {course.category}
        </div>
      </div>

      <div className="px-6 pb-6 pt-5 text-right">
        <h3 className="text-xl font-bold leading-normal text-[var(--text-primary)]">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-base leading-7 text-[var(--text-secondary)]">
          {course.tagline}
        </p>

        <div className="mt-5 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
            {course.lessonsCount} درس
          </span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
            {course.modules.length} وحدات
          </span>
        </div>

        <div className="mt-6 h-px bg-[linear-gradient(90deg,rgba(79,70,229,0.18),rgba(6,182,212,0.16),transparent)]" />

        <div className="mt-5 flex items-center justify-between gap-4">
          <Link
            href={actionHref ?? `/courses/${course.id}`}
            className="interactive-lift inline-flex h-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-6 text-base font-semibold text-white shadow-[0_18px_34px_-18px_rgba(79,70,229,0.42)]"
          >
            {actionLabel}
          </Link>
          {!hidePrice ? (
            <p className="text-[1.35rem] font-black text-[var(--text-primary)]">
              {formatCoursePrice(course.price)}
            </p>
          ) : (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              مشترك
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
