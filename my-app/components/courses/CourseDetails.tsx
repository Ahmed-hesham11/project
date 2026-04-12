"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { enrollInCourse } from "@/lib/api/enrollments";
import { createPaymentRequest } from "@/lib/api/lms";
import { formatCurrency } from "@/lib/utils";
import { Course } from "@/types/course";

interface CourseDetailsProps {
  course: Course;
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PAYMOB" | "FAWRY" | "INSTAPAY" | "VODAFONE_CASH">("PAYMOB");
  const mentor = course.mentor;
  const levelLabels = {
    Beginner: "الصف الأول الثانوي",
    Intermediate: "الصف الثاني الثانوي",
    Advanced: "الصف الثالث الثانوي",
  } as const;

  async function handleEnroll() {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    setEnrolling(true);
    setEnrollError(null);
    try {
      await enrollInCourse(course.id, token);
      router.push("/my-courses");
    } catch (error) {
      setEnrollError(error instanceof Error ? error.message : "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  }

  async function handlePaymentRequest() {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }
    setEnrolling(true);
    setEnrollError(null);
    try {
      await createPaymentRequest(course.id, paymentMethod, token);
      setEnrollError("تم إنشاء طلب دفع، وسيتم تفعيل الاشتراك بعد المراجعة.");
    } catch (error) {
      setEnrollError(error instanceof Error ? error.message : "Payment request failed");
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-8">
        <div className="section-reveal relative aspect-[16/9] overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 shadow-[0_26px_54px_-34px_rgba(2,8,23,0.8)]">
          <Image
            src={course.image}
            alt={course.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.1),transparent_40%,rgba(15,23,42,0.7)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 text-white">
            <div>
              <p className="text-sm text-white/80">{course.category}</p>
              <h1 className="mt-2 text-3xl font-black md:text-4xl">{course.title}</h1>
            </div>
            <div className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              {levelLabels[course.level]}
            </div>
          </div>
        </div>

        <Card className="section-reveal">
          <div className="flex flex-wrap gap-2">
            <Badge>{levelLabels[course.level]}</Badge>
            {course.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <p className="mt-5 text-base leading-8 text-slate-300">
            {course.description}
          </p>
        </Card>

        <Card className="section-reveal">
          <h2 className="text-2xl font-bold text-white">
            محتوى الكورس
          </h2>
          <div className="mt-6 space-y-4">
            {course.modules.map((module, moduleIndex) => (
              <div
                key={module.id}
                className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_18px_34px_-26px_rgba(2,8,23,0.55)]"
                style={{ animationDelay: `${moduleIndex * 90}ms` }}
              >
                <h3 className="text-lg font-bold text-white">
                  {module.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="interactive-lift flex items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.76))] px-4 py-3 text-sm text-slate-300 shadow-[0_12px_26px_-24px_rgba(2,8,23,0.55)]"
                    >
                      <span>{lesson.title}</span>
                      <span className={lesson.locked ? "text-rose-300" : "text-sky-300"}>
                        {lesson.locked ? "مغلق" : lesson.duration}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="section-reveal">
          <Card className="space-y-5">
            <p className="text-sm font-semibold tracking-[0.24em] text-emerald-300">
              سجل الآن
            </p>
            <p className="text-4xl font-black text-white" dir="ltr">
              {formatCurrency(course.price)}
            </p>
            <p className="text-sm leading-7 text-slate-300">
              اشترك الآن للوصول لكل الدروس والاختبارات والمحتوى الكامل للكورس.
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-[linear-gradient(to_right,_var(--primary),_var(--secondary))] px-8 text-base font-medium text-white"
            >
              {enrolling ? "جاري الاشتراك..." : "ابدأ هذا الكورس"}
            </button>
            <label className="grid gap-2 text-sm text-slate-300">
              <span>طريقة الدفع</span>
              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as "PAYMOB" | "FAWRY" | "INSTAPAY" | "VODAFONE_CASH")
                }
                className="h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-white"
              >
                <option value="PAYMOB">Paymob</option>
                <option value="FAWRY">Fawry</option>
                <option value="INSTAPAY">Instapay</option>
                <option value="VODAFONE_CASH">Vodafone Cash</option>
              </select>
            </label>
            <button
              onClick={handlePaymentRequest}
              disabled={enrolling}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 text-base font-medium text-white"
            >
              {enrolling ? "جاري إنشاء الطلب..." : "طلب دفع يدوي"}
            </button>
            {enrollError ? <p className="text-sm text-rose-300">{enrollError}</p> : null}
          </Card>
        </div>

        {mentor ? (
          <Card className="section-reveal">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 shadow-sm">
                <Image
                  src="/images/logo.jpg"
                  alt={mentor.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-white">
                  {mentor.name}
                </p>
                <p className="text-sm text-slate-400">
                  {mentor.role}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              خبرة أكثر من 20 سنة في تدريس مادة الرياضيات
              (عام - أزهري - أدبي) مع أسلوب مبسط يركز على
              الفهم العميق والتدرج في حل الأسئلة.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
