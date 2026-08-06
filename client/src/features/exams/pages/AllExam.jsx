import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit3, FiTrash2, FiFilter, FiFileText } from "react-icons/fi";

import { apiUrl, getError } from "../../../utils";
import Spinner from "../../../components/ui/Spinner";
import AlertDialog from "../../../components/ui/AlertDialog";
import Dialog from "../../../components/ui/Dialog";

const AllExam = () => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(false);

  /*
   * ---------------------------------------------------------
   * ALERT DIALOG
   * ---------------------------------------------------------
   */
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  /*
   * ---------------------------------------------------------
   * CONFIRMATION DIALOG
   * ---------------------------------------------------------
   */
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState(null);

  /*
   * ---------------------------------------------------------
   * SCHOOL ID
   * ---------------------------------------------------------
   */
  const schoolId = JSON.parse(
    localStorage.getItem("loggedInStudent"),
  )?.schoolId;

  /*
   * ---------------------------------------------------------
   * SHOW ALERT
   * ---------------------------------------------------------
   */
  const showAlert = (message) => {
    setAlertMessage(message);
    setOpenAlert(true);
  };

  /*
   * ---------------------------------------------------------
   * FETCH EXAMS
   * ---------------------------------------------------------
   */
  const fetchExams = async (term, level) => {
    if (!term || !level) {
      return;
    }

    try {
      setLoading(true);

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
    } catch (error) {
      console.error(getError(error));

      showAlert(
        getError(error) || "Failed to load examinations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * TERM CHANGE
   * ---------------------------------------------------------
   */
  const handleTermChange = async (event) => {
    const term = event.target.value;

    setSelectedTerm(term);

    await fetchExams(term, selectedLevel);
  };

  /*
   * ---------------------------------------------------------
   * LEVEL CHANGE
   * ---------------------------------------------------------
   */
  const handleLevelChange = async (event) => {
    const level = event.target.value;

    setSelectedLevel(level);

    await fetchExams(selectedTerm, level);
  };

  /*
   * ---------------------------------------------------------
   * OPEN DELETE CONFIRMATION
   * ---------------------------------------------------------
   */
  const handleDelete = (examId) => {
    setSelectedExamId(examId);

    setDialogMessage(
      "This examination and its associated questions may be permanently removed. This action cannot be undone.",
    );

    setOpenDialog(true);
  };

  /*
   * ---------------------------------------------------------
   * CONFIRM DELETE
   * ---------------------------------------------------------
   */
  const confirmDelete = async () => {
    if (!selectedExamId) {
      return;
    }

    try {
      setDialogLoading(true);

      await axios.delete(`${apiUrl}/api/exams/delete/${selectedExamId}`);

      /*
       * Remove deleted exam from current UI immediately.
       */
      setExams((prev) => prev.filter((exam) => exam.id !== selectedExamId));

      /*
       * Close confirmation dialog.
       */
      setOpenDialog(false);

      /*
       * Reset selected exam.
       */
      setSelectedExamId(null);

      /*
       * Show custom success notification.
       */
      showAlert("Exam deleted successfully.");
    } catch (error) {
      console.error(getError(error));

      /*
       * Close confirmation dialog.
       */
      setOpenDialog(false);

      setSelectedExamId(null);

      /*
       * Show custom error notification.
       */
      showAlert(getError(error) || "Failed to delete exam. Please try again.");
    } finally {
      setDialogLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CLEAR FILTERS
   * ---------------------------------------------------------
   */
  const clearFilters = () => {
    setSelectedTerm("");
    setSelectedLevel("");
    setExams([]);
  };

  return (
    <section className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            CUSTOM ALERT
        ====================================================== */}
        {openAlert && (
          <AlertDialog setOpenAlert={setOpenAlert} message={alertMessage} />
        )}

        {/* =====================================================
            CUSTOM DELETE CONFIRMATION
        ====================================================== */}
        {openDialog && (
          <Dialog
            setOpenDialog={setOpenDialog}
            message={dialogMessage}
            action={confirmDelete}
            loading={dialogLoading}
            title="Delete Examination"
          />
        )}

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FiFileText size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                  All Exams
                </h1>

                <p className="mt-1 text-sm text-light">
                  Manage examinations, questions, visibility and exam settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FILTER CARD
        ====================================================== */}
        <div className="mb-6 rounded-2xl border border-border bg-bg-deep/60 p-4 shadow-lg sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <FiFilter className="text-primary" size={18} />

            <h2 className="font-medium text-white">Filter Exams</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* TERM */}
            <div>
              <label
                htmlFor="term"
                className="mb-2 block text-sm font-medium text-light"
              >
                Academic Term
              </label>

              <select
                id="term"
                value={selectedTerm}
                onChange={handleTermChange}
                className="
                  w-full rounded-xl
                  border border-border
                  bg-bg
                  px-4 py-3
                  text-sm text-white
                  outline-none
                  transition
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
              >
                <option value="" disabled>
                  Select Term
                </option>

                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term</option>
              </select>
            </div>

            {/* CLASS */}
            <div>
              <label
                htmlFor="level"
                className="mb-2 block text-sm font-medium text-light"
              >
                Class
              </label>

              <select
                id="level"
                value={selectedLevel}
                onChange={handleLevelChange}
                className="
                  w-full rounded-xl
                  border border-border
                  bg-bg
                  px-4 py-3
                  text-sm text-white
                  outline-none
                  transition
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
              >
                <option value="" disabled>
                  Select Class
                </option>

                <option value="js1">JSS 1</option>
                <option value="js2">JSS 2</option>
                <option value="js3">JSS 3</option>
                <option value="ss1">SSS 1</option>
                <option value="ss2">SSS 2</option>
                <option value="ss3">SSS 3</option>
              </select>
            </div>

            {/* CLEAR FILTER */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="
                  w-full rounded-xl
                  border border-border
                  bg-white/5
                  px-4 py-3
                  text-sm font-medium text-light
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-deep/50 shadow-xl">
          {/* ===================================================
              CONTENT HEADER
          ==================================================== */}
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-white">Examination List</h2>

              <p className="mt-1 text-xs text-light">
                {exams.length} {exams.length === 1 ? "exam" : "exams"} found
              </p>
            </div>

            {selectedLevel && selectedTerm && (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  {selectedLevel.toUpperCase()}
                </span>

                <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-light">
                  {selectedTerm} TERM
                </span>
              </div>
            )}
          </div>

          {/* ===================================================
              LOADING
          ==================================================== */}
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <Spinner size="4rem" />
            </div>
          ) : exams.length === 0 ? (
            /* =================================================
                EMPTY STATE
            ================================================== */
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-light">
                <FiFileText size={28} />
              </div>

              <h3 className="text-lg font-semibold text-white">
                No exams found
              </h3>

              <p className="mt-2 max-w-md text-sm text-light">
                Select an academic term and class above to view the available
                examinations.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-white/[0.02]">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        No
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Subject
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Level
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Term
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Duration
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-light">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {exams.map((exam, index) => (
                      <tr
                        key={exam.id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        {/* NUMBER */}
                        <td className="px-6 py-5 text-sm text-light">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        {/* SUBJECT */}
                        <td className="px-6 py-5">
                          <div className="font-medium text-white">
                            {exam.subjectName}
                          </div>
                        </td>

                        {/* LEVEL */}
                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                            {exam.level.toUpperCase()}
                          </span>
                        </td>

                        {/* TERM */}
                        <td className="px-6 py-5 text-sm text-light">
                          {exam.termType}
                        </td>

                        {/* DURATION */}
                        <td className="px-6 py-5 text-sm text-light">
                          {exam.examDuration / 60} mins
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-5">
                          {exam.visible ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-success-variant px-3 py-1.5 text-xs font-medium text-success">
                              <span className="h-1.5 w-1.5 rounded-full bg-success" />
                              Visible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-danger-variant px-3 py-1.5 text-xs font-medium text-danger">
                              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                              Hidden
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/exam/${exam.id}`}
                              className="
                                inline-flex items-center gap-2
                                rounded-lg
                                bg-primary/10
                                px-3 py-2
                                text-xs font-medium text-primary
                                transition
                                hover:bg-primary/20
                              "
                            >
                              <FiEdit3 size={15} />
                              Questions
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDelete(exam.id)}
                              className="
                                inline-flex items-center gap-2
                                rounded-lg
                                bg-danger-variant
                                px-3 py-2
                                text-xs font-medium text-danger
                                transition
                                hover:bg-danger/30
                              "
                            >
                              <FiTrash2 size={15} />
                              Delete
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
              <div className="grid gap-4 p-4 sm:p-6 lg:hidden">
                {exams.map((exam, index) => (
                  <div
                    key={exam.id}
                    className="
                      rounded-xl
                      border border-border
                      bg-bg
                      p-4
                      transition
                      hover:border-primary/30
                    "
                  >
                    {/* CARD HEADER */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div>
                          <h3 className="font-semibold text-white">
                            {exam.subjectName}
                          </h3>

                          <p className="mt-1 text-xs text-light">
                            {exam.level.toUpperCase()} • {exam.termType} TERM
                          </p>
                        </div>
                      </div>

                      {exam.visible ? (
                        <span className="rounded-full bg-success-variant px-2.5 py-1 text-[11px] font-medium text-success">
                          Visible
                        </span>
                      ) : (
                        <span className="rounded-full bg-danger-variant px-2.5 py-1 text-[11px] font-medium text-danger">
                          Hidden
                        </span>
                      )}
                    </div>

                    {/* CARD INFORMATION */}
                    <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-white/[0.025] p-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-light">
                          Class
                        </p>

                        <p className="mt-1 text-sm font-medium text-white">
                          {exam.level.toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-light">
                          Duration
                        </p>

                        <p className="mt-1 text-sm font-medium text-white">
                          {exam.examDuration / 60} mins
                        </p>
                      </div>
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="flex gap-2">
                      <Link
                        to={`/exam/${exam.id}`}
                        className="
                          flex flex-1
                          items-center justify-center gap-2
                          rounded-lg
                          bg-primary/10
                          px-3 py-2.5
                          text-xs font-medium text-primary
                          transition
                          hover:bg-primary/20
                        "
                      >
                        <FiEdit3 size={15} />
                        Questions
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(exam.id)}
                        className="
                          flex
                          items-center justify-center gap-2
                          rounded-lg
                          bg-danger-variant
                          px-4 py-2.5
                          text-xs font-medium text-danger
                          transition
                          hover:bg-danger/30
                        "
                      >
                        <FiTrash2 size={15} />
                        Delete
                      </button>
                    </div>
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

export default AllExam;
