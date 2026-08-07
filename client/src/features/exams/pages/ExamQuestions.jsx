import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { BiEditAlt } from "react-icons/bi";
import {
  MdAdd,
  MdArrowBack,
  MdCheckCircle,
  MdDelete,
  MdQuiz,
} from "react-icons/md";
import axios from "axios";

import Dialog from "../../../components/ui/Dialog";
import Spinner from "../../../components/ui/Spinner";
import { apiUrl, getError } from "../../../utils";
import RichContentRenderer from "../../exam-editor/components/RichContentRenderer";

const ExamQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [questionIdToDelete, setQuestionIdToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Custom horizontal scrollbar
  const topScrollRef = useRef(null);
  const topScrollContentRef = useRef(null);

  // Actual table scroll container
  const tableScrollRef = useRef(null);
  const tableContainerRef = useRef(null);

  const [scrollbarStyle, setScrollbarStyle] = useState({
    left: 0,
    width: 0,
  });

  /*
   * Keep the custom scrollbar and table scrollbar synchronized.
   */
  const syncTopScroll = (event) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  const syncTableScroll = (event) => {
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  /*
   * Fetch exam questions.
   */
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!examId) return;

      try {
        const { data } = await axios.get(
          `${apiUrl}/api/exams/questions/${examId}`,
        );

        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", getError(error));
        setQuestions([]);
      }
    };

    fetchQuestions();
  }, [examId]);

  /*
   * Position the fixed custom scrollbar over the table width.
   */
  useEffect(() => {
    const updateScrollbarPosition = () => {
      if (!tableContainerRef.current) return;

      const rect = tableContainerRef.current.getBoundingClientRect();

      setScrollbarStyle({
        left: Math.max(rect.left, 0),
        width: Math.min(rect.width, window.innerWidth),
      });
    };

    updateScrollbarPosition();

    window.addEventListener("resize", updateScrollbarPosition);

    return () => {
      window.removeEventListener("resize", updateScrollbarPosition);
    };
  }, [questions]);

  /*
   * Make the custom scrollbar's scrollable content exactly
   * the same width as the actual table.
   */
  useEffect(() => {
    const updateTopScrollWidth = () => {
      if (!tableScrollRef.current || !topScrollContentRef.current) {
        return;
      }

      topScrollContentRef.current.style.width = `${tableScrollRef.current.scrollWidth}px`;
    };

    updateTopScrollWidth();

    const resizeObserver = new ResizeObserver(updateTopScrollWidth);

    if (tableScrollRef.current) {
      resizeObserver.observe(tableScrollRef.current);
    }

    window.addEventListener("resize", updateTopScrollWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTopScrollWidth);
    };
  }, [questions]);

  const handleDeleteQuestion = (questionId) => {
    setQuestionIdToDelete(questionId);
    setOpenDialog(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionIdToDelete) return;

    try {
      setDeleting(true);

      await axios.delete(`${apiUrl}/api/exams/question/${questionIdToDelete}`);

      setQuestions((prev) =>
        prev.filter((question) => question.id !== questionIdToDelete),
      );

      setOpenDialog(false);
      setQuestionIdToDelete(null);
    } catch (error) {
      console.error("Error deleting question:", getError(error));
    } finally {
      setDeleting(false);
    }
  };

  const questionCount = questions?.length ?? 0;

  return (
    <>
      {/* Keep your existing Dialog implementation here. */}

      <section className="min-h-screen w-full min-w-0 overflow-x-hidden bg-bg px-3 py-5 sm:px-5 lg:px-8">
        <div className="mx-auto w-full min-w-0 max-w-7xl">
          {/* Header */}
          <div className="mb-6 w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
            <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MdQuiz size={26} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                    Exam Questions
                  </h1>

                  <p className="mt-1 text-sm text-light">
                    Manage, edit and remove questions from this examination.
                  </p>

                  {questions && (
                    <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-light">
                      <span className="font-medium text-primary">
                        {questionCount}
                      </span>

                      {questionCount === 1 ? "Question" : "Questions"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-light transition hover:bg-white/10 hover:text-white"
                >
                  <MdArrowBack size={19} />
                  Go Back
                </button>

                {questions && (
                  <button
                    type="button"
                    onClick={() => navigate(`/add-question/${examId}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
                  >
                    <MdAdd size={20} />
                    Add Question
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading */}
          {questions === null && (
            <div className="flex min-h-[400px] w-full min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-bg-deep/50">
              <Spinner size="4rem" />
            </div>
          )}

          {/* Empty */}
          {questions?.length === 0 && (
            <div className="flex min-h-[400px] w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-bg-deep/50 px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-light">
                <MdQuiz size={32} />
              </div>

              <h2 className="text-xl font-semibold text-white">
                No questions found
              </h2>

              <p className="mt-2 max-w-md text-sm text-light">
                This examination doesn't have any questions yet. Add the first
                question to get started.
              </p>

              <button
                type="button"
                onClick={() => navigate(`/add-question/${examId}`)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110"
              >
                <MdAdd size={20} />
                Add First Question
              </button>
            </div>
          )}

          {/* Desktop */}
          {questions?.length > 0 && (
            <div
              ref={tableContainerRef}
              className="hidden w-full min-w-0 overflow-visible rounded-2xl border border-border bg-bg-deep/50 shadow-xl xl:block"
            >
              {/* Fixed custom horizontal scrollbar */}
              <div
                ref={topScrollRef}
                onScroll={syncTopScroll}
                className="
                  fixed
                  bottom-2
                  z-50
                  hidden
                  h-2
                  overflow-x-auto
                  overflow-y-hidden
                  rounded-full
                  bg-transparent
                  shadow-none
                  [scrollbar-width:thin]
                  [&::-webkit-scrollbar]:h-1
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-primary/60
                  [&::-webkit-scrollbar-thumb:hover]:bg-primary
                  xl:block
                "
                style={{
                  left: `${scrollbarStyle.left}px`,
                  width: `${scrollbarStyle.width}px`,
                }}
                aria-label="Horizontal table scroll"
              >
                <div
                  ref={topScrollContentRef}
                  className="h-1"
                  aria-hidden="true"
                />
              </div>

              {/* Table
                  Native horizontal scrollbar is completely hidden.
                  The fixed scrollbar above controls this container.
              */}
              <div
                ref={tableScrollRef}
                onScroll={syncTableScroll}
                className="hide-scrollbar w-full min-w-0 overflow-x-auto"
              >
                <table className="min-w-[1300px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-white/[0.025]">
                      <th className="w-16 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-light">
                        No
                      </th>

                      <th className="min-w-[350px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Question
                      </th>

                      {["A", "B", "C", "D"].map((letter) => (
                        <th
                          key={letter}
                          className="min-w-[200px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light"
                        >
                          Option {letter}
                        </th>
                      ))}

                      <th className="min-w-[200px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Correct Answer
                      </th>

                      <th className="w-32 px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-light">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {questions.map((question, index) => (
                      <tr
                        key={`${question.id}-${index}`}
                        className="align-top transition hover:bg-white/[0.02]"
                      >
                        {/* Number */}
                        <td className="px-4 py-6 text-center">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-light">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </td>

                        {/* Question */}
                        <td className="px-5 py-6">
                          <div className="max-h-64 max-w-[350px] overflow-auto rounded-xl border border-border bg-bg p-4">
                            <RichContentRenderer
                              content={question.question}
                              highlightBracketText
                              className="text-sm"
                            />
                          </div>
                        </td>

                        {/* Options */}
                        {question.options.map((option, optionIndex) => (
                          <td key={optionIndex} className="px-5 py-6 align-top">
                            <div className="min-h-[70px] max-w-[200px] overflow-auto rounded-xl border border-border bg-bg p-3">
                              <RichContentRenderer
                                content={option}
                                highlightBracketText
                                className="text-sm"
                              />
                            </div>
                          </td>
                        ))}

                        {/* Correct Answer */}
                        <td className="px-5 py-6 align-top">
                          <div className="max-w-[200px] overflow-auto rounded-xl border border-success/20 bg-success-variant/30 p-3">
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-success">
                              <MdCheckCircle size={16} />
                              Correct
                            </div>

                            <RichContentRenderer
                              content={question.correctAnswer}
                              highlightBracketText
                              className="text-sm"
                            />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-6 align-top">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/edit-question/${question.id}`}
                              title="Edit question"
                              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition hover:bg-primary/20"
                            >
                              <BiEditAlt size={20} />
                            </Link>

                            <button
                              type="button"
                              title="Delete question"
                              disabled={deleting}
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-variant text-danger transition hover:bg-danger/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <MdDelete size={21} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mobile / Tablet */}
          {questions?.length > 0 && (
            <div className="w-full min-w-0 space-y-4 xl:hidden">
              {questions.map((question, index) => (
                <div
                  key={`${question.id}-${index}`}
                  className="w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-bg-deep/50 shadow-lg"
                >
                  {/* Card Header */}
                  <div className="flex min-w-0 items-center justify-between border-b border-border px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="truncate text-sm font-semibold text-white">
                        Question {index + 1}
                      </span>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Link
                        to={`/user/edit-question/${question.id}`}
                        title="Edit question"
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      >
                        <BiEditAlt size={18} />
                      </Link>

                      <button
                        type="button"
                        title="Delete question"
                        disabled={deleting}
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-variant text-danger"
                      >
                        <MdDelete size={19} />
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-5 p-4">
                    {/* Question */}
                    <div className="min-w-0">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-light">
                        Question
                      </p>

                      <div className="w-full min-w-0 overflow-auto rounded-xl border border-border bg-bg p-4">
                        <RichContentRenderer
                          content={question.question}
                          highlightBracketText
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div className="min-w-0">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-light">
                        Options
                      </p>

                      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="min-w-0 overflow-auto rounded-xl border border-border bg-bg p-3"
                          >
                            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-xs font-semibold text-primary">
                              {String.fromCharCode(65 + optionIndex)}
                            </div>

                            <RichContentRenderer
                              content={option}
                              highlightBracketText
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="min-w-0">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-light">
                        Correct Answer
                      </p>

                      <div className="w-full min-w-0 overflow-auto rounded-xl border border-success/20 bg-success-variant/30 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-success">
                          <MdCheckCircle size={16} />
                          Correct Answer
                        </div>

                        <RichContentRenderer
                          content={question.correctAnswer}
                          highlightBracketText
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ExamQuestions;
