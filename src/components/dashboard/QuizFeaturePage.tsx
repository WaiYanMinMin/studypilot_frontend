"use client";

import { useMemo, useState } from "react";

import { asJson } from "@/components/dashboard/dashboardApi";
import { FeatureWorkspace } from "@/components/dashboard/FeatureWorkspace";
import type { QuizQuestion } from "@/types";
import { apiFetch } from "@/lib/apiClient";

type ResourcesResult = {
  summary: string;
  cheatSheet: string;
  quiz: QuizQuestion[];
};

export function QuizFeaturePage() {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const score = useMemo(() => {
    if (!quiz.length) return 0;
    return quiz.reduce((total, question) => {
      const selected = answers[question.id];
      return selected === question.correctOptionIndex ? total + 1 : total;
    }, 0);
  }, [quiz, answers]);

  return (
    <FeatureWorkspace
      title="Practice Quiz"
      description="Test your understanding with a quiz based on your lecture file."
    >
      {({ selectedDoc, selectedDocIds, busy, setBusy, setStatus }) => (
        <div>
          <h3>Quiz Time</h3>
          <p className="small">
            Practice with instant feedback and improve your weak areas.
          </p>
          <button
            className="ctaButton"
            disabled={busy || !selectedDoc}
            onClick={async () => {
              if (!selectedDoc) return;
              setBusy(true);
              setStatus("Creating quiz...");
              try {
                const response = await asJson<ResourcesResult>(
                  await apiFetch("/api/resources", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentIds: selectedDocIds })
                  })
                );
                setQuiz(response.quiz);
                setAnswers({});
                setStatus("Quiz ready.");
              } catch (error) {
                setStatus(error instanceof Error ? error.message : "Quiz generation failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Generate Quiz
          </button>

          {quiz.length ? (
            <div className="resultCard">
              <h4>
                Score: {score}/{quiz.length}
              </h4>
              <div className="quizList">
                {quiz.map((question, idx) => {
                  const chosen = answers[question.id];
                  const answered = chosen !== undefined;
                  return (
                    <article key={question.id} className="quizCard">
                      <h5>
                        Q{idx + 1}. {question.prompt}
                      </h5>
                      <div className="quizOptions">
                        {question.options.map((option, optionIndex) => {
                          const isCorrect = optionIndex === question.correctOptionIndex;
                          const isChosen = chosen === optionIndex;
                          const className = [
                            "quizOption",
                            isChosen ? "selected" : "",
                            answered && isCorrect ? "correct" : "",
                            answered && isChosen && !isCorrect ? "wrong" : ""
                          ]
                            .join(" ")
                            .trim();
                          return (
                            <button
                              key={`${question.id}-${optionIndex}`}
                              className={className}
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [question.id]: optionIndex
                                }))
                              }
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      {answered ? (
                        <p className="small">
                          {chosen === question.correctOptionIndex
                            ? "Correct."
                            : "Not quite."}{" "}
                          {question.explanation}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </FeatureWorkspace>
  );
}
