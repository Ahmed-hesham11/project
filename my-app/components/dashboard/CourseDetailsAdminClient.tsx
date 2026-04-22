"use client";

import { BookOpen, Pencil, Users, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AdminLayout } from "@/components/dashboard/AdminLayout";
import { ChapterTree } from "@/components/dashboard/ChapterTree";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { getAdminCourses, updateAdminCourse } from "@/lib/api/admin";
import { createLesson, createModule, createQuiz, deleteLesson, deleteModule, uploadLessonMedia } from "@/lib/api/lms";
import { formatCurrency } from "@/lib/utils";
import { Course, CourseModule } from "@/types/course";

interface CourseDetailsAdminClientProps {
  courseId: string;
}

interface LessonDraft {
  moduleId: string;
  title: string;
  videoUrl: string;
  durationMinutes: string;
  orderIndex: string;
}

interface FileDraft {
  moduleId: string;
  title: string;
  orderIndex: string;
}

const ALLOWED_FILE_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"];

function isAllowedFileType(file: File) {
  const lowerName = file.name.toLowerCase();
  const isAllowedExtension = ALLOWED_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const isAllowedMime = file.type === "application/pdf" || file.type.startsWith("image/");

  return isAllowedExtension || isAllowedMime;
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

interface CourseEditDraft {
  title: string;
  description: string;
  price: string;
  image: string;
}

export function CourseDetailsAdminClient({ courseId }: CourseDetailsAdminClientProps) {
  const { token } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileDraft, setFileDraft] = useState<FileDraft | null>(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizDraft, setQuizDraft] = useState<QuizDraft | null>(null);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [isSavingChapter, setIsSavingChapter] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseDraft, setCourseDraft] = useState<CourseEditDraft | null>(null);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");

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

  function handleAddChapter() {
    setChapterTitle("");
    setIsChapterModalOpen(true);
  }

  async function handleSaveChapter() {
    if (!token || !course) return;

    const normalizedTitle = chapterTitle.trim();
    if (!normalizedTitle) {
      setError("Chapter title is required");
      return;
    }

    const chapterNumber = modules.length + 1;
    setIsSavingChapter(true);
    setError(null);

    try {
      const response = await createModule(
        {
          courseId: course.id,
          title: normalizedTitle,
          sortOrder: chapterNumber,
        },
        token,
      );
      const createdModule = response.module;

      setModules((currentModules) => [
        ...currentModules,
        {
          id: createdModule.id,
          title: createdModule.title ?? normalizedTitle,
          lessons: [],
        },
      ]);
      setIsChapterModalOpen(false);
      setChapterTitle("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create chapter");
    } finally {
      setIsSavingChapter(false);
    }
  }

  async function handleDeleteChapter(moduleId: string) {
    if (!token) return;

    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الفصل؟ سيتم حذفه من قاعدة البيانات.");
    if (!confirmed) return;

    setError(null);
    try {
      await deleteModule(moduleId, token);
      setModules((current) => current.filter((module) => module.id !== moduleId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete chapter");
    }
  }

  async function handleDeleteLesson(moduleId: string, lessonId: string) {
    if (!token) return;

    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الدرس؟ سيتم حذفه من قاعدة البيانات.");
    if (!confirmed) return;

    setError(null);
    try {
      await deleteLesson(lessonId, token);
      setModules((current) =>
        current.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
              }
            : module,
        ),
      );
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete lesson");
    }
  }

  function handleOpenEditModal() {
    if (!course) {
      return;
    }

    setCourseDraft({
      title: course.title,
      description: course.description || course.tagline,
      price: String(course.price),
      image: course.image,
    });
    setIsEditModalOpen(true);
  }

  async function handleSaveCourse() {
    if (!token || !course || !courseDraft) {
      return;
    }

    if (!courseDraft.title.trim()) {
      setError("Course title is required");
      return;
    }

    setIsSavingCourse(true);
    setError(null);

    try {
      await updateAdminCourse(
        course.id,
        {
          title: courseDraft.title.trim(),
          description: courseDraft.description.trim(),
          tagline: courseDraft.description.trim(),
          price: Number(courseDraft.price) || 0,
          image: courseDraft.image.trim() || undefined,
        },
        token,
      );

      setCourse((currentCourse) =>
        currentCourse
          ? {
              ...currentCourse,
              title: courseDraft.title.trim(),
              description: courseDraft.description.trim(),
              tagline: courseDraft.description.trim(),
              price: Number(courseDraft.price) || 0,
              image: courseDraft.image.trim() || currentCourse.image,
            }
          : currentCourse,
      );
      setIsEditModalOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update course");
    } finally {
      setIsSavingCourse(false);
    }
  }

  function handleOpenLessonModal(moduleId: string) {
    setLessonDraft({
      moduleId,
      title: "",
      videoUrl: "",
      durationMinutes: "10",
      orderIndex: "1",
    });
    setIsLessonModalOpen(true);
  }

  function handleOpenFileModal(moduleId: string) {
    setFileDraft({
      moduleId,
      title: "",
      orderIndex: "1",
    });
    setSelectedMediaFile(null);
    setIsFileModalOpen(true);
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
      const durationMinutes = Math.max(1, Number(lessonDraft.durationMinutes) || 10);

      await createLesson(
        {
          moduleId: lessonDraft.moduleId,
          title: lessonDraft.title.trim(),
          description: "",
          videoUrl: lessonDraft.videoUrl.trim() || undefined,
          duration: `${durationMinutes} دقيقة`,
          sortOrder: Number(lessonDraft.orderIndex) > 0 ? Number(lessonDraft.orderIndex) : 1,
          isLocked: true,
        },
        token,
      );

      // Update modules with new lesson
      setModules((currentModules) =>
        currentModules.map((module) =>
          module.id === lessonDraft.moduleId
            ? {
                ...module,
                lessons: [
                  ...module.lessons,
                  {
                    id: `lesson-${Date.now()}`,
                    title: lessonDraft.title.trim(),
                    duration: `${durationMinutes} دقيقة`,
                    description: "",
                    videoUrl: lessonDraft.videoUrl.trim() || undefined,
                    embedUrl: "",
                    computedLocked: true,
                    sort_order: Number(lessonDraft.orderIndex) > 0 ? Number(lessonDraft.orderIndex) : 1,
                  },
                ],
              }
            : module,
        ),
      );

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

  async function handleSaveQuiz() {
    if (!quizDraft?.question.trim()) {
      setError("Question text is required");
      return;
    }
    if (!quizDraft.correctAnswerId) {
      setError("Select the correct answer");
      return;
    }
    if (!token) {
      setError("You must be logged in");
      return;
    }

    const validAnswers = quizDraft.answers
      .map((answer) => ({ ...answer, text: answer.text.trim() }))
      .filter((answer) => answer.text.length > 0);

    if (validAnswers.length < 2) {
      setError("Add at least 2 answers");
      return;
    }

    const correctAnswer = validAnswers.find((answer) => answer.id === quizDraft.correctAnswerId)?.text;

    if (!correctAnswer) {
      setError("Please choose a correct answer from filled answers");
      return;
    }

    setIsSavingQuiz(true);
    setError(null);
    try {
      await createQuiz(
        {
          lessonId: quizDraft.lessonId,
          title: `Quiz - ${quizDraft.question.trim().slice(0, 40)}`,
          questions: [
            {
              questionText: quizDraft.question.trim(),
              options: validAnswers.map((answer) => answer.text),
              correctAnswer,
            },
          ],
        },
        token,
      );

      setIsQuizModalOpen(false);
      setQuizDraft(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save quiz");
    } finally {
      setIsSavingQuiz(false);
    }
  }

  async function handleSaveFileLesson() {
    if (!token || !fileDraft) {
      setError("You must be logged in");
      return;
    }

    if (!fileDraft.title.trim()) {
      setError("Lesson title is required");
      return;
    }

    if (!selectedMediaFile) {
      setError("Choose a PDF or image file first");
      return;
    }

    if (!isAllowedFileType(selectedMediaFile)) {
      setError("Only PDF and image files are allowed");
      return;
    }

    setIsUploadingMedia(true);
    setError(null);
    try {
      const duration = "ملف";
      const orderIndex = Number(fileDraft.orderIndex) > 0 ? Number(fileDraft.orderIndex) : 1;
      const upload = await uploadLessonMedia(selectedMediaFile, token);

      await createLesson(
        {
          moduleId: fileDraft.moduleId,
          title: fileDraft.title.trim(),
          description: "",
          videoUrl: upload.publicUrl,
          duration,
          sortOrder: orderIndex,
          isLocked: true,
        },
        token,
      );

      setModules((currentModules) =>
        currentModules.map((module) =>
          module.id === fileDraft.moduleId
            ? {
                ...module,
                lessons: [
                  ...module.lessons,
                  {
                    id: `lesson-${Date.now()}`,
                    title: fileDraft.title.trim(),
                    duration,
                    description: "",
                    videoUrl: upload.publicUrl,
                    embedUrl: "",
                    computedLocked: true,
                    sort_order: orderIndex,
                  },
                ],
              }
            : module,
        ),
      );

      setIsFileModalOpen(false);
      setFileDraft(null);
      setSelectedMediaFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload and save file");
    } finally {
      setIsUploadingMedia(false);
    }
  }

  function handleReorderLessons(moduleId: string, sourceLessonId: string, targetLessonId: string) {
    setModules((current) =>
      current.map((module) => {
        if (module.id !== moduleId) {
          return module;
        }

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
        <p className="text-[var(--text-secondary)]">Loading...</p>
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

      <div className="mx-auto w-full max-w-6xl space-y-10 py-10 sm:space-y-12 sm:py-12">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-300 p-6 shadow-md sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 text-right text-white">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{course.title}</h2>
              <p className="max-w-2xl text-sm text-white/90 sm:text-base">{course.tagline}</p>
              <div className="inline-flex rounded-xl bg-white/20 px-4 py-2 text-base font-semibold">
                {formatCurrency(course.price)}
              </div>
            </div>
            <div className="flex items-center gap-3 self-start lg:self-auto">
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 font-semibold text-slate-700 transition-all duration-300 hover:bg-gray-200"
              >
                <Pencil className="h-4 w-4" />
                تعديل
              </button>
              <Button
                onClick={handleAddChapter}
                className="rounded-xl bg-blue-600 px-4 py-2 text-white transition-all duration-300 hover:bg-blue-700"
              >
                إضافة فصل
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Students</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{course.students}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Lessons</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{course.lessonsCount}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Video className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">Videos</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{totalVideos}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-md sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-right">
              <h3 className="text-xl font-bold text-slate-900">Chapters & Lessons</h3>
              <p className="mt-1 text-sm text-slate-500">Organize your course content with a clean structure.</p>
            </div>
          </div>

          <ChapterTree
            modules={modules}
            onAddChapter={handleAddChapter}
            onAddLesson={handleOpenLessonModal}
            onAddFile={handleOpenFileModal}
            onAddQuiz={handleOpenQuizModal}
            onDeleteChapter={handleDeleteChapter}
            onDeleteLesson={handleDeleteLesson}
            onReorderLessons={handleReorderLessons}
          />
        </div>

        {isSavingChapter ? <p className="text-sm text-slate-500">Creating chapter...</p> : null}
      </div>

      <Modal
        open={isChapterModalOpen}
        title="Add Chapter"
        description="Choose the chapter name before saving it."
        onClose={() => setIsChapterModalOpen(false)}
      >
        <div className="space-y-4">
          <Input
            label="Chapter Name"
            value={chapterTitle}
            onChange={(event) => setChapterTitle(event.target.value)}
            placeholder="مثال: الفصل الأول"
          />

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsChapterModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChapter} disabled={isSavingChapter}>
              {isSavingChapter ? "Saving..." : "Save Chapter"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isEditModalOpen && Boolean(courseDraft)}
        title="Edit Course"
        description="Update the main course details."
        onClose={() => setIsEditModalOpen(false)}
      >
        {courseDraft ? (
          <div className="space-y-4">
            <Input
              label="Title"
              value={courseDraft.title}
              onChange={(event) => setCourseDraft({ ...courseDraft, title: event.target.value })}
            />
            <Input
              label="Description"
              value={courseDraft.description}
              onChange={(event) => setCourseDraft({ ...courseDraft, description: event.target.value })}
            />
            <Input
              label="Price"
              type="number"
              min="0"
              value={courseDraft.price}
              onChange={(event) => setCourseDraft({ ...courseDraft, price: event.target.value })}
            />
            <Input
              label="Image URL"
              value={courseDraft.image}
              onChange={(event) => setCourseDraft({ ...courseDraft, image: event.target.value })}
            />

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCourse} disabled={isSavingCourse}>
                {isSavingCourse ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isLessonModalOpen && Boolean(lessonDraft)}
        title="Add Lesson"
        description="Create a lesson and define its video source and accessibility."
        onClose={() => setIsLessonModalOpen(false)}
      >
        {lessonDraft ? (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">
              1) Enter basic lesson details, 2) Paste a media URL or upload a file, 3) Save.
            </p>
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
              label="Duration (minutes)"
              type="number"
              min="1"
              value={lessonDraft.durationMinutes}
              onChange={(event) => setLessonDraft({ ...lessonDraft, durationMinutes: event.target.value })}
            />
            <Input
              label="Order index"
              type="number"
              min="1"
              value={lessonDraft.orderIndex}
              onChange={(event) => setLessonDraft({ ...lessonDraft, orderIndex: event.target.value })}
            />

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsLessonModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveLesson} disabled={isSavingLesson}>{isSavingLesson ? "Saving..." : "Save Lesson"}</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={isFileModalOpen && Boolean(fileDraft)}
        title="Add File"
        description="Upload a PDF or image file and save it as a lesson."
        onClose={() => setIsFileModalOpen(false)}
      >
        {fileDraft ? (
          <div className="space-y-4">
            <Input
              label="Lesson title"
              value={fileDraft.title}
              onChange={(event) => setFileDraft({ ...fileDraft, title: event.target.value })}
            />
            <Input
              label="Order index"
              type="number"
              min="1"
              value={fileDraft.orderIndex}
              onChange={(event) => setFileDraft({ ...fileDraft, orderIndex: event.target.value })}
            />
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
              <p className="mb-2 text-sm text-[var(--text-secondary)]">Choose PDF/image file</p>
              <input
                type="file"
                accept=".pdf,image/*,application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedMediaFile(file);
                }}
                className="block w-full text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-lg file:border file:border-[var(--border)] file:bg-[var(--bg-main)] file:px-3 file:py-2 file:text-sm file:text-[var(--text-main)]"
              />
              {selectedMediaFile ? (
                <p className="mt-2 text-xs text-[var(--text-secondary)]">Selected: {selectedMediaFile.name}</p>
              ) : null}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsFileModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveFileLesson} disabled={isUploadingMedia}>
                {isUploadingMedia ? "Uploading..." : "Upload & Save"}
              </Button>
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
              <p className="text-sm font-medium text-[var(--text-secondary)]">Answers</p>
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
                    className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-secondary)] outline-none"
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={handleAddAnswer}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-[var(--primary-light)] hover:bg-[var(--primary)]"
              >
                <Plus className="h-4 w-4" /> Add answer
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsQuizModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveQuiz} disabled={isSavingQuiz}>{isSavingQuiz ? "Saving..." : "Save Quiz"}</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}
