"use client";

import { GripVertical, Plus, ChevronDown, ChevronRight, Video, Paperclip, Trash2, FileText } from "lucide-react";
import { useState } from "react";

import { CourseModule } from "@/types/course";

interface ChapterTreeProps {
  modules: CourseModule[];
  onAddChapter: () => void;
  onAddLesson: (moduleId: string) => void;
  onAddFile: (moduleId: string) => void;
  onAddQuiz: (lessonId: string) => void;
  onDeleteChapter: (moduleId: string) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
  onReorderLessons: (moduleId: string, sourceLessonId: string, targetLessonId: string) => void;
}

export function ChapterTree({
  modules,
  onAddChapter,
  onAddLesson,
  onAddFile,
  onAddQuiz,
  onDeleteChapter,
  onDeleteLesson,
  onReorderLessons,
}: ChapterTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(modules.map((module) => [module.id, true])),
  );

  function toggle(moduleId: string) {
    setExpanded((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }));
  }

  function isFileLesson(duration: string | undefined, videoUrl: string | undefined) {
    if ((duration ?? "").trim() === "ملف") {
      return true;
    }

    if (!videoUrl) {
      return false;
    }

    return /\.(pdf|png|jpg|jpeg|webp|gif|bmp|svg)(\?.*)?$/i.test(videoUrl);
  }

  return (
    <div dir="rtl" className="space-y-4 rounded-2xl bg-slate-50 p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Chapters & Lessons</h3>
        <button
          type="button"
          onClick={onAddChapter}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Chapter
        </button>
      </div>

      <div className="space-y-3">
        {modules.map((module, chapterIndex) => (
          <div key={module.id} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex w-full items-center justify-between text-left">
              <button
                type="button"
                onClick={() => toggle(module.id)}
                className="flex items-center gap-2 text-right"
              >
                {expanded[module.id] ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
                <p className="font-semibold text-slate-900">
                  Chapter {chapterIndex + 1}: {module.title}
                </p>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAddFile(module.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-all duration-300 hover:bg-gray-200"
                >
                  <Paperclip className="h-3 w-3" /> Add File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!module.lessons.length) return;
                    onAddQuiz(module.lessons[module.lessons.length - 1].id);
                  }}
                  disabled={!module.lessons.length}
                  className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-all duration-300 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" /> Add Quiz
                </button>
                <button
                  type="button"
                  onClick={() => onAddLesson(module.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-blue-700"
                >
                  <Plus className="h-3 w-3" /> Add Lesson
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteChapter(module.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-300 hover:bg-red-100"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>

            {expanded[module.id] ? (
              <ul className="mt-4 space-y-3">
                {module.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("lesson-id", lesson.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      const sourceLessonId = event.dataTransfer.getData("lesson-id");
                      if (!sourceLessonId || sourceLessonId === lesson.id) return;
                      onReorderLessons(module.id, sourceLessonId, lesson.id);
                    }}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 text-right text-slate-800">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      {isFileLesson(lesson.duration, lesson.videoUrl) ? (
                        <FileText className="h-4 w-4 text-slate-600" />
                      ) : (
                        <Video className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="font-medium">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {isFileLesson(lesson.duration, lesson.videoUrl) ? "ملف" : lesson.duration}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteLesson(module.id, lesson.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 transition-all duration-300 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </li>
                ))}

                {module.lessons.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No lessons yet. Add your first lesson.
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
