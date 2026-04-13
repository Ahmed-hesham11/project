"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { getLearningData, submitAssignment, submitQuiz } from "@/lib/api/lms";

type LearningData = Awaited<ReturnType<typeof getLearningData>>;
type LearningModule = LearningData["course"]["modules"][number];
type LearningLesson = LearningModule["lessons"][number];
type LearningAssignment = LearningLesson["assignments"][number];
type LearningQuiz = LearningLesson["quizzes"][number];
type LearningQuestion = LearningQuiz["questions"][number];
type SidebarLessonItem = LearningLesson & {
  moduleId: string;
  moduleTitle: string;
};

export default function LearnCoursePage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<LearningData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !params?.id) return;
    getLearningData(params.id, token).then(setData).catch((e) => setError(e.message));
  }, [token, params?.id]);

  const lessonItems = useMemo<SidebarLessonItem[]>(() => {
    if (!data) return [];

    return data.course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      })),
    );
  }, [data]);

  useEffect(() => {
    if (!lessonItems.length) {
      setSelectedLessonId(null);
      return;
    }

    const hasCurrent = selectedLessonId
      ? lessonItems.some((lesson) => lesson.id === selectedLessonId)
      : false;

    if (hasCurrent) return;

    const firstUnlocked = lessonItems.find((lesson) => !(lesson.computedLocked ?? false));
    setSelectedLessonId(firstUnlocked?.id ?? lessonItems[0].id);
  }, [lessonItems, selectedLessonId]);

  const selectedLesson = useMemo(
    () => lessonItems.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessonItems, selectedLessonId],
  );

  const selectedLessonIndex = selectedLesson
    ? lessonItems.findIndex((lesson) => lesson.id === selectedLesson.id)
    : -1;

  const canGoPrevious = selectedLessonIndex > 0;
  const canGoNext = selectedLessonIndex >= 0 && selectedLessonIndex < lessonItems.length - 1;

  const progressPercent = lessonItems.length
    ? Math.round((lessonItems.filter((lesson) => lesson.lessonCompleted).length / lessonItems.length) * 100)
    : 0;

  function goToPreviousLesson() {
    if (!canGoPrevious) return;
    setSelectedLessonId(lessonItems[selectedLessonIndex - 1].id);
  }

  function goToNextLesson() {
    if (!canGoNext) return;
    setSelectedLessonId(lessonItems[selectedLessonIndex + 1].id);
  }

  async function onSubmitAssignment(assignmentId: string) {
    if (!token) return;
    await submitAssignment(assignmentId, "Submitted from learning page", token);
    alert("Assignment submitted");
    if (params?.id) {
      const refreshed = await getLearningData(params.id, token);
      setData(refreshed);
    }
  }

  function setAnswer(questionId: string, answer: string) {
    setQuizAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  async function onSubmitQuiz(quiz: LearningQuiz) {
    if (!token) return;
    const answers = quiz.questions
      .map((question: LearningQuestion) => ({
        questionId: question.id,
        answer: quizAnswers[question.id],
      }))
      .filter((entry) => Boolean(entry.answer));

    if (answers.length !== quiz.questions.length) {
      alert("Please answer all quiz questions first");
      return;
    }

    const response = await submitQuiz(quiz.id, answers, token);
    alert(`Quiz submitted. Score: ${response.score.toFixed(2)}%`);
    if (params?.id) {
      const refreshed = await getLearningData(params.id, token);
      setData(refreshed);
    }
  }

  return (
    <ProtectedRoute requiredRoles={["USER"]}>
      <section className="page-shell py-10">
        <div className="mx-auto w-full max-w-[1450px] px-5 lg:px-8">
          <h1 className="text-right text-3xl font-bold text-white">صفحة المحتوى</h1>
          {error ? <p className="mt-4 text-rose-300">{error}</p> : null}
          {!data ? (
            <p className="mt-4 text-slate-300">Loading...</p>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5 rounded-3xl border border-white/10 bg-[#101625] p-5 text-slate-100 shadow-[0_24px_50px_-32px_rgba(0,0,0,0.85)] md:p-7">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-violet-300">{progressPercent}%</p>
                    <p className="text-sm text-slate-300">{data.course.title}</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6,#22d3ee)]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {!selectedLesson ? (
                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">
                    لا توجد دروس متاحة حاليًا.
                  </p>
                ) : (
                  <>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
                      <p className="text-sm text-slate-300">{selectedLesson.moduleTitle}</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">{selectedLesson.title}</h2>
                      {(selectedLesson.computedLocked ?? false) ? (
                        <p className="mt-3 text-amber-300">
                          هذا الدرس مقفول الآن. أكمل المتطلبات السابقة لفتحه.
                        </p>
                      ) : null}
                    </div>

                    {!(selectedLesson.computedLocked ?? false) && (selectedLesson.embedUrl ?? selectedLesson.videoUrl) ? (
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                        <iframe
                          className="h-[260px] w-full md:h-[430px]"
                          src={selectedLesson.embedUrl ?? selectedLesson.videoUrl ?? ""}
                          title={selectedLesson.title}
                          allowFullScreen
                        />
                      </div>
                    ) : null}

                    {!(selectedLesson.computedLocked ?? false) && selectedLesson.assignments.length ? (
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h3 className="text-lg font-bold text-white">الواجبات</h3>
                        <div className="space-y-2">
                          {selectedLesson.assignments.map((assignment: LearningAssignment) => (
                            <button
                              key={assignment.id}
                              onClick={() => onSubmitAssignment(assignment.id)}
                              className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-right transition hover:bg-white/20"
                            >
                              <span>{assignment.title}</span>
                              <span className="text-xs text-cyan-300">تسليم</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {!(selectedLesson.computedLocked ?? false) &&
                      selectedLesson.quizzes.map((quiz: LearningQuiz) => (
                        <div key={quiz.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-lg font-bold text-white">{quiz.title}</p>
                          {quiz.questions.map((question: LearningQuestion) => (
                            <div key={question.id} className="mt-3">
                              <p className="text-sm text-slate-200">{question.questionText}</p>
                              <div className="mt-2 grid gap-2">
                                {question.options.map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => setAnswer(question.id, option)}
                                    className={`rounded-lg border px-3 py-2 text-right text-sm ${
                                      quizAnswers[question.id] === option
                                        ? "border-violet-300 bg-violet-500/25 text-white"
                                        : "border-white/10 bg-white/10 text-slate-200"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => onSubmitQuiz(quiz)}
                            className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                          >
                            تسليم الاختبار
                          </button>
                        </div>
                      ))}

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        onClick={goToPreviousLesson}
                        disabled={!canGoPrevious}
                        className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        السابق
                      </button>
                      <button
                        onClick={goToNextLesson}
                        disabled={!canGoNext}
                        className="rounded-xl bg-[linear-gradient(135deg,#7c3aed,#22d3ee)] px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        التالي
                      </button>
                    </div>
                  </>
                )}
              </div>

              <aside className="rounded-3xl border border-white/10 bg-[#0f172a] p-4 text-white shadow-[0_24px_50px_-34px_rgba(0,0,0,0.9)]">
                <h2 className="mb-4 text-right text-2xl font-bold">محتوى المحاضرة</h2>
                <div className="max-h-[70vh] space-y-2 overflow-auto pr-1">
                  {lessonItems.map((lesson) => {
                    const active = selectedLessonId === lesson.id;
                    const locked = lesson.computedLocked ?? false;
                    const hasMedia = Boolean(lesson.embedUrl ?? lesson.videoUrl);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (!locked) setSelectedLessonId(lesson.id);
                        }}
                        className={`w-full rounded-2xl border px-3 py-3 text-right transition ${
                          active
                            ? "border-violet-400 bg-violet-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        } ${locked ? "opacity-60" : "opacity-100"}`}
                      >
                        <p className="text-sm font-semibold text-white">{lesson.title}</p>
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-300">
                          <span>{locked ? "مغلق" : hasMedia ? "(video)" : "(lesson)"}</span>
                          <span>{lesson.lessonCompleted ? "مكتمل" : "غير مكتمل"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
