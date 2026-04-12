"use client";

import { useEffect, useState } from "react";
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

export default function LearnCoursePage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<LearningData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token || !params?.id) return;
    getLearningData(params.id, token).then(setData).catch((e) => setError(e.message));
  }, [token, params?.id]);

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
      <section className="page-shell py-12">
        <div className="mx-auto w-full max-w-6xl px-5">
          <h1 className="text-3xl font-bold text-white">Learning Page</h1>
          {error ? <p className="mt-4 text-rose-300">{error}</p> : null}
          {!data ? (
            <p className="mt-4 text-slate-300">Loading...</p>
          ) : (
            <div className="mt-6 space-y-6">
              {data.course.modules.map((module: LearningModule) => (
                <div key={module.id} className="rounded-xl border border-white/10 p-4 text-slate-200">
                  <h2 className="font-semibold">{module.title}</h2>
                  {module.lessons.map((lesson: LearningLesson) => (
                    <div key={lesson.id} className="mt-3 rounded-lg bg-white/5 p-3">
                      <p className="font-semibold">
                        {lesson.title} {(lesson.computedLocked ?? false) ? "(Locked)" : "(Unlocked)"}
                      </p>
                      {(lesson.computedLocked ?? false) ? (
                        <p className="mt-2 text-amber-300">
                          Finish previous lesson requirements to unlock this lesson.
                        </p>
                      ) : null}
                      {!(lesson.computedLocked ?? false) && (lesson.embedUrl ?? lesson.videoUrl) ? (
                        <iframe
                          className="mt-3 h-64 w-full rounded-lg"
                          src={lesson.embedUrl ?? lesson.videoUrl ?? ""}
                          title={lesson.title}
                          allowFullScreen
                        />
                      ) : null}
                      {!(lesson.computedLocked ?? false) && lesson.assignments.map((assignment: LearningAssignment) => (
                        <button
                          key={assignment.id}
                          onClick={() => onSubmitAssignment(assignment.id)}
                          className="mt-2 rounded bg-indigo-500 px-3 py-2 text-white"
                        >
                          Submit: {assignment.title}
                        </button>
                      ))}
                      {!(lesson.computedLocked ?? false) &&
                        lesson.quizzes.map((quiz: LearningQuiz) => (
                          <div key={quiz.id} className="mt-4 rounded-lg border border-white/10 p-3">
                            <p className="font-medium">{quiz.title}</p>
                            {quiz.questions.map((question: LearningQuestion) => (
                              <div key={question.id} className="mt-3">
                                <p className="text-sm">{question.questionText}</p>
                                <div className="mt-2 grid gap-2">
                                  {question.options.map((option) => (
                                    <button
                                      key={option}
                                      onClick={() => setAnswer(question.id, option)}
                                      className={`rounded px-3 py-2 text-left ${
                                        quizAnswers[question.id] === option
                                          ? "bg-indigo-500 text-white"
                                          : "bg-white/10 text-slate-200"
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
                              className="mt-3 rounded bg-emerald-500 px-3 py-2 text-white"
                            >
                              Submit Quiz
                            </button>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
