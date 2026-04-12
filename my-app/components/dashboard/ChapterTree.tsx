"use client";

import { GripVertical, Plus, ChevronDown, ChevronRight, Video } from "lucide-react";
import { useState } from "react";

import { CourseModule } from "@/types/course";

interface ChapterTreeProps {
  modules: CourseModule[];
  onAddChapter: () => void;
  onAddLesson: (moduleId: string) => void;
  onAddQuiz: (lessonId: string) => void;
  onReorderLessons: (moduleId: string, sourceLessonId: string, targetLessonId: string) => void;
}

export function ChapterTree({
  modules,
  onAddChapter,
  onAddLesson,
  onAddQuiz,
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

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chapters & Lessons</h3>
        <button
          type="button"
          onClick={onAddChapter}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          <Plus className="h-4 w-4" /> Add Chapter
        </button>
      </div>

      <div className="space-y-3">
        {modules.map((module, chapterIndex) => (
          <div key={module.id} className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex w-full items-center justify-between text-left">
              <button
                type="button"
                onClick={() => toggle(module.id)}
                className="flex items-center gap-2"
              >
                {expanded[module.id] ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  Chapter {chapterIndex + 1}: {module.title}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onAddLesson(module.id)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-500/10"
              >
                <Plus className="h-3 w-3" /> Add Lesson
              </button>
            </div>

            {expanded[module.id] ? (
              <ul className="mt-3 space-y-2 pl-6">
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
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      <Video className="h-4 w-4 text-sky-500" />
                      <span>{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{lesson.duration}</span>
                      <button
                        type="button"
                        onClick={() => onAddQuiz(lesson.id)}
                        className="rounded-md px-2 py-1 text-xs text-violet-700 transition hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-violet-500/10"
                      >
                        Add Quiz
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
