import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBookOpen,
  FiClipboard,
  FiCheckCircle,
  FiAward,
  FiArrowRight,
  FiActivity,
  FiCalendar,
  FiBarChart2,
  FiRefreshCw,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

import { apiUrl, getError } from "../../utils";
import Spinner from "../../components/ui/Spinner";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [loggedInStudent, setLoggedInStudent] = useState(null);

  const [exams, setExams] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState([]);

  const [allowExamHistory, setAllowExamHistory] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /*
   * =========================================================
   * LOAD LOGGED-IN STUDENT
   * =========================================================
   */

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("loggedInStudent");

      if (!storedUser) {
        navigate("/login", { replace: true });
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser?.id) {
        localStorage.removeItem("loggedInStudent");
        navigate("/login", { replace: true });
        return;
      }

      setLoggedInStudent(parsedUser);
    } catch (error) {
      console.error("Invalid logged-in student:", error);

      localStorage.removeItem("loggedInStudent");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const studentId = loggedInStudent?.id;
  const schoolId = loggedInStudent?.schoolId;

  /*
   * =========================================================
   * FETCH DASHBOARD DATA
   * =========================================================
   *
   * We only use:
   *
   * 1. School API
   * 2. Visible exams API
   * 3. Student answers API
   *
   * The check-score-exists API is no longer needed.
   */

  const fetchDashboardData = useCallback(
    async (showRefreshLoader = false) => {
      if (!studentId || !schoolId) {
        return;
      }

      try {
        setError("");

        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [schoolResponse, examsResponse, answersResponse] =
          await Promise.all([
            axios.get(`${apiUrl}/api/users/school/${schoolId}`),

            axios.get(`${apiUrl}/api/exams/visible-true-exams/${schoolId}`),

            axios.get(`${apiUrl}/api/students/answers/${studentId}`),
          ]);

        const school = schoolResponse.data;

        const availableExams = Array.isArray(examsResponse.data)
          ? examsResponse.data
          : [];

        const answers = Array.isArray(answersResponse.data)
          ? answersResponse.data
          : [];

        setAllowExamHistory(Boolean(school?.viewExamHistory));

        setExams(availableExams);

        setStudentAnswers(answers);
      } catch (error) {
        console.error("Failed to load student dashboard:", error);

        setError(
          getError(error) ||
            "Failed to load your dashboard information. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [studentId, schoolId],
  );

  useEffect(() => {
    if (!studentId || !schoolId) {
      return;
    }

    fetchDashboardData();
  }, [studentId, schoolId, fetchDashboardData]);

  /*
   * =========================================================
   * EXAM RESULTS
   * =========================================================
   *
   * API response:
   *
   * [
   *   {
   *     examName,
   *     termType,
   *     questionsAndAnswers: [
   *       {
   *         question,
   *         selectedOption,
   *         correctAnswer
   *       }
   *     ]
   *   }
   * ]
   *
   * We calculate the score from questionsAndAnswers.
   */

  const examResults = useMemo(() => {
    if (!Array.isArray(studentAnswers)) {
      return [];
    }

    return studentAnswers.map((examRecord) => {
      const questionsAndAnswers = Array.isArray(examRecord.questionsAndAnswers)
        ? examRecord.questionsAndAnswers
        : [];

      let correctAnswers = 0;
      let unanswered = 0;

      questionsAndAnswers.forEach((item) => {
        const selectedOption = item?.selectedOption;
        const correctAnswer = item?.correctAnswer;

        if (
          selectedOption === null ||
          selectedOption === undefined ||
          selectedOption === ""
        ) {
          unanswered += 1;
          return;
        }

        if (selectedOption === correctAnswer) {
          correctAnswers += 1;
        }
      });

      const totalQuestions = questionsAndAnswers.length;

      const score =
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0;

      return {
        examName: examRecord.examName || "Unknown Exam",
        termType: examRecord.termType || "-",
        level: examRecord.level || loggedInStudent?.level || "-",

        totalQuestions,
        correctAnswers,
        unanswered,
        score,
      };
    });
  }, [studentAnswers, loggedInStudent?.level]);

  /*
   * =========================================================
   * COMPLETED EXAMS
   * =========================================================
   *
   * We no longer call:
   *
   * /check-score-exists/:studentId/:examId
   *
   * An exam is considered completed when the student has
   * an answer record matching the exam subject and term.
   */

  const completedExamKeys = useMemo(() => {
    return new Set(
      examResults.map((result) =>
        `${result.examName}__${result.termType}`.toLowerCase(),
      ),
    );
  }, [examResults]);

  const completedExams = useMemo(() => {
    return exams.filter((exam) => {
      const key = `${exam.subjectName || ""}__${
        exam.termType || ""
      }`.toLowerCase();

      return completedExamKeys.has(key);
    });
  }, [exams, completedExamKeys]);

  /*
   * =========================================================
   * AVAILABLE EXAMS
   * =========================================================
   */

  const availableExams = useMemo(() => {
    return exams.filter((exam) => {
      if (exam.visible === false) {
        return false;
      }

      const key = `${exam.subjectName || ""}__${
        exam.termType || ""
      }`.toLowerCase();

      return !completedExamKeys.has(key);
    });
  }, [exams, completedExamKeys]);

  /*
   * =========================================================
   * AVERAGE SCORE
   * =========================================================
   */

  const averageScore = useMemo(() => {
    if (!examResults.length) {
      return 0;
    }

    const total = examResults.reduce((sum, result) => sum + result.score, 0);

    return Math.round(total / examResults.length);
  }, [examResults]);

  /*
   * =========================================================
   * TOTAL QUESTIONS ANSWERED
   * =========================================================
   */

  const totalQuestionsAnswered = useMemo(() => {
    return examResults.reduce(
      (total, result) => total + result.totalQuestions,
      0,
    );
  }, [examResults]);

  /*
   * =========================================================
   * RECENT RESULTS
   * =========================================================
   */

  const recentResults = useMemo(() => {
    return [...examResults].reverse().slice(0, 5);
  }, [examResults]);

  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const stats = [
    {
      title: "Available Exams",
      value: availableExams.length,
      description: "Examinations available to you",
      icon: FiClipboard,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      title: "Completed Exams",
      value: completedExams.length,
      description: "Examinations completed",
      icon: FiCheckCircle,
      iconClass: "bg-success/10 text-success",
    },
    {
      title: "Average Score",
      value: `${averageScore}%`,
      description: "Based on completed exams",
      icon: FiAward,
      iconClass: "bg-warning/10 text-warning",
    },
    {
      title: "Exam History",
      value: examResults.length,
      description: "Previous examinations",
      icon: FiBarChart2,
      iconClass: "bg-purple-500/10 text-purple-400",
    },
  ];

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner size="4rem" />
      </section>
    );
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <section className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-primary">
                <FiActivity size={16} />

                <span>Student Portal</span>
              </div>

              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                Welcome,{" "}
                {loggedInStudent?.name ||
                  loggedInStudent?.studentName ||
                  "Student"}
              </h1>

              <p className="mt-2 text-sm text-light">
                Manage your examinations, results and academic progress.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FiBookOpen size={20} />
                </div>

                <div>
                  <p className="text-xs text-light">Current Class</p>

                  <p className="text-sm font-semibold text-white">
                    {loggedInStudent?.level?.toUpperCase() || "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh dashboard"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg text-light transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-variant px-4 py-3 text-sm text-danger">
            <FiAlertCircle className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-light">{stat.title}</p>

                    <p className="mt-2 text-3xl font-semibold text-white">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs text-light">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* AVAILABLE EXAMS */}

          <div className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Available Examinations
                </h2>

                <p className="mt-1 text-sm text-light">
                  Examinations currently available for you.
                </p>
              </div>

              <FiClipboard className="text-primary" size={22} />
            </div>

            {availableExams.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-bg p-8 text-center">
                <FiClipboard size={30} className="mx-auto text-light" />

                <p className="mt-3 text-sm font-medium text-white">
                  No available examinations
                </p>

                <p className="mt-1 text-xs text-light">
                  You currently have no new examinations available.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {availableExams.slice(0, 5).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-4 transition hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FiBookOpen size={18} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {exam.subjectName || "Untitled Examination"}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-light">
                          <span>{exam.level?.toUpperCase() || "-"}</span>

                          <span>•</span>

                          <span>{exam.termType || "-"} TERM</span>

                          <span>•</span>

                          <span className="flex items-center gap-1">
                            <FiClock />
                            {Number(exam.examDuration || 0) / 60} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/selected-exam/${exam.id}`)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                    >
                      Take Examination
                      <FiArrowRight />
                    </button>
                  </div>
                ))}

                {availableExams.length > 5 && (
                  <button
                    type="button"
                    onClick={() => navigate("/exams")}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-light transition hover:bg-white/5 hover:text-primary"
                  >
                    View all examinations
                    <FiArrowRight />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}

          <div className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>

            <p className="mt-1 text-sm text-light">
              Quickly access your examination tools.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => navigate("/exam-history")}
                className="group flex w-full items-center justify-between rounded-xl border border-border bg-bg p-4 text-left transition hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-2 text-success">
                    <FiAward size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">My Results</p>

                    <p className="text-xs text-light">
                      View examination results
                    </p>
                  </div>
                </div>

                <FiArrowRight className="text-light group-hover:text-primary" />
              </button>

              {allowExamHistory && (
                <button
                  type="button"
                  onClick={() => navigate("/exam-history")}
                  className="group flex w-full items-center justify-between rounded-xl border border-border bg-bg p-4 text-left transition hover:border-primary/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                      <FiBarChart2 size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        Exam History
                      </p>

                      <p className="text-xs text-light">
                        Review previous examinations
                      </p>
                    </div>
                  </div>

                  <FiArrowRight className="text-light group-hover:text-primary" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            RECENT RESULTS + UPCOMING
        ====================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* RECENT RESULTS */}

          <div className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Recent Results
                </h2>

                <p className="mt-1 text-sm text-light">
                  Your latest examination performance.
                </p>
              </div>

              <FiAward className="text-primary" size={21} />
            </div>

            {recentResults.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-bg p-6 text-center">
                <p className="text-sm text-light">
                  No examination results yet.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {recentResults.map((result, index) => (
                  <div
                    key={`${result.examName}-${result.termType}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-bg p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {result.examName}
                      </p>

                      <p className="mt-1 text-xs text-light">
                        {result.termType} TERM • {result.correctAnswers}/
                        {result.totalQuestions} correct
                      </p>
                    </div>

                    <div className="ml-4 shrink-0 text-right">
                      <p className="text-lg font-bold text-primary">
                        {result.score}%
                      </p>

                      <p className="text-[11px] text-light">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING EXAMS */}

          <div className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Upcoming Examinations
                </h2>

                <p className="mt-1 text-sm text-light">
                  Examinations currently available to you.
                </p>
              </div>

              <FiCalendar className="text-primary" size={21} />
            </div>

            {availableExams.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-bg p-6 text-center">
                <p className="text-sm text-light">No upcoming examinations.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {availableExams.slice(0, 4).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-bg p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {exam.subjectName || "Untitled Examination"}
                      </p>

                      <p className="mt-1 text-xs text-light">
                        {exam.level?.toUpperCase() || "-"} •{" "}
                        {exam.termType || "-"} TERM
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/selected-exam/${exam.id}`)}
                      className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            ACADEMIC PROGRESS
        ====================================================== */}

        <div className="mt-6 rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FiBarChart2 size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Academic Progress
              </h2>

              <p className="text-sm text-light">
                Your examination performance overview.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg p-5">
              <p className="text-xs uppercase tracking-wider text-light">
                Questions Answered
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {totalQuestionsAnswered}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg p-5">
              <p className="text-xs uppercase tracking-wider text-light">
                Exams Completed
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {completedExams.length}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg p-5">
              <p className="text-xs uppercase tracking-wider text-light">
                Average Score
              </p>

              <p className="mt-2 text-2xl font-bold text-primary">
                {averageScore}%
              </p>
            </div>
          </div>

          {examResults.length > 0 && (
            <div className="mt-5 space-y-3">
              {examResults.map((result, index) => (
                <div key={`${result.examName}-${result.termType}-${index}`}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-light">
                      {result.examName}{" "}
                      <span className="text-white/40">({result.termType})</span>
                    </span>

                    <span className="font-semibold text-white">
                      {result.score}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-bg">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(result.score, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StudentDashboard;
