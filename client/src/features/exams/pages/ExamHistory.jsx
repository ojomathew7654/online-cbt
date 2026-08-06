import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiBookOpen, FiCheckCircle, FiXCircle } from "react-icons/fi";

import { apiUrl, getError } from "../../../utils";
import RichContentRenderer from "../../exam-editor/components/RichContentRenderer";
import Spinner from "../../../components/ui/Spinner";
import Dialog from "../../../components/ui/Dialog";

const ExamHistory = () => {
  const navigate = useNavigate();

  const [studentQuestionsAndAnswers, setStudentQuestionsAndAnswers] = useState(
    [],
  );

  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(false);

  const [allowStudent, setAllowStudent] = useState(false);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  /*
   * ---------------------------------------------------------
   * LOGGED-IN STUDENT
   * ---------------------------------------------------------
   */

  const [loggedInStudent, setLoggedInStudent] = useState(null);

  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem("loggedInStudent");

      if (!storedStudent) {
        navigate("/login", { replace: true });
        return;
      }

      const parsedStudent = JSON.parse(storedStudent);

      if (!parsedStudent?.id) {
        localStorage.removeItem("loggedInStudent");
        navigate("/login", { replace: true });
        return;
      }

      setLoggedInStudent(parsedStudent);
    } catch (error) {
      console.error("Invalid logged-in student:", error);

      localStorage.removeItem("loggedInStudent");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const studentId = loggedInStudent?.id;
  const schoolId = loggedInStudent?.schoolId;

  /*
   * ---------------------------------------------------------
   * FETCH EXAM HISTORY
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!studentId || !schoolId) {
      return;
    }

    const fetchStudentAnswers = async () => {
      try {
        setLoading(true);

        /*
         * Get school settings.
         */
        const { data: school } = await axios.get(
          `${apiUrl}/api/users/school/${schoolId}`,
        );

        setAllowStudent(Boolean(school?.viewExamHistory));

        /*
         * Get student's examination answers.
         *
         * GET /api/students/answers/:studentId
         */
        const { data } = await axios.get(
          `${apiUrl}/api/students/answers/${studentId}`,
        );

        setStudentQuestionsAndAnswers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch exam history:", error);

        console.error(getError(error) || "Failed to load examination history.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAnswers();
  }, [studentId, schoolId]);

  /*
   * ---------------------------------------------------------
   * SELECT EXAM
   * ---------------------------------------------------------
   */

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  /*
   * ---------------------------------------------------------
   * LOGOUT DIALOG
   * ---------------------------------------------------------
   */

  const openLogoutDialog = () => {
    setOpenDialog(true);
  };

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const handleLogout = async () => {
    try {
      setDialogLoading(true);

      /*
       * There is currently no logout API required because
       * authentication is being stored in localStorage.
       */
      localStorage.removeItem("loggedInStudent");

      setOpenDialog(false);

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setDialogLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CALCULATE EXAM STATISTICS
   * ---------------------------------------------------------
   */

  const calculateSubjectStats = (questionsAndAnswers) => {
    const totalQuestions = questionsAndAnswers.length;

    let totalFail = 0;
    let totalPass = 0;
    let noSelectedOption = 0;

    questionsAndAnswers.forEach((qa) => {
      const isAnswered =
        qa.selectedOption !== null &&
        qa.selectedOption !== undefined &&
        qa.selectedOption !== "";

      if (!isAnswered) {
        noSelectedOption += 1;
      } else if (qa.selectedOption === qa.correctAnswer) {
        totalPass += 1;
      } else {
        totalFail += 1;
      }
    });

    return {
      totalQuestions,
      totalFail,
      totalPass,
      noSelectedOption,
    };
  };

  /*
   * ---------------------------------------------------------
   * UNIQUE EXAMS
   * ---------------------------------------------------------
   *
   * The API returns records in this shape:
   *
   * {
   *   name,
   *   surname,
   *   level,
   *   termType,
   *   examName,
   *   questionsAndAnswers: [...]
   * }
   *
   * Therefore we group by:
   *
   * examName + termType
   */

  const subjects = useMemo(() => {
    return [
      ...new Map(
        studentQuestionsAndAnswers.map((item) => [
          `${item.examName}-${item.termType}`,
          {
            examName: item.examName,
            termType: item.termType,
          },
        ]),
      ).values(),
    ];
  }, [studentQuestionsAndAnswers]);

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <Spinner size="5rem" />
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * EXAM HISTORY DISABLED
   * ---------------------------------------------------------
   */

  if (!allowStudent) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-bg px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-bg-deep p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-variant text-danger">
            <FiXCircle className="text-3xl" />
          </div>

          <h1 className="text-xl font-semibold text-white">
            Exam History Disabled
          </h1>

          <p className="mt-2 text-sm leading-6 text-light">
            This page is currently disabled by the administrator.
          </p>

          <button
            type="button"
            onClick={() => navigate("/student")}
            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
          >
            Back to Dashboard
          </button>
        </div>
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <>
      <section className="min-h-screen bg-bg px-3 py-5 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-variant text-primary">
                  <FiBookOpen className="text-2xl" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-light">
                    Student Portal
                  </p>

                  <h1 className="text-xl font-bold text-white sm:text-2xl">
                    Examination History
                  </h1>

                  <p className="mt-1 text-sm text-light">
                    Review your previous examinations and answers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openLogoutDialog}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-danger/30
                  bg-danger-variant
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-danger
                  transition
                  hover:border-danger/50
                "
              >
                <FiLogOut />
                Log Out
              </button>
            </div>
          </header>

          {/* =================================================
              PREVIOUS EXAMS
          ================================================= */}

          <div className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl">
            <div className="mb-4">
              <h2 className="font-semibold text-white">Your Previous Exams</h2>

              <p className="mt-1 text-sm text-light">
                Select an examination to view your questions and answers.
              </p>
            </div>

            {subjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject, index) => {
                  const isSelected =
                    selectedSubject?.examName === subject.examName &&
                    selectedSubject?.termType === subject.termType;

                  return (
                    <button
                      type="button"
                      key={`${subject.examName}-${subject.termType}-${index}`}
                      onClick={() => handleSubjectClick(subject)}
                      className={`
                        rounded-xl
                        border
                        p-4
                        text-left
                        transition-all
                        ${
                          isSelected
                            ? "border-primary bg-primary-variant"
                            : "border-border bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]"
                        }
                      `}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          isSelected ? "text-primary" : "text-white"
                        }`}
                      >
                        {subject.examName}
                      </p>

                      <p className="mt-1 text-xs uppercase text-light">
                        {subject.termType} Term
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-light">No exam history available.</p>
              </div>
            )}
          </div>

          {/* =================================================
              SELECTED EXAM
          ================================================= */}

          {selectedSubject && (
            <div>
              {studentQuestionsAndAnswers
                .filter(
                  (data) =>
                    data.examName === selectedSubject.examName &&
                    data.termType === selectedSubject.termType,
                )
                .map((data, index) => {
                  const stats = calculateSubjectStats(
                    data.questionsAndAnswers || [],
                  );

                  return (
                    <div key={index}>
                      {/* EXAM TITLE */}

                      <div className="mb-5">
                        <p className="text-xs font-medium uppercase tracking-wider text-primary">
                          Examination Review
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                          {data.examName}
                        </h2>

                        <p className="mt-1 text-sm text-light">
                          {data.level?.toUpperCase()} • {data.termType} TERM
                        </p>
                      </div>

                      {/* =================================================
                          STATISTICS
                      ================================================= */}

                      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <div className="rounded-xl border border-border bg-bg-deep p-4">
                          <p className="text-xs text-light">Total Questions</p>

                          <p className="mt-1 text-2xl font-bold text-white">
                            {stats.totalQuestions}
                          </p>
                        </div>

                        <div className="rounded-xl border border-success/20 bg-success-variant p-4">
                          <p className="text-xs text-light">Passed</p>

                          <p className="mt-1 text-2xl font-bold text-success">
                            {stats.totalPass}
                          </p>
                        </div>

                        <div className="rounded-xl border border-danger/20 bg-danger-variant p-4">
                          <p className="text-xs text-light">Failed</p>

                          <p className="mt-1 text-2xl font-bold text-danger">
                            {stats.totalFail}
                          </p>
                        </div>

                        <div className="rounded-xl border border-border bg-bg-deep p-4">
                          <p className="text-xs text-light">Unanswered</p>

                          <p className="mt-1 text-2xl font-bold text-white">
                            {stats.noSelectedOption}
                          </p>
                        </div>
                      </div>

                      {/* =================================================
                          QUESTIONS
                      ================================================= */}

                      <div className="space-y-5">
                        {(data.questionsAndAnswers || []).map((qa, qaIndex) => {
                          const isAnswered =
                            qa.selectedOption !== null &&
                            qa.selectedOption !== undefined &&
                            qa.selectedOption !== "";

                          const isCorrect =
                            isAnswered &&
                            qa.selectedOption === qa.correctAnswer;

                          return (
                            <article
                              key={qaIndex}
                              className="overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-lg"
                            >
                              {/* QUESTION HEADER */}

                              <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-bg">
                                    {qaIndex + 1}
                                  </span>

                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      Question {qaIndex + 1}
                                    </p>

                                    <p className="text-xs text-light">
                                      Examination review
                                    </p>
                                  </div>
                                </div>

                                {isCorrect ? (
                                  <span className="flex items-center gap-1.5 rounded-full bg-success-variant px-3 py-1.5 text-xs font-semibold text-success">
                                    <FiCheckCircle />
                                    Correct
                                  </span>
                                ) : isAnswered ? (
                                  <span className="flex items-center gap-1.5 rounded-full bg-danger-variant px-3 py-1.5 text-xs font-semibold text-danger">
                                    <FiXCircle />
                                    Incorrect
                                  </span>
                                ) : (
                                  <span className="rounded-full border border-border px-3 py-1.5 text-xs text-light">
                                    Not Answered
                                  </span>
                                )}
                              </div>

                              {/* QUESTION CONTENT */}

                              <div className="p-4 sm:p-6">
                                <div className="mb-5 rounded-xl border border-border bg-white/[0.03] p-4 sm:p-5">
                                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                                    Question
                                  </p>

                                  <RichContentRenderer
                                    content={qa.question}
                                    highlightBracketText
                                    className="
                                        text-sm
                                        text-white
                                        sm:text-base
                                        [&_p]:my-1
                                        [&_img]:max-h-60
                                        [&_img]:max-w-full
                                        [&_img]:object-contain
                                      "
                                  />
                                </div>

                                {/* YOUR ANSWER */}

                                <div className="mb-4 rounded-xl border border-border bg-white/[0.02] p-4">
                                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-light">
                                    Your Answer
                                  </p>

                                  {isAnswered ? (
                                    <RichContentRenderer
                                      content={qa.selectedOption}
                                      highlightBracketText
                                      className="
                                          text-sm
                                          text-white
                                          sm:text-base
                                          [&_p]:my-1
                                          [&_img]:max-h-60
                                          [&_img]:max-w-full
                                          [&_img]:object-contain
                                        "
                                    />
                                  ) : (
                                    <p className="text-sm italic text-light">
                                      Not Answered
                                    </p>
                                  )}
                                </div>

                                {/* CORRECT ANSWER */}

                                <div className="rounded-xl border border-success/20 bg-success-variant/30 p-4">
                                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-success">
                                    Correct Answer
                                  </p>

                                  <RichContentRenderer
                                    content={qa.correctAnswer}
                                    highlightBracketText
                                    className="
                                        text-sm
                                        text-white
                                        sm:text-base
                                        [&_p]:my-1
                                        [&_img]:max-h-60
                                        [&_img]:max-w-full
                                        [&_img]:object-contain
                                      "
                                  />
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          LOGOUT CONFIRMATION DIALOG
      ====================================================== */}

      {openDialog && (
        <Dialog
          setOpenDialog={setOpenDialog}
          title="Log Out"
          message="Are you sure you want to log out of your student account?"
          action={handleLogout}
          loading={dialogLoading}
        />
      )}
    </>
  );
};

export default ExamHistory;
