"use client";

import Image from "next/image";
import { Pencil, Plus, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AdminLayout } from "@/components/dashboard/AdminLayout";
import { ChapterTree } from "@/components/dashboard/ChapterTree";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { getAdminCourses } from "@/lib/api/admin";
import { createLesson, createModule } from "@/lib/api/lms";
import { formatCurrency } from "@/lib/utils";
import { Course, CourseLesson, CourseModule } from "@/types/course";

interface CourseDetailsAdminClientProps {
  courseId: string;
}

interface LessonDraft {
  moduleId: string;
  title: string;
  videoUrl: string;
  isFree: boolean;
  orderIndex: string;
}

interface QuizAnswer {
  id: string;
  text: string;
}

interface QuizDraft {
  lessonId: string;
  question: string;
  imageUrl: string;
  answers: QuizAnswer[];
  correctAnswerId: string;
}

export function CourseDetailsAdminClient({ courseId }: CourseDetailsAdminClientProps) {
  const { token } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizDraft, setQuizDraft] = useState<QuizDraft | null>(null);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [isSavingChapter, setIsSavingChapter] = useState(false);

  async function reloadCourseDetails(authToken: string) {
    const courses = await getAdminCourses(authToken);
    const selected = courses.find((item) => item.id === courseId || item.slug === courseId) ?? null;
    setCourse(selected);
    setModules(selected?.modules ?? []);
  }

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await reloadCourseDetails(token);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load course details");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, token]);

  const totalVideos = useMemo(
    () => modules.reduce((sum, module) => sum + module.lessons.length, 0),
    [modules],
  );

  async function handleAddChapter() {
    if (!token || !course) return;

    const chapterNumber = modules.length + 1;
    setIsSavingChapter(true);
    setError(null);

    try {
      await createModule(
        {
          courseId: course.id,
          title: `New Chapter ${chapterNumber}`,
          sortOrder: chapterNumber,
        },
        token,
      );
      await reloadCourseDetails(token);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create chapter");
    } finally {
      setIsSavingChapter(false);
    }
  }

  function handleOpenLessonModal(moduleId: string) {
    setLessonDraft({
      moduleId,
      title: "",
      videoUrl: "",
      isFree: false,
      orderIndex: "1",
    });
    setIsLessonModalOpen(true);
  }

  async function handleSaveLesson() {
    if (!lessonDraft?.title.trim()) {
      setError("Lesson title is required");
      return;
    }
    if (!token) {
      setError("You must be logged in");
      return;
    }

    setIsSavingLesson(true);
    setError(null);

    try {
      await createLesson(
        {
          moduleId: lessonDraft.moduleId,
          title: lessonDraft.title.trim(),
          description: "",
          videoUrl: lessonDraft.videoUrl.trim() || undefined,
          duration: lessonDraft.videoUrl.trim() ? "Video" : "0 دقيقة",
          sortOrder: Number(lessonDraft.orderIndex) > 0 ? Number(lessonDraft.orderIndex) : 1,
          isLocked: !lessonDraft.isFree,
        },
        token,
      );

      await reloadCourseDetails(token);
      setIsLessonModalOpen(false);
      setLessonDraft(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save lesson");
    } finally {
      setIsSavingLesson(false);
    }
  }

  function handleOpenQuizModal(lessonId: string) {
    setQuizDraft({
      lessonId,
      question: "",
      imageUrl: "",
      answers: [
        { id: `a-${Date.now()}-1`, text: "" },
        { id: `a-${Date.now()}-2`, text: "" },
      ],
      correctAnswerId: "",
    });
    setIsQuizModalOpen(true);
  }

  function handleAddAnswer() {
    if (!quizDraft) return;
    setQuizDraft({
      ...quizDraft,
      answers: [...quizDraft.answers, { id: `a-${Date.now()}`, text: "" }],
    });
  }

  function handleSaveQuiz() {
    if (!quizDraft?.question.trim()) {
      setError("Question text is required");
      return;
    }
    if (!quizDraft.correctAnswerId) {
      setError("Select the correct answer");
      return;
    }
    setIsQuizModalOpen(false);
    setQuizDraft(null);
  }

  function handleReorderLessons(moduleId: string, sourceLessonId: string, targetLessonId: string) {
    setModules((current) =>
      current.map((module) => {
        if (module.id !== moduleId) return module;

        const lessons = [...module.lessons];
        const sourceIndex = lessons.findIndex((lesson) => lesson.id === sourceLessonId);
        const targetIndex = lessons.findIndex((lesson) => lesson.id === targetLessonId);

        if (sourceIndex < 0 || targetIndex < 0) {
          return module;
        }

        const [moved] = lessons.splice(sourceIndex, 1);
        lessons.splice(targetIndex, 0, moved);

        return {
          ...module,
          lessons,
        };
      }),
    );
  }

  if (loading) {
    return (
      <AdminLayout title="Course Details" description="Loading course details...">
        <p className="text-slate-300">Loading...</p>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout title="Course Details" description="This course could not be found.">
        <ErrorState title="Course not found" description={error ?? "Please go back to courses dashboard."} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Course Details" description="Manage chapters, students, and analytics.">
      {error ? <ErrorState title="Action error" description={error} /> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="relative h-52 w-full sm:h-64">
          <Image src={course.image} alt={course.title} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">{course.title}</h2>
                <p className="mt-1 text-sm text-slate-200">{course.tagline}</p>
              </div>
              <div className="rounded-xl bg-white/15 px-4 py-2 text-lg font-semibold backdrop-blur">{formatCurrency(course.price)}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">Students</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{course.students}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">Lessons</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{course.lessonsCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-xs text-slate-500 dark:text-slate-400">Videos</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{totalVideos}</p>
          </div>
        </div>

        <div className="flex justify-end px-5 pb-5">
          <Button variant="secondary" className="gap-2 border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <ChapterTree
        modules={modules}
        onAddChapter={handleAddChapter}
        onAddLesson={handleOpenLessonModal}
        onAddQuiz={handleOpenQuizModal}
        onReorderLessons={handleReorderLessons}
      />
      {isSavingChapter ? <p className="text-sm text-slate-300">Creating chapter...</p> : null}

      <Modal
        open={isLessonModalOpen && Boolean(lessonDraft)}
        title="Add Lesson"
        description="Create a lesson and define its video source and accessibility."
        onClose={() => setIsLessonModalOpen(false)}
      >
        {lessonDraft ? (
          <div className="space-y-4">
            <Input
              label="Title"
              value={lessonDraft.title}
              onChange={(event) => setLessonDraft({ ...lessonDraft, title: event.target.value })}
            />
            <Input
              label="Video URL (YouTube/Firebase)"
              value={lessonDraft.videoUrl}
              onChange={(event) => setLessonDraft({ ...lessonDraft, videoUrl: event.target.value })}
            />
            <Input
              label="Order index"
              type="number"
              min="1"
              value={lessonDraft.orderIndex}
              onChange={(event) => setLessonDraft({ ...lessonDraft, orderIndex: event.target.value })}
            />
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
              <span>Is Free</span>
              <button
                type="button"
                onClick={() => setLessonDraft({ ...lessonDraft, isFree: !lessonDraft.isFree })}
                className={`relative inline-flex h-7 w-12 items-center overflow-hidden rounded-full transition ${
                  lessonDraft.isFree ? "bg-emerald-500" : "bg-slate-500"
                }`}
              >
                <span
                  className={`absolute left-1 inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                    lessonDraft.isFree ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsLessonModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveLesson} disabled={isSavingLesson}>{isSavingLesson ? "Saving..." : "Save Lesson"}</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isQuizModalOpen && Boolean(quizDraft)}
        title="Add Quiz"
        description="Attach a quiz to this lesson with answer options and a correct answer."
        onClose={() => setIsQuizModalOpen(false)}
      >
        {quizDraft ? (
          <div className="space-y-4">
            <Input
              label="Question"
              value={quizDraft.question}
              onChange={(event) => setQuizDraft({ ...quizDraft, question: event.target.value })}
            />
            <Input
              label="Question image URL (optional)"
              value={quizDraft.imageUrl}
              onChange={(event) => setQuizDraft({ ...quizDraft, imageUrl: event.target.value })}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">Answers</p>
              {quizDraft.answers.map((answer) => (
                <label key={answer.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={quizDraft.correctAnswerId === answer.id}
                    onChange={() => setQuizDraft({ ...quizDraft, correctAnswerId: answer.id })}
                    className="h-4 w-4"
                  />
                  <input
                    value={answer.text}
                    onChange={(event) =>
                      setQuizDraft({
                        ...quizDraft,
                        answers: quizDraft.answers.map((item) =>
                          item.id === answer.id ? { ...item, text: event.target.value } : item,
                        ),
                      })
                    }
                    placeholder="Answer text"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-100 outline-none"
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={handleAddAnswer}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-sky-300 hover:bg-sky-500/10"
              >
                <Plus className="h-4 w-4" /> Add answer
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsQuizModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveQuiz}>Save Quiz</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
