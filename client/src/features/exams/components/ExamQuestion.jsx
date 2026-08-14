import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiSend,
} from "react-icons/fi";

import QuestionNavigator from "./QuestionNavigator";
import Calculator from "./Calculator";
import RichContentRenderer from "../../exam-editor/components/RichContentRenderer";
import { useNavigate } from "react-router-dom";
import { apiUrl, getError } from "../../../utils";
import axios from "axios";

const ExamQuestion = ({
  exam,
  loggedInStudent,
  updateStudentScore,
  timeLeft,
  setTimeLeft,
  submitted,
  setSubmitted,
}) => {
  const questions = exam?.questions || [];
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  //  * RESET WHEN EXAM CHANGES
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setShowSubmitDialog(false);

    setTimeLeft(Number(exam?.examDuration || 0));
  }, [exam?.id, exam?.examDuration]);

  /*
   * ---------------------------------------------------------
   * AUTO SUBMIT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (timeLeft === 0 && !submitted && questions.length > 0) {
      submitExam();
    }
  }, [timeLeft]);

  /*
   * ---------------------------------------------------------
   * FORMAT TIME
   * ---------------------------------------------------------
   */

  const formattedTime = useMemo(() => {
    const totalSeconds = Math.max(0, timeLeft);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }, [timeLeft]);

  /*
   * ---------------------------------------------------------
   * SELECT ANSWER
   * ---------------------------------------------------------
   */

  const handleAnswer = (optionIndex) => {
    if (!currentQuestion || submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: optionIndex,
    }));
  };

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  const goToQuestion = (index) => {
    if (index < 0 || index >= questions.length) return;

    setCurrentQuestionIndex(index);
  };

  /*
   * ---------------------------------------------------------
   * SCORE
   * ---------------------------------------------------------
   */

  const calculateScore = () => {
    let score = 0;

    questions.forEach((question) => {
      const selectedIndex = answers[question.id];

      if (
        selectedIndex !== undefined &&
        question.options?.[selectedIndex] === question.correctAnswer
      ) {
        score += 1;
      }
    });

    return score;
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------------
   */

  const submitExam = async () => {
    if (submitted || submitting || !exam?.id || !loggedInStudent?.id) return;

    try {
      setSubmitting(true);

      // 1. Build the student's answer record
      const studentQuestionsAndAnswers = {
        studentId: loggedInStudent.id,
        schoolId: loggedInStudent.schoolId,
        examId: exam.id,

        answers: questions.map((question) => {
          const selectedIndex = answers[question.id];

          return {
            questionId: question.id,

            // Convert selected option index into the actual option value
            selectedOption:
              selectedIndex !== undefined
                ? question.options?.[selectedIndex]
                : "",
          };
        }),
      };

      // 2. Create the exam-history record
      const { data } = await axios.post(
        `${apiUrl}/api/students/create-answer`,
        studentQuestionsAndAnswers,
      );
      // 3. Calculate score
      const score = calculateScore();

      // 4. Update student's score
      await updateStudentScore(score, loggedInStudent.id);

      // 5. Mark exam as submitted
      setSubmitted(true);
      setShowSubmitDialog(false);
    } catch (error) {
      console.error("Failed to submit examination:", getError(error));
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * EMPTY EXAM
   * ---------------------------------------------------------
   */

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-bg-deep p-6 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning">
            <FiAlertCircle size={28} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            No Questions Available
          </h2>

          <p className="mt-2 text-sm leading-6 text-light">
            This examination does not contain any questions yet. Please return
            to your dashboard and try another examination.
          </p>

          <button
            type="button"
            onClick={() => navigate("/student")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * SUBMITTED
   * ---------------------------------------------------------
   */

  if (submitted) {
    const score = calculateScore();

    return (
      <section className="flex min-h-[65vh] items-center justify-center">
        <div className="w-full max-w-xl rounded-2xl border border-border bg-bg-deep p-8 text-center shadow-xl">
          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-variant text-success">
            <FiCheck size={32} />
          </div>

          {/* Status */}
          <p className="mt-5 text-sm font-semibold text-success">
            Examination submitted
          </p>

          <h2 className="mt-2 text-2xl font-bold">Well done!</h2>

          <p className="mt-2 text-sm text-light">
            Your examination has been submitted successfully.
          </p>

          {/* Score */}
          <div className="mx-auto mt-6 max-w-xs rounded-xl border border-border bg-bg p-5">
            <p className="text-sm text-light">Score</p>

            <p className="mt-1 text-3xl font-bold text-primary">
              {score} / {questions.length}
            </p>
          </div>

          {/* Dashboard Button */}
          <button
            type="button"
            onClick={() => navigate("/student")}
            className="
            mt-6
            inline-flex
            w-full
            items-center
            justify-center
            rounded-xl
            bg-primary
            px-5
            py-3
            text-sm
            font-bold
            text-bg
            transition
            hover:brightness-110
            focus:outline-none
            focus:ring-2
            focus:ring-primary/40
          "
          >
            Go to Your Dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full">
      {/* TOP EXAM INFORMATION */}
      <div className="w-full">
        {/* Desktop / Tablet */}
        <div className="hidden items-center md:grid md:grid-cols-3">
          {/* LEFT — Exam Status */}
          <div className="text-left">
            <p className="text-lg font-semibold text-white sm:text-xl">
              Exam is in progress...
            </p>
          </div>

          {/* CENTER — Timer */}
          <div className="flex justify-center">
            <div
              className={`
          inline-flex
          items-center
          gap-3
          px-3
          py-1
          text-xl
          font-medium
          text-white
          ${timeLeft <= 60 ? "bg-danger" : "bg-bg-deep"}
        `}
            >
              <FiClock size={25} />

              <span>{formattedTime}</span>
            </div>
          </div>

          {/* RIGHT — Student */}
          <div className="text-right">
            <p className="text-lg font-semibold text-white">
              {loggedInStudent?.name || loggedInStudent?.username || "Student"}
              {": "}
              <span className="font-normal">
                {loggedInStudent?.level || ""}
              </span>
            </p>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          {/* Timer */}
          <div
            className={`
        inline-flex
        items-center
        gap-2
        px-3
        py-1
        text-sm
        font-medium
        text-white
        ${timeLeft <= 60 ? "bg-danger" : "bg-primary"}
      `}
          >
            <FiClock size={18} />
            <span>{formattedTime}</span>
          </div>

          {/* Student */}
          <p className="truncate text-sm text-light">
            {loggedInStudent?.name || loggedInStudent?.username || "Student"}
          </p>
        </div>
      </div>

      {/* =====================================================
          SUBJECT
      ====================================================== */}

      <div className="mt-4 flex justify-center">
        <span className="rounded-xl bg-danger px-3 py-2 text-base font-bold text-white">
          {exam.subjectName}
        </span>
      </div>

      {/* =====================================================
          MAIN EXAM CONTENT
      ====================================================== */}

      <div className="mt-4 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_250px]">
        {/* LEFT */}
        <div className="min-w-0">
          {/* Question */}
          <div className="flex gap-3">
            <div className="shrink-0 text-lg font-bold text-white">
              {currentQuestionIndex + 1}
            </div>

            <div className="min-w-0 flex-1">
              <RichContentRenderer
                content={currentQuestion.question}
                className="
                  text-base
                  text-white
                  sm:text-lg
                  [&_p]:my-0
                  [&_p]:leading-7
                "
              />
            </div>
          </div>

          {/* Options */}
          <div className="mt-4 space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              const letter = String.fromCharCode(65 + index);

              return (
                <label
                  key={`${currentQuestion.id}-${index}`}
                  className="
          grid
          cursor-pointer
          grid-cols-[20px_32px_minmax(0,1fr)]
          items-start
          gap-2
          text-base
          text-white
          sm:text-lg
        "
                >
                  {/* Radio */}
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={isSelected}
                    onChange={() => handleAnswer(index)}
                    className="
            mt-1
            h-5
            w-5
            shrink-0
            cursor-pointer
            accent-primary
          "
                  />

                  {/* Option letter */}
                  <span className="pt-0.5 leading-6">({letter})</span>

                  {/* Option content */}
                  <RichContentRenderer
                    content={option}
                    className="
            min-w-0
            text-base
            leading-6
            text-white
            sm:text-lg
            [&_p]:m-0
            [&_p]:leading-6
          "
                  />
                </label>
              );
            })}
          </div>
          {/* =================================================
              PREVIOUS / NEXT
          ================================================== */}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              className="
                inline-flex
                items-center
                gap-1
                rounded-xl
                bg-primary
                px-3
                py-2
                text-sm
                font-semibold
                text-bg
                transition
                hover:brightness-110
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <FiArrowLeft size={16} />
              Prev
            </button>

            {currentQuestionIndex < questions.length - 1 && (
              <button
                type="button"
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-xl
                  bg-primary
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-bg
                  transition
                  hover:brightness-110
                "
              >
                Next
                <FiArrowRight size={16} />
              </button>
            )}
          </div>

          {/* =================================================
              QUESTION NAVIGATOR
          ================================================== */}

          <div className="mt-5">
            <QuestionNavigator
              questions={questions}
              answers={answers}
              currentQuestionIndex={currentQuestionIndex}
              onSelectQuestion={goToQuestion}
            />
          </div>

          {/* =================================================
              SUBMIT
          ================================================== */}

          <button
            type="button"
            onClick={() => setShowSubmitDialog(true)}
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-primary
              px-4
              py-2
              text-base
              font-semibold
              text-bg
              transition
              hover:brightness-110
            "
          >
            <FiSend size={17} />
            Submit
          </button>
        </div>

        {/* =====================================================
            CALCULATOR
        ====================================================== */}

        <aside className="hidden xl:block">
          <div className="sticky top-5">
            <Calculator />
          </div>
        </aside>
      </div>

      {/* Calculator mobile */}
      <div className="mt-5 xl:hidden">
        <Calculator />
      </div>

      {/* =====================================================
          SUBMIT DIALOG
      ====================================================== */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-deep p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-variant text-warning">
              <FiSend size={21} />
            </div>

            <h3 className="mt-5 text-xl font-semibold text-white">
              Submit examination?
            </h3>

            <p className="mt-2 text-sm leading-6 text-light">
              You have answered{" "}
              <span className="font-semibold text-white">
                {Object.keys(answers).length}
              </span>{" "}
              out of{" "}
              <span className="font-semibold text-white">
                {questions.length}
              </span>{" "}
              questions.
            </p>

            <p className="mt-2 text-sm text-light">
              Once submitted, you cannot return to this examination.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSubmitDialog(false)}
                className="
                  rounded-xl
                  border
                  border-border
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-light
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Continue Exam
              </button>

              <button
                type="button"
                onClick={submitExam}
                disabled={submitting}
                className="
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-success
    px-5
    py-3
    text-sm
    font-bold
    text-white
    transition
    hover:brightness-110
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  "Yes, Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExamQuestion;
