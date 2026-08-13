import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiClock,
  FiEdit3,
  FiFileText,
  FiPlay,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { apiUrl, getError } from "../../utils";
import Spinner from "../../components/ui/Spinner";

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  /*
   * ---------------------------------------------------------
   * Fetch assigned exams
   * ---------------------------------------------------------
   */
  const userId = JSON.parse(localStorage.getItem("loggedInStudent"))?.userId;

  const fetchMyExams = async (showRefreshLoader = false) => {
    try {
      setError("");

      if (!userId) {
        setError("User information could not be found. Please log in again.");
        setExams([]);
        return;
      }

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await axios.get(
        `${apiUrl}/api/user-exams/my-exams/${userId}`,
      );

      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch assigned exams:", err);

      setError(getError(err) || "Failed to load your examinations.");
      setExams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const totalQuestions = useMemo(
    () =>
      exams.reduce((total, exam) => total + Number(exam.questionCount || 0), 0),
    [exams],
  );
  /*
   * ---------------------------------------------------------
   * Initial fetch
   * ---------------------------------------------------------
   */

  useEffect(() => {
    fetchMyExams();
  }, []);

  /*
   * ---------------------------------------------------------
   * Filter
   * ---------------------------------------------------------
   */

  const filteredExams = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return exams;
    }

    return exams.filter(
      (exam) =>
        exam.subjectName?.toLowerCase().includes(searchValue) ||
        exam.level?.toLowerCase().includes(searchValue) ||
        exam.termType?.toLowerCase().includes(searchValue),
    );
  }, [exams, search]);

  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-bg px-6">
        <Spinner size="4rem" />
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * Page
   * ---------------------------------------------------------
   */

  return (
    <section className="min-h-screen bg-bg px-3 py-5 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-variant text-primary">
                <FiBookOpen className="text-2xl" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-light">
                  Teacher Dashboard
                </p>

                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  My Examinations
                </h1>

                <p className="mt-1 text-sm text-light">
                  Manage and monitor the examinations assigned to you.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchMyExams(true)}
              disabled={refreshing}
              className="
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-border
        px-4
        py-3
        text-sm
        font-semibold
        text-light
        transition
        hover:bg-white/5
        hover:text-white
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh Exams
            </button>
          </div>
        </header>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-danger/30 bg-danger-variant px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light">Assigned Exams</p>

                <p className="mt-1 text-3xl font-bold text-white">
                  {exams.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-variant text-primary">
                <FiFileText />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light">Visible Exams</p>

                <p className="mt-1 text-3xl font-bold text-white">
                  {exams.filter((exam) => exam.visible !== false).length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-variant text-success">
                <FiBookOpen />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-light">Total Questions</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {totalQuestions}
                </p>{" "}
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-variant text-warning">
                <FiFileText />
              </div>
            </div>
          </div>
        </div>

        {/* ==============={exam.questionCount}======================================
            EXAM LIST
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-xl">
          {/* Search */}
          <div className="border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-white">
                  Available Examinations
                </h2>

                <p className="mt-1 text-xs text-light">
                  {filteredExams.length}{" "}
                  {filteredExams.length === 1 ? "examination" : "examinations"}{" "}
                  found
                </p>
              </div>

              <div className="relative w-full md:max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-light" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search examination..."
                  className="
                    w-full
                    rounded-xl
                    border
                    border-border
                    bg-bg
                    py-3
                    pl-11
                    pr-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-light
                    focus:border-primary
                  "
                />
              </div>
            </div>
          </div>

          {/* Empty */}
          {filteredExams.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-light">
                <FiFileText size={28} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                No examinations assigned
              </h3>

              <p className="mt-2 max-w-md text-sm text-light">
                You currently have no examinations assigned to your account.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-white/[0.02]">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        No
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Subject
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Class
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Term
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Duration
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Questions
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-light">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {filteredExams.map((exam, index) => (
                      <tr
                        key={exam.id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-6 py-5 text-sm text-light">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        <td className="px-6 py-5">
                          <div className="font-medium text-white">
                            {exam.subjectName || "Untitled Exam"}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                            {exam.level?.toUpperCase() || "-"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-light">
                          {exam.termType || "-"}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-light">
                            <FiClock />
                            {Number(exam.examDuration || 0) / 60} mins
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-light">
                          {exam.questionCount}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => navigate(`/exam/${exam.id}`)}
                              className="
    inline-flex
    items-center
    gap-2
    rounded-lg
    bg-primary/10
    px-4
    py-2.5
    text-xs
    font-semibold
    text-primary
    transition
    hover:bg-primary/20
  "
                            >
                              <FiEdit3 />
                              Manage Exam
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE / TABLET CARDS
              ================================================== */}

              <div className="grid gap-4 p-4 lg:hidden sm:p-6">
                {filteredExams.map((exam, index) => (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-border bg-bg p-4 transition hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div>
                          <h3 className="font-semibold text-white">
                            {exam.subjectName || "Untitled Exam"}
                          </h3>

                          <p className="mt-1 text-xs text-light">
                            {exam.level?.toUpperCase() || "-"} •{" "}
                            {exam.termType || "-"} TERM
                          </p>
                        </div>
                      </div>

                      {exam.visible !== false ? (
                        <span className="rounded-full bg-success-variant px-2.5 py-1 text-[11px] font-medium text-success">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-danger-variant px-2.5 py-1 text-[11px] font-medium text-danger">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-white/[0.025] p-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-light">
                          Duration
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white">
                          <FiClock />
                          {Number(exam.examDuration || 0) / 60} mins
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-light">
                          Questions
                        </p>

                        <p className="mt-1 text-sm font-medium text-white">
                          {Array.isArray(exam.questions)
                            ? exam.questions.length
                            : 0}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/exam/${exam.id}`)}
                      className="
    mt-4
    flex
    w-full
    items-center
    justify-center
    gap-2
    rounded-lg
    bg-primary/10
    px-4
    py-3
    text-xs
    font-semibold
    text-primary
    transition
    hover:bg-primary/20
  "
                    >
                      <FiEdit3 />
                      Manage Examination
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TeacherDashboard;
