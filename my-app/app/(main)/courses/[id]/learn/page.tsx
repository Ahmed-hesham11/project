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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 12.5l4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isDirectVideoLink(url: string | null | undefined) {
  if (!url) {
    return false;
  }

  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function isDirectAudioLink(url: string | null | undefined) {
  if (!url) {
    return false;
  }

  return /\.(mp3|wav|m4a|aac|ogg)(\?.*)?$/i.test(url);
}

function isPdfLink(url: string | null | undefined) {
  if (!url) {
    return false;
  }

  return /\.pdf(\?.*)?$/i.test(url);
}

function isImageLink(url: string | null | undefined) {
  if (!url) {
    return false;
  }

  return /\.(png|jpg|jpeg|webp|gif|bmp|svg)(\?.*)?$/i.test(url);
}

export default function LearnCoursePage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<LearningData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  useEffect(() => {
    if (!token || !params?.id) return;
    (async () => {
      try {
        const data = await getLearningData(params.id, token);
        setData(data);
      } catch (err) {
        console.error("[LearnCoursePage] Error loading course:", err);
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
        setError(errorMessage);
      }
    })();
  }, [token, params?.id]);

  const lessonItems = useMemo<SidebarLessonItem[]>(() => {
    if (!data) return [];

    return data.course.modules.flatMap((module: LearningModule) =>
      module.lessons.map((lesson: LearningLesson) => ({
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

  useEffect(() => {
    if (!lessonItems.length) {
      setCompletedLessonIds([]);
      return;
    }

    const initialCompleted = lessonItems
      .filter((lesson) => lesson.lessonCompleted)
      .map((lesson) => lesson.id);

    setCompletedLessonIds(initialCompleted);
  }, [lessonItems]);

  const totalLessons = lessonItems.length;
  const completedLessons = completedLessonIds.length;
  const progressPercent = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  function markLessonCompleted(lessonId: string) {
    setCompletedLessonIds((current) =>
      current.includes(lessonId) ? current : [...current, lessonId],
    );
  }

  function openLesson(lessonId: string, locked: boolean) {
    if (locked) return;
    setSelectedLessonId(lessonId);
    markLessonCompleted(lessonId);
  }

  function goToPreviousLesson() {
    if (!canGoPrevious) return;
    const targetLesson = lessonItems[selectedLessonIndex - 1];
    if (!targetLesson || (targetLesson.computedLocked ?? false)) return;
    setSelectedLessonId(targetLesson.id);
    markLessonCompleted(targetLesson.id);
  }

  function goToNextLesson() {
    if (!canGoNext) return;
    const targetLesson = lessonItems[selectedLessonIndex + 1];
    if (!targetLesson || (targetLesson.computedLocked ?? false)) return;
    setSelectedLessonId(targetLesson.id);
    markLessonCompleted(targetLesson.id);
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
      .filter((entry: { questionId: string; answer: string | undefined }) => Boolean(entry.answer));

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
    <ProtectedRoute>
      <section className="min-h-screen bg-[#f4f8ff] p-6 lg:p-10">
        <div className="mx-auto w-full max-w-[1480px]">
          <h1 className="text-right text-3xl font-bold text-slate-900">صفحة التعلم</h1>
          {error ? <p className="mt-4 text-rose-600">{error}</p> : null}
          {!data ? (
            <p className="mt-4 text-slate-500">Loading...</p>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-600">
                  <p>{completedLessons} / {totalLessons} lessons completed</p>
                  <p className="font-semibold text-blue-700">{progressPercent}%</p>
                </div>
                <div className="h-3 rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row">
                <aside className="order-1 w-full rounded-2xl bg-white p-4 shadow-sm transition-all lg:order-none lg:w-[340px]">
                  <h2 className="mb-4 text-right text-xl font-bold text-slate-900">محتوى الكورس</h2>
                  <div className="max-h-[70vh] space-y-2 overflow-auto pr-1">
                    {lessonItems.map((lesson) => {
                      const locked = lesson.computedLocked ?? false;
                      const isCurrent = selectedLessonId === lesson.id;
                      const isCompleted = completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => openLesson(lesson.id, locked)}
                          className={`w-full rounded-xl border px-3 py-3 text-right transition-all duration-200 ${
                            isCurrent
                              ? "border-blue-300 bg-blue-100"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          } ${locked ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-sm font-semibold ${isCompleted ? "text-slate-500" : "text-slate-900"}`}>
                                {lesson.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">{lesson.moduleTitle}</p>
                            </div>

                            {isCompleted ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <CheckIcon />
                              </span>
                            ) : isCurrent ? (
                              <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                                Current
                              </span>
                            ) : locked ? (
                              <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
                                Locked
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                Open
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <div className="w-full rounded-2xl bg-white p-5 shadow-sm transition-all lg:flex-1">
                  {!selectedLesson ? (
                    <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500">
                      لا توجد دروس متاحة حاليًا.
                    </p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-slate-500">{data.course.title}</p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedLesson.title}</h2>
                      </div>

                      {!(selectedLesson.computedLocked ?? false) && (selectedLesson.embedUrl || selectedLesson.videoUrl) ? (
                        <div className="overflow-hidden rounded-2xl shadow-2xl">
                          {selectedLesson.embedUrl ? (
                            <iframe
                              className="h-[260px] w-full md:h-[500px]"
                              src={selectedLesson.embedUrl}
                              title={selectedLesson.title}
                              allowFullScreen
                            />
                          ) : isDirectVideoLink(selectedLesson.videoUrl) ? (
                            <video
                              className="h-[260px] w-full bg-black md:h-[500px]"
                              src={selectedLesson.videoUrl}
                              controls
                              preload="metadata"
                              onPlay={() => markLessonCompleted(selectedLesson.id)}
                            />
                          ) : isDirectAudioLink(selectedLesson.videoUrl) ? (
                            <div className="p-5">
                              <audio
                                className="w-full"
                                src={selectedLesson.videoUrl}
                                controls
                                preload="metadata"
                                onPlay={() => markLessonCompleted(selectedLesson.id)}
                              />
                            </div>
                          ) : (
                            <div className="flex min-h-[360px] items-center justify-center p-6">
                              <div className="w-full max-w-[290px] rounded-2xl bg-slate-50 p-5 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-100">
                                  {isPdfLink(selectedLesson.videoUrl) ? (
                                    <div className="relative h-20 w-16 rounded-md bg-white shadow-sm">
                                      <div className="absolute right-0 top-0 h-5 w-5 rounded-bl-md bg-slate-200" />
                                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-rose-500 px-2 py-1 text-sm font-bold text-white">
                                        PDF
                                      </div>
                                    </div>
                                  ) : isImageLink(selectedLesson.videoUrl) ? (
                                    <div className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-blue-700">
                                      IMG
                                    </div>
                                  ) : (
                                    <div className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                                      FILE
                                    </div>
                                  )}
                                </div>

                                <p className="line-clamp-2 text-base font-semibold text-slate-900">
                                  {selectedLesson.title}
                                </p>

                                <a
                                  href={selectedLesson.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-block text-lg font-semibold text-blue-700 underline"
                                >
                                  تحميل
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-700">
                          هذا الدرس مغلق. أكمل الدروس السابقة أولًا.
                        </div>
                      )}

                      {!(selectedLesson.computedLocked ?? false) && selectedLesson.assignments.length ? (
                        <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <h3 className="text-lg font-bold text-slate-900">الواجبات</h3>
                          <div className="space-y-2">
                            {selectedLesson.assignments.map((assignment: LearningAssignment) => (
                              <button
                                key={assignment.id}
                                onClick={() => onSubmitAssignment(assignment.id)}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-right text-slate-900 transition hover:bg-slate-100"
                              >
                                <span>{assignment.title}</span>
                                <span className="text-xs text-blue-700">تسليم</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {!(selectedLesson.computedLocked ?? false) &&
                        selectedLesson.quizzes.map((quiz: LearningQuiz) => (
                          <div key={quiz.id} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-lg font-bold text-slate-900">{quiz.title}</p>
                            {quiz.questions.map((question: LearningQuestion) => (
                              <div key={question.id} className="mt-3">
                                <p className="text-sm text-slate-900">{question.questionText}</p>
                                <div className="mt-2 grid gap-2">
                                  {question.options.map((option: string) => (
                                    <button
                                      key={option}
                                      onClick={() => setAnswer(question.id, option)}
                                      className={`rounded-lg border px-3 py-2 text-right text-sm transition-all ${
                                        quizAnswers[question.id] === option
                                          ? "border-blue-400 bg-blue-100 text-slate-900"
                                          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
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
                              className="mt-4 rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white"
                            >
                              تسليم الاختبار
                            </button>
                          </div>
                        ))}

                      <div className="mt-6 flex items-center justify-between gap-3">
                        <button
                          onClick={goToPreviousLesson}
                          disabled={!canGoPrevious}
                          className="rounded-xl bg-blue-600 px-6 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous lesson
                        </button>
                        <button
                          onClick={goToNextLesson}
                          disabled={!canGoNext}
                          className="rounded-xl bg-blue-600 px-6 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next lesson
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
