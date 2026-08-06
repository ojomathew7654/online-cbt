import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiCheck,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { apiUrl, getError } from "../../../utils";
import Spinner from "../../../components/ui/Spinner";

const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("loggedInStudent")) || null;
  } catch {
    return null;
  }
};

const AssignExam = () => {
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [examSearch, setExamSearch] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);

  const [assigning, setAssigning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loggedInUser = useMemo(() => getLoggedInUser(), []);
  const schoolId = loggedInUser?.schoolId;

  /*
   * ---------------------------------------------------------
   * Fetch users
   * ---------------------------------------------------------
   */

  const fetchUsers = async (showRefreshLoader = false) => {
    if (!schoolId) {
      setError("No school information found for the logged-in user.");
      setLoadingUsers(false);
      return;
    }

    try {
      setError("");

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoadingUsers(true);
      }

      const { data } = await axios.get(
        `${apiUrl}/api/users/school/${schoolId}/users`,
      );

      const userList = Array.isArray(data) ? data : [];

      // Assignment should normally be for regular users.
      setUsers(userList.filter((user) => user.role === "USER"));
    } catch (err) {
      console.error("Failed to fetch users:", err);

      setError(getError(err) || "Failed to load users.");
    } finally {
      setLoadingUsers(false);
      setRefreshing(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Fetch exams
   * ---------------------------------------------------------
   */

  const fetchExams = async (term, level) => {
    if (!term || !level || !schoolId) {
      setExams([]);
      return;
    }

    try {
      setLoadingExams(true);
      setError("");

      const { data } = await axios.get(
        `${apiUrl}/api/exams/exams-by-level-term`,
        {
          params: {
            level,
            termType: term,
            schoolId,
          },
        },
      );

      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch exams:", err);

      setError(getError(err) || "Failed to load exams.");
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Initial users
   * ---------------------------------------------------------
   */

  useEffect(() => {
    fetchUsers();
  }, [schoolId]);

  /*
   * ---------------------------------------------------------
   * Filter users
   * ---------------------------------------------------------
   */

  const filteredUsers = useMemo(() => {
    const value = userSearch.trim().toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(value) ||
        user.username?.toLowerCase().includes(value),
    );
  }, [users, userSearch]);

  /*
   * ---------------------------------------------------------
   * Filter exams
   * ---------------------------------------------------------
   */

  const filteredExams = useMemo(() => {
    const value = examSearch.trim().toLowerCase();

    if (!value) {
      return exams;
    }

    return exams.filter(
      (exam) =>
        exam.subjectName?.toLowerCase().includes(value) ||
        exam.level?.toLowerCase().includes(value) ||
        exam.termType?.toLowerCase().includes(value),
    );
  }, [exams, examSearch]);

  /*
   * ---------------------------------------------------------
   * Term change
   * ---------------------------------------------------------
   */

  const handleTermChange = async (event) => {
    const term = event.target.value;

    setSelectedTerm(term);
    setSelectedExamId("");

    await fetchExams(term, selectedLevel);
  };

  /*
   * ---------------------------------------------------------
   * Level change
   * ---------------------------------------------------------
   */

  const handleLevelChange = async (event) => {
    const level = event.target.value;

    setSelectedLevel(level);
    setSelectedExamId("");

    await fetchExams(selectedTerm, level);
  };

  /*
   * ---------------------------------------------------------
   * Assign exam
   * ---------------------------------------------------------
   */

  const handleAssignExam = async () => {
    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }

    if (!selectedExamId) {
      setError("Please select an examination.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      await axios.post(`${apiUrl}/api/user-exams/assign`, {
        userId: selectedUserId,
        examId: selectedExamId,
      });

      setSuccess("Examination assigned successfully.");

      setSelectedUserId("");
      setSelectedExamId("");
    } catch (err) {
      console.error("Failed to assign exam:", err);

      setError(getError(err) || "Failed to assign examination.");
    } finally {
      setAssigning(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Clear filters
   * ---------------------------------------------------------
   */

  const clearFilters = () => {
    setSelectedTerm("");
    setSelectedLevel("");
    setSelectedExamId("");
    setExams([]);
    setExamSearch("");
  };

  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (loadingUsers) {
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
        {/* Header */}
        <header className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-variant text-primary">
                <FiUsers className="text-2xl" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-light">
                  Administration
                </p>

                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  Assign Examination
                </h1>

                <p className="mt-1 text-sm text-light">
                  Assign an examination to a system user.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchUsers(true)}
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
              Refresh
            </button>
          </div>
        </header>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-xl border border-danger/30 bg-danger-variant px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-variant px-4 py-3 text-sm text-success">
            <FiCheck />
            {success}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* =====================================================
              USER SECTION
          ====================================================== */}
          <div className="overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-xl">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-variant text-primary">
                  <FiUser />
                </div>

                <div>
                  <h2 className="font-semibold text-white">Select User</h2>

                  <p className="text-xs text-light">
                    {users.length} regular{" "}
                    {users.length === 1 ? "user" : "users"}
                  </p>
                </div>
              </div>

              <div className="relative mt-4">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-light" />

                <input
                  type="text"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search user..."
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

            <div className="max-h-[430px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <FiUsers className="mx-auto text-4xl text-light" />

                  <p className="mt-3 font-medium text-white">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const selected = selectedUserId === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-border
                        px-5
                        py-4
                        text-left
                        transition
                        last:border-b-0
                        ${selected ? "bg-primary/10" : "hover:bg-white/[0.03]"}
                      `}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            font-semibold
                            ${
                              selected
                                ? "bg-primary text-bg"
                                : "bg-primary-variant text-primary"
                            }
                          `}
                        >
                          {(user.name || user.username || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {user.name || "No name"}
                          </p>

                          <p className="truncate text-xs text-light">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      {selected && (
                        <FiCheck className="shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* =====================================================
              EXAM SECTION
          ====================================================== */}
          <div className="overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-xl">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-variant text-primary">
                  <FiFileText />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Select Examination
                  </h2>

                  <p className="text-xs text-light">
                    Filter by class and academic term.
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={selectedTerm}
                  onChange={handleTermChange}
                  className="
                    rounded-xl
                    border
                    border-border
                    bg-bg
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-primary
                  "
                >
                  <option value="">Select Term</option>
                  <option value="FIRST">First Term</option>
                  <option value="SECOND">Second Term</option>
                  <option value="THIRD">Third Term</option>
                </select>

                <select
                  value={selectedLevel}
                  onChange={handleLevelChange}
                  className="
                    rounded-xl
                    border
                    border-border
                    bg-bg
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-primary
                  "
                >
                  <option value="">Select Class</option>
                  <option value="js1">JSS 1</option>
                  <option value="js2">JSS 2</option>
                  <option value="js3">JSS 3</option>
                  <option value="ss1">SSS 1</option>
                  <option value="ss2">SSS 2</option>
                  <option value="ss3">SSS 3</option>
                </select>
              </div>

              <div className="mt-3 flex gap-3">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-light" />

                  <input
                    type="text"
                    value={examSearch}
                    onChange={(event) => setExamSearch(event.target.value)}
                    placeholder="Search subject..."
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

                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    rounded-xl
                    border
                    border-border
                    bg-white/5
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-light
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Exam list */}
            <div className="max-h-[430px] overflow-y-auto">
              {loadingExams ? (
                <div className="flex min-h-[250px] items-center justify-center">
                  <Spinner size="3rem" />
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <FiFileText className="mx-auto text-4xl text-light" />

                  <p className="mt-3 font-medium text-white">
                    No examinations found
                  </p>

                  <p className="mt-1 text-sm text-light">
                    Select a term and class to load examinations.
                  </p>
                </div>
              ) : (
                filteredExams.map((exam) => {
                  const selected = selectedExamId === exam.id;

                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => setSelectedExamId(exam.id)}
                      className={`
                        w-full
                        border-b
                        border-border
                        px-5
                        py-4
                        text-left
                        transition
                        last:border-b-0
                        ${selected ? "bg-primary/10" : "hover:bg-white/[0.03]"}
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {exam.subjectName}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                              {exam.level?.toUpperCase()}
                            </span>

                            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-light">
                              {exam.termType}
                            </span>

                            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-light">
                              {Number(exam.examDuration || 0) / 60} mins
                            </span>
                          </div>
                        </div>

                        {selected && (
                          <FiCheck className="shrink-0 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            ASSIGN ACTION
        ====================================================== */}
        <div className="mt-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Ready to assign?
              </p>

              <p className="mt-1 text-sm text-light">
                Select one user and one examination above.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAssignExam}
              disabled={assigning || !selectedUserId || !selectedExamId}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-6
                py-3
                text-sm
                font-bold
                text-bg
                transition
                hover:brightness-110
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {assigning ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <FiCheck />
                  Assign Examination
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssignExam;
