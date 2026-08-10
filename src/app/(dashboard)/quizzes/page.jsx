"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";import Link from "next/link";
import {
  ArrowLeft,
} from "lucide-react";
export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topic =
    searchParams.get("topic") || "General Knowledge";

  // ---------------------------------------
  // STATE
  // ---------------------------------------

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // ---------------------------------------
  // GENERATE QUIZ
  // ---------------------------------------

  const generateQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      setQuestions([]);
      setAnswers({});
      setSelectedAnswer("");
      setCurrentQuestion(0);
      setSubmitted(false);
      setScore(0);

      console.log("Requesting quiz:", topic);

      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
        }),
      });

      // -----------------------------------
      // READ RESPONSE AS TEXT
      // -----------------------------------

      const responseText = await response.text();

      console.log("Quiz API status:", response.status);
      console.log("Quiz API response:", responseText);

      // -----------------------------------
      // PARSE JSON SAFELY
      // -----------------------------------

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "API returned non-JSON:",
          responseText
        );

        throw new Error(
          `Quiz API returned an invalid response. HTTP status: ${response.status}. Check the VS Code terminal.`
        );
      }

      // -----------------------------------
      // CHECK API RESULT
      // -----------------------------------

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate quiz."
        );
      }

      // -----------------------------------
      // CHECK QUESTIONS
      // -----------------------------------

      if (
        !data.questions ||
        !Array.isArray(data.questions)
      ) {
        throw new Error(
          "No questions were returned."
        );
      }

      if (data.questions.length === 0) {
        throw new Error(
          "The AI returned an empty quiz."
        );
      }

      // -----------------------------------
      // SET QUESTIONS
      // -----------------------------------

      setQuestions(data.questions);
    } catch (error) {
      console.error(
        "Generate quiz error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the quiz."
      );
    } finally {
      setLoading(false);
    }
  }, [topic]);

  // ---------------------------------------
  // GENERATE WHEN PAGE LOADS
  // ---------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQuiz();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [generateQuiz]);

  // ---------------------------------------
  // SELECT ANSWER
  // ---------------------------------------

  function handleAnswer(option) {
    if (submitted) {
      return;
    }

    setSelectedAnswer(option);

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: option,
    }));
  }

  // ---------------------------------------
  // GO TO QUESTION
  // ---------------------------------------

  function goToQuestion(index) {
    if (
      index < 0 ||
      index >= questions.length
    ) {
      return;
    }

    setCurrentQuestion(index);

    setSelectedAnswer(
      answers[index] || ""
    );
  }

  // ---------------------------------------
  // NEXT
  // ---------------------------------------

  function nextQuestion() {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      const next = currentQuestion + 1;

      setCurrentQuestion(next);

      setSelectedAnswer(
        answers[next] || ""
      );
    }
  }

  // ---------------------------------------
  // PREVIOUS
  // ---------------------------------------

  function previousQuestion() {
    if (currentQuestion > 0) {
      const previous =
        currentQuestion - 1;

      setCurrentQuestion(previous);

      setSelectedAnswer(
        answers[previous] || ""
      );
    }
  }

  // ---------------------------------------
  // SUBMIT
  // ---------------------------------------

  function submitQuiz() {
    let finalScore = 0;

    questions.forEach(
      (question, index) => {
        if (
          answers[index] ===
          question.answer
        ) {
          finalScore++;
        }
      }
    );

    setScore(finalScore);
    setSubmitted(true);
  }

  // ---------------------------------------
  // PROGRESS
  // ---------------------------------------

  const answeredCount =
    Object.keys(answers).length;

  const progress =
    questions.length > 0
      ? Math.round(
          (answeredCount /
            questions.length) *
            100
        )
      : 0;

  // =======================================
  // LOADING
  // =======================================

  if (loading) {
    return (
      <div className="w-full min-h-full bg-[#f8f9fc]">
        <main className="flex min-h-[calc(100vh-90px)] w-full items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />

            <h2 className="text-xl font-bold text-gray-800">
              Generating your quiz...
            </h2>

            <p className="mt-2 text-gray-500">
              AI is creating questions about{" "}
              &quot;{topic}&quot;
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =======================================
  // ERROR
  // =======================================

  if (error) {
    return (
      <div className="w-full min-h-full bg-[#f8f9fc]">
        <main className="flex min-h-[calc(100vh-90px)] w-full items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-5xl">
              ⚠️
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Unable to generate quiz
            </h2>

            <p className="mt-3 text-sm leading-6 text-red-500">
              {error}
            </p>

            <button
              type="button"
              onClick={generateQuiz}
              className="mt-6 rounded-xl bg-purple-600 px-7 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =======================================
  // EMPTY
  // =======================================

  if (!questions.length) {
    return (
      <div className="w-full min-h-full bg-[#f8f9fc]">
        <main className="flex min-h-[calc(100vh-90px)] w-full items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">
              No questions available.
            </p>

            <button
              type="button"
              onClick={generateQuiz}
              className="mt-4 rounded-xl bg-purple-600 px-6 py-3 text-white"
            >
              Generate Quiz
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------
  // CURRENT QUESTION
  // ---------------------------------------

  const question =
    questions[currentQuestion];

  // =======================================
  // MAIN PAGE
  // =======================================

  return (
    <div className="w-full min-h-full bg-[#f8f9fc]">
      {/* ===================================
          IMPORTANT:
          DashboardLayout already provides
          the sidebar and main column.
          DO NOT add ml-[260px] here.
          =================================== */}

      <main className="w-full min-w-0">
        {/* =================================
            QUIZ TOP BAR
            ================================= */}

       <header className="mb-6 flex items-center">
  <button
    type="button"
    onClick={() => {
router.push(`/search?q=${encodeURIComponent(topic)}`);    }}
    className="flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-violet-600"
  >
    <ArrowLeft className="h-5 w-5" />
    Back to results
  </button>
</header>

        {/* =================================
            PAGE CONTENT
            ================================= */}

        <div className="w-full px-5 py-6 sm:px-6 lg:px-8">
          {/* =================================
              QUIZ HEADER
              ================================= */}

          <section className="mb-6 flex w-full items-center gap-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 to-purple-500 p-3 text-center text-sm font-bold leading-5 text-white sm:h-28 sm:w-28 sm:text-base">
              {topic}
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Quiz:{" "}
                <span className="text-purple-600">
                  {topic}
                </span>
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Test your understanding of the topic
              </p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                <span>
                  ◷ {questions.length} Questions
                </span>

                <span>
                  ◇ Multiple Choice
                </span>

                <span>
                  ✦ 1 Point Each
                </span>
              </div>
            </div>
          </section>

          {/* =================================
              QUESTION + PROGRESS
              ================================= */}

          <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
            {/* =================================
                QUESTION
                ================================= */}

            <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:p-7">
              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600">
                  Question{" "}
                  {currentQuestion + 1} of{" "}
                  {questions.length}
                </span>

                <span className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600">
                  ✦ 1 Point
                </span>
              </div>

              <h2 className="mb-7 text-xl font-bold leading-8 text-gray-900">
                {question.question}
              </h2>

              {/* OPTIONS */}

              <div className="space-y-4">
                {question.options.map(
                  (option, index) => {
                    const letter =
                      String.fromCharCode(
                        65 + index
                      );

                    const selected =
                      selectedAnswer === option;

                    const correct =
                      submitted &&
                      option ===
                        question.answer;

                    const wrong =
                      submitted &&
                      selected &&
                      option !==
                        question.answer;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          handleAnswer(option)
                        }
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                          correct
                            ? "border-green-400 bg-green-50"
                            : wrong
                            ? "border-red-400 bg-red-50"
                            : selected
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold ${
                            selected
                              ? "bg-purple-600 text-white"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {letter}
                        </span>

                        <span className="font-medium text-gray-700">
                          {option}
                        </span>

                        {correct && (
                          <span className="ml-auto text-green-600">
                            ✓
                          </span>
                        )}

                        {wrong && (
                          <span className="ml-auto text-red-600">
                            ✕
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* =================================
                  EXPLANATION
                  ================================= */}

              {submitted && (
                <div className="mt-6 rounded-xl bg-purple-50 p-5">
                  <p className="font-semibold text-purple-700">
                    Explanation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {question.explanation}
                  </p>
                </div>
              )}

              {/* =================================
                  BUTTONS
                  ================================= */}

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={previousQuestion}
                  disabled={
                    currentQuestion === 0
                  }
                  className="rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
                >
                  ← Previous
                </button>

                {currentQuestion ===
                questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={submitQuiz}
                    className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 sm:px-7"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 sm:px-7"
                  >
                    Next →
                  </button>
                )}
              </div>

              {/* =================================
                  RESULT
                  ================================= */}

              {submitted &&
                currentQuestion ===
                  questions.length - 1 && (
                  <div className="mt-8 rounded-2xl bg-purple-50 p-7 text-center">
                    <p className="text-sm text-gray-500">
                      Your Score
                    </p>

                    <p className="mt-2 text-5xl font-bold text-purple-600">
                      {score}/{questions.length}
                    </p>

                    <p className="mt-2 text-gray-500">
                      {score >= 8
                        ? "Excellent work! 🎉"
                        : score >= 5
                        ? "Good job! Keep learning."
                        : "Keep practicing!"}
                    </p>

                    <button
                      type="button"
                      onClick={generateQuiz}
                      className="mt-5 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                    >
                      Generate New Quiz
                    </button>
                  </div>
                )}
            </section>

            {/* =================================
                QUIZ PROGRESS SIDEBAR
                ================================= */}

            <aside className="h-fit w-full rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Quiz Progress
              </h2>

              {/* CIRCLE */}

              <div className="my-7 flex justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-purple-100">
                  <span className="text-3xl font-bold text-purple-600">
                    {progress}%
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500">
                {answeredCount} of{" "}
                {questions.length} Questions
              </p>

              <div className="my-6 border-t border-gray-100" />

              {/* QUESTION NUMBERS */}

              <div className="grid grid-cols-5 gap-2">
                {questions.map(
                  (_, index) => {
                    const answered =
                      answers[index] !==
                      undefined;

                    const active =
                      currentQuestion ===
                      index;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          goToQuestion(index)
                        }
                        className={`h-10 rounded-lg text-sm font-semibold transition ${
                          active
                            ? "bg-purple-600 text-white"
                            : answered
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  }
                )}
              </div>

              {/* =================================
                  STATS
                  ================================= */}

              <div className="mt-7 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-green-500">
                    {submitted ? score : 0}
                  </p>

                  <p className="text-xs text-gray-400">
                    Correct
                  </p>
                </div>

                <div>
                  <p className="text-lg font-bold text-red-500">
                    {submitted
                      ? answeredCount - score
                      : 0}
                  </p>

                  <p className="text-xs text-gray-400">
                    Incorrect
                  </p>
                </div>

                <div>
                  <p className="text-lg font-bold text-gray-400">
                    {questions.length -
                      answeredCount}
                  </p>

                  <p className="text-xs text-gray-400">
                    Unanswered
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}