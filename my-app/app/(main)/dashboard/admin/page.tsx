"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { createAdminCourse, deleteAdminCourse, getAdminCourses } from "@/lib/api/admin";
import { createAssignment, createLesson, createModule, createQuiz, deleteAssignment, deleteLesson, deleteQuiz, getContentMap, getPayments, updateAssignment, updateLesson, updatePaymentStatus, updateQuiz } from "@/lib/api/lms";

type SanitizedLesson = {
  id: string;
  title: string;
  module: { id: string; title: string; course: { id: string; title: string } };
  assignments: Array<{ id: string; title: string; unlocksLessonId?: string | null }>;
  quizzes: Array<{ id: string; title: string; unlocksLessonId?: string | null }>;
};

function sanitizeLessons(
  lessons: Array<{
    id: string;
    title: string | null;
    module: { id: string; title: string | null; course: { id: string; title: string | null } };
    assignments: Array<{ id: string; title: string | null; unlocksLessonId?: string | null }>;
    quizzes: Array<{ id: string; title: string | null; unlocksLessonId?: string | null }>;
  }>,
): SanitizedLesson[] {
  if (!lessons) return [];
  return lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title ?? "",
    module: {
      id: lesson.module?.id ?? "",
      title: lesson.module?.title ?? "",
      course: {
        id: lesson.module?.course?.id ?? "",
        title: lesson.module?.course?.title ?? "",
      },
    },
    assignments: (lesson.assignments ?? []).map((assignment) => ({
      id: assignment.id,
      title: assignment.title ?? "",
      unlocksLessonId: assignment.unlocksLessonId ?? null,
    })),
    quizzes: (lesson.quizzes ?? []).map((quiz) => ({
      id: quiz.id,
      title: quiz.title ?? "",
      unlocksLessonId: quiz.unlocksLessonId ?? null,
    })),
  }));
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Array<{ id: string; status: string; method: string; referenceCode: string; user: { email: string }; course: { title: string } }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; modules: Array<{ id: string; title: string; lessons: Array<{ id: string; title: string }> }> }>>([]);
  const [contentMap, setContentMap] = useState<Array<{
    id: string;
    title: string;
    module: { id: string; title: string; course: { id: string; title: string } };
    assignments: Array<{ id: string; title: string; unlocksLessonId?: string | null }>;
    quizzes: Array<{ id: string; title: string; unlocksLessonId?: string | null }>;
  }>>([]);
  const [message, setMessage] = useState("");
  const [courseForm, setCourseForm] = useState({
    slug: "",
    title: "",
    tagline: "",
    description: "",
    category: "رياضيات",
    level: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    duration: "10 ساعة",
    lessonsCount: 0,
    students: 0,
    rating: 0,
    price: 99,
    image: "/images/course-learning-products.svg",
    featured: false,
    mentorId: "mentor-waleed",
  });
  const [lessonForm, setLessonForm] = useState({
    moduleId: "",
    title: "",
    description: "",
    videoUrl: "",
    duration: "20 دقيقة",
    sortOrder: 1,
  });
  const [moduleForm, setModuleForm] = useState({
    courseId: "",
    title: "",
    sortOrder: 1,
  });
  const [assignmentForm, setAssignmentForm] = useState({
    lessonId: "",
    unlocksLessonId: "",
    title: "",
    description: "",
    dueDate: "",
  });
  const [quizForm, setQuizForm] = useState({
    lessonId: "",
    unlocksLessonId: "",
    title: "",
    questions: [
      {
        questionText: "",
        optionsText: "",
        correctAnswer: "",
      },
    ],
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.all([getPayments(token), getAdminCourses(token), getContentMap("", token)])
      .then(([paymentsRes, coursesRes, contentRes]) => {
        setPayments(paymentsRes.payments);
        setCourses(coursesRes);
        setContentMap(sanitizeLessons(contentRes.lessons));
      })
      .catch(() => undefined);
  }, [token]);

  const modules = useMemo(
    () =>
      courses.flatMap((course) =>
        course.modules.map((module) => ({
          id: module.id,
          title: `${course.title} - ${module.title}`,
        })),
      ),
    [courses],
  );

  const lessons = useMemo(
    () =>
      courses.flatMap((course) =>
        course.modules.flatMap((module) =>
          module.lessons.map((lesson) => ({
            id: lesson.id,
            title: `${course.title} - ${module.title} - ${lesson.title}`,
          })),
        ),
      ),
    [courses],
  );

  async function onCreateCourse(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createAdminCourse(courseForm, token);
    const coursesRes = await getAdminCourses(token);
    setCourses(coursesRes);
    setMessage("تم إضافة الكورس");
  }

  async function onCreateLesson(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createLesson(
      {
        ...lessonForm,
        sortOrder: Number(lessonForm.sortOrder),
      },
      token,
    );
    const coursesRes = await getAdminCourses(token);
    setCourses(coursesRes);
    const contentRes = await getContentMap("", token);
    setContentMap(sanitizeLessons(contentRes.lessons));
    setMessage("تم إضافة المحاضرة");
  }

  async function onCreateModule(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await createModule(
      {
        courseId: moduleForm.courseId,
        title: moduleForm.title,
        sortOrder: Number(moduleForm.sortOrder),
      },
      token,
    );
    const coursesRes = await getAdminCourses(token);
    setCourses(coursesRes);
    const contentRes = await getContentMap("", token);
    setContentMap(sanitizeLessons(contentRes.lessons));
    setMessage("تم إضافة موديول");
  }

  async function onCreateAssignment(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setFormError("");
    try {
      const dueDateIso = assignmentForm.dueDate
        ? new Date(assignmentForm.dueDate).toISOString()
        : "";
      await createAssignment(
        {
          lessonId: assignmentForm.lessonId,
          unlocksLessonId: assignmentForm.unlocksLessonId || undefined,
          title: assignmentForm.title,
          description: assignmentForm.description,
          dueDate: dueDateIso,
        },
        token,
      );
      const contentRes = await getContentMap("", token);
      setContentMap(sanitizeLessons(contentRes.lessons));
      setMessage("تم إضافة الواجب");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "فشل إضافة الواجب");
    }
  }

  async function onCreateQuiz(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setFormError("");
    try {
      const questions = quizForm.questions.map((question) => ({
        questionText: question.questionText,
        options: question.optionsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        correctAnswer: question.correctAnswer,
      }));
      await createQuiz(
        {
          lessonId: quizForm.lessonId,
          unlocksLessonId: quizForm.unlocksLessonId || undefined,
          title: quizForm.title,
          questions,
        },
        token,
      );
      const contentRes = await getContentMap("", token);
      setContentMap(sanitizeLessons(contentRes.lessons));
      setMessage("تم إضافة الكويز");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "فشل إضافة الكويز");
    }
  }

  function addQuizQuestion() {
    setQuizForm((current) => ({
      ...current,
      questions: [
        ...current.questions,
        { questionText: "", optionsText: "", correctAnswer: "" },
      ],
    }));
  }

  function removeQuizQuestion(index: number) {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.filter((_, i) => i !== index),
    }));
  }

  function updateQuizQuestion(
    index: number,
    field: "questionText" | "optionsText" | "correctAnswer",
    value: string,
  ) {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, i) =>
        i === index ? { ...question, [field]: value } : question,
      ),
    }));
  }

  async function onDeleteCourse(courseId: string) {
    if (!token) return;
    await deleteAdminCourse(courseId, token);
    const coursesRes = await getAdminCourses(token);
    setCourses(coursesRes);
    const contentRes = await getContentMap("", token);
    setContentMap(sanitizeLessons(contentRes.lessons));
  }

  async function onPaymentStatus(paymentId: string, status: "PAID" | "FAILED") {
    if (!token) return;
    await updatePaymentStatus(paymentId, status, token);
    const paymentsRes = await getPayments(token);
    setPayments(paymentsRes.payments);
  }

  async function onDeleteLesson(lessonId: string) {
    if (!token) return;
    await deleteLesson(lessonId, token);
    const [coursesRes, contentRes] = await Promise.all([getAdminCourses(token), getContentMap("", token)]);
    setCourses(coursesRes);
    setContentMap(sanitizeLessons(contentRes.lessons));
    setMessage("تم حذف المحاضرة");
  }

  async function onDeleteAssignment(assignmentId: string) {
    if (!token) return;
    await deleteAssignment(assignmentId, token);
    const contentRes = await getContentMap("", token);
    setContentMap(sanitizeLessons(contentRes.lessons));
    setMessage("تم حذف الواجب");
  }

  async function onDeleteQuiz(quizId: string) {
    if (!token) return;
    await deleteQuiz(quizId, token);
    const contentRes = await getContentMap("", token);
    setContentMap(sanitizeLessons(contentRes.lessons));
    setMessage("تم حذف الكويز");
  }

  async function onClearLessonVideo(lessonId: string) {
    if (!token) return;
    await updateLesson(lessonId, { videoUrl: null }, token);
    const contentRes = await getContentMap("", token);
    setContentMap(sanitizeLessons(contentRes.lessons));
    setMessage("تم حذف فيديو المحاضرة");
  }

  async function onRetargetAssignment(assignmentId: string, unlocksLessonId: string) {
    if (!token) return;
    await updateAssignment(assignmentId, { unlocksLessonId: unlocksLessonId || null }, token);
    const contentRes = await getContentMap("", token);
    setContentMap(sanitizeLessons(contentRes.lessons));
  }

  async function onRetargetQuiz(quizId: string, unlocksLessonId: string) {
    if (!token) return;
    await updateQuiz(quizId, { unlocksLessonId: unlocksLessonId || null }, token);
    const contentRes = await getContentMap("", token);
    setContentMap(sanitizeLessons(contentRes.lessons));
  }

  const fieldClass = "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)]";
  const areaClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-[var(--text-main)] placeholder:text-[var(--text-muted)]";
  const panelClass = "space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4";
  const actionButtonClass = "rounded bg-[linear-gradient(135deg,var(--primary),var(--accent))] px-4 py-2 text-white";

  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <section className="page-shell py-12">
        <div className="mx-auto w-full max-w-6xl px-5">
          <h1 className="text-3xl font-bold text-[var(--text-main)]">Admin Dashboard</h1>
          {message ? <p className="mt-3 text-emerald-600">{message}</p> : null}
          {formError ? <p className="mt-3 text-rose-600">{formError}</p> : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <form onSubmit={onCreateCourse} className={panelClass}>
              <h2 className="text-lg font-semibold text-[var(--text-main)]">إضافة كورس</h2>
              <input className={fieldClass} placeholder="slug" value={courseForm.slug} onChange={(e) => setCourseForm((p) => ({ ...p, slug: e.target.value }))} />
              <input className={fieldClass} placeholder="title" value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} />
              <input className={fieldClass} placeholder="tagline" value={courseForm.tagline} onChange={(e) => setCourseForm((p) => ({ ...p, tagline: e.target.value }))} />
              <textarea className={areaClass} placeholder="description" value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} />
              <input className={fieldClass} placeholder="price" type="number" value={courseForm.price} onChange={(e) => setCourseForm((p) => ({ ...p, price: Number(e.target.value) }))} />
              <button className={actionButtonClass}>إضافة كورس</button>
            </form>

            <form onSubmit={onCreateLesson} className={panelClass}>
              <h2 className="text-lg font-semibold text-[var(--text-main)]">رفع محاضرة</h2>
              <select className={fieldClass} value={lessonForm.moduleId} onChange={(e) => setLessonForm((p) => ({ ...p, moduleId: e.target.value }))}>
                <option value="">اختر الموديول</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                ))}
              </select>
              <input className={fieldClass} placeholder="عنوان المحاضرة" value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} />
              <input className={fieldClass} placeholder="YouTube URL" value={lessonForm.videoUrl} onChange={(e) => setLessonForm((p) => ({ ...p, videoUrl: e.target.value }))} />
              <button className={actionButtonClass}>إضافة محاضرة</button>
            </form>

            <form onSubmit={onCreateModule} className={panelClass}>
              <h2 className="text-lg font-semibold text-[var(--text-main)]">إضافة Module للكورس</h2>
              <select className={fieldClass} value={moduleForm.courseId} onChange={(e) => setModuleForm((p) => ({ ...p, courseId: e.target.value }))}>
                <option value="">اختر الكورس</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <input className={fieldClass} placeholder="عنوان الموديول" value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} />
              <input className={fieldClass} type="number" min={1} placeholder="الترتيب" value={moduleForm.sortOrder} onChange={(e) => setModuleForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} />
              <button className={actionButtonClass}>إضافة Module</button>
            </form>

            <form onSubmit={onCreateAssignment} className={panelClass}>
              <h2 className="text-lg font-semibold text-[var(--text-main)]">إضافة واجب</h2>
              <select className={fieldClass} value={assignmentForm.lessonId} onChange={(e) => setAssignmentForm((p) => ({ ...p, lessonId: e.target.value }))}>
                <option value="">اختر المحاضرة</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
              <select className={fieldClass} value={assignmentForm.unlocksLessonId} onChange={(e) => setAssignmentForm((p) => ({ ...p, unlocksLessonId: e.target.value }))}>
                <option value="">يفتح الحصة التالية تلقائيًا (بدون تخصيص)</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>يفتح: {lesson.title}</option>
                ))}
              </select>
              <input className={fieldClass} placeholder="عنوان الواجب" value={assignmentForm.title} onChange={(e) => setAssignmentForm((p) => ({ ...p, title: e.target.value }))} />
              <input className={fieldClass} type="datetime-local" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm((p) => ({ ...p, dueDate: e.target.value }))} />
              <textarea className={areaClass} placeholder="وصف الواجب" value={assignmentForm.description} onChange={(e) => setAssignmentForm((p) => ({ ...p, description: e.target.value }))} />
              <button className={actionButtonClass}>إضافة واجب</button>
            </form>

            <form onSubmit={onCreateQuiz} className={panelClass}>
              <h2 className="text-lg font-semibold text-[var(--text-main)]">إضافة كويز</h2>
              <select className={fieldClass} value={quizForm.lessonId} onChange={(e) => setQuizForm((p) => ({ ...p, lessonId: e.target.value }))}>
                <option value="">اختر المحاضرة</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
              <select className={fieldClass} value={quizForm.unlocksLessonId} onChange={(e) => setQuizForm((p) => ({ ...p, unlocksLessonId: e.target.value }))}>
                <option value="">يفتح الحصة التالية تلقائيًا (بدون تخصيص)</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>يفتح: {lesson.title}</option>
                ))}
              </select>
              <input className={fieldClass} placeholder="عنوان الكويز" value={quizForm.title} onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))} />
              {quizForm.questions.map((question, index) => (
                <div key={index} className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3">
                  <p className="mb-2 text-sm text-[var(--text-muted)]">سؤال {index + 1}</p>
                  <textarea
                    className={areaClass}
                    placeholder="السؤال"
                    value={question.questionText}
                    onChange={(e) => updateQuizQuestion(index, "questionText", e.target.value)}
                  />
                  <textarea
                    className={`${areaClass} mt-2`}
                    placeholder="الاختيارات - كل اختيار في سطر"
                    value={question.optionsText}
                    onChange={(e) => updateQuizQuestion(index, "optionsText", e.target.value)}
                  />
                  <input
                    className={`${fieldClass} mt-2`}
                    placeholder="الإجابة الصحيحة"
                    value={question.correctAnswer}
                    onChange={(e) => updateQuizQuestion(index, "correctAnswer", e.target.value)}
                  />
                  {quizForm.questions.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeQuizQuestion(index)}
                      className="mt-2 rounded bg-rose-500 px-3 py-1 text-white"
                    >
                      حذف السؤال
                    </button>
                  ) : null}
                </div>
              ))}
              <button type="button" onClick={addQuizQuestion} className="rounded bg-sky-500 px-4 py-2 text-white">
                إضافة سؤال آخر
              </button>
              <button className={actionButtonClass}>إضافة كويز</button>
            </form>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">الكورسات الحالية</h2>
            <div className="mt-3 space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3 text-[var(--text-main)]">
                  <span>{course.title}</span>
                  <button onClick={() => onDeleteCourse(course.id)} className="rounded bg-rose-500 px-3 py-1 text-white">حذف</button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">المدفوعات</h2>
            <div className="mt-3 space-y-2">
              {payments.map((payment) => (
                <div key={payment.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3 text-[var(--text-main)]">
                  <p>{payment.user.email} - {payment.course.title}</p>
                  <p>Method: {payment.method} | Status: {payment.status} | Ref: {payment.referenceCode}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => onPaymentStatus(payment.id, "PAID")} className="rounded bg-emerald-500 px-3 py-1 text-white">تأكيد الدفع</button>
                    <button onClick={() => onPaymentStatus(payment.id, "FAILED")} className="rounded bg-rose-500 px-3 py-1 text-white">رفض الدفع</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">Assignments / Quizzes Map</h2>
            <div className="mt-3 space-y-4">
              {contentMap.map((lesson) => (
                <div key={lesson.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3 text-[var(--text-main)]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">
                      {lesson.module.course.title} / {lesson.module.title} / {lesson.title}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => onClearLessonVideo(lesson.id)} className="rounded bg-amber-500 px-3 py-1 text-white">
                        Remove Video
                      </button>
                      <button onClick={() => onDeleteLesson(lesson.id)} className="rounded bg-rose-500 px-3 py-1 text-white">
                        Delete Lesson
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2">
                      <p className="font-medium">Assignments</p>
                      {lesson.assignments.map((assignment) => (
                        <div key={assignment.id} className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-2">
                          <p>{assignment.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <select
                              className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-2 text-[var(--text-main)]"
                              value={assignment.unlocksLessonId ?? ""}
                              onChange={(e) => onRetargetAssignment(assignment.id, e.target.value)}
                            >
                              <option value="">Unlock default next lesson</option>
                              {contentMap.map((targetLesson) => (
                                <option key={targetLesson.id} value={targetLesson.id}>
                                  {targetLesson.title}
                                </option>
                              ))}
                            </select>
                            <button onClick={() => onDeleteAssignment(assignment.id)} className="rounded bg-rose-500 px-3 py-1 text-white">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2">
                      <p className="font-medium">Quizzes</p>
                      {lesson.quizzes.map((quiz) => (
                        <div key={quiz.id} className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-2">
                          <p>{quiz.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <select
                              className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-2 text-[var(--text-main)]"
                              value={quiz.unlocksLessonId ?? ""}
                              onChange={(e) => onRetargetQuiz(quiz.id, e.target.value)}
                            >
                              <option value="">Unlock default next lesson</option>
                              {contentMap.map((targetLesson) => (
                                <option key={targetLesson.id} value={targetLesson.id}>
                                  {targetLesson.title}
                                </option>
                              ))}
                            </select>
                            <button onClick={() => onDeleteQuiz(quiz.id)} className="rounded bg-rose-500 px-3 py-1 text-white">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
