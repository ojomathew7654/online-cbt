import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiPlus,
  FiEdit2,
  FiSave,
  FiX,
  FiClock,
  FiEye,
  FiEyeOff,
  FiSettings,
} from "react-icons/fi";

import { apiUrl } from "../../../utils";
import { getError } from "../../../components/shared/getError";
import AlertDialog from "../../../components/ui/AlertDialog";

const ExamManagement = () => {
  const subjectRef = useRef(null);

  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState([]);

  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [exam, setExam] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  const [visibilityChanges, setVisibilityChanges] = useState({});
  const [durationChanges, setDurationChanges] = useState({});
  const [shuffleChanges, setShuffleChanges] = useState({});

  /*
   * =========================================================
   * CUSTOM ALERT
   * =========================================================
   */

  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message) => {
    setAlertMessage(message);
    setOpenAlert(true);
  };

  /*
   * =========================================================
   * SCHOOL ID
   * =========================================================
   */

  const schoolId = JSON.parse(
    localStorage.getItem("loggedInStudent"),
  )?.schoolId;

  /*
   * =========================================================
   * INITIALIZE EXAM DURATIONS
   * =========================================================
   */

  useEffect(() => {
    const initialDurations = exam.reduce((acc, ex) => {
      acc[ex.id] = ex.examDuration;

      return acc;
    }, {});

    setDurationChanges(initialDurations);
  }, [exam]);

  /*
   * =========================================================
   * FETCH SUBJECTS
   * =========================================================
   */

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await axios.get(
          `${apiUrl}/api/subjects/subjects/${schoolId}`,
        );

        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);

        showAlert(getError(error));
      }
    };

    if (schoolId) {
      fetchSubjects();
    }
  }, [schoolId]);

  /*
   * =========================================================
   * VISIBILITY CHANGE
   * =========================================================
   */

  const handleCheckboxChange = (examId) => {
    setVisibilityChanges((previous) => ({
      ...previous,
      [examId]: !previous[examId],
    }));
  };

  const handleShuffleChange = (examId) => {
    setShuffleChanges((previous) => ({
      ...previous,
      [examId]: !previous[examId],
    }));
  };

  /*
   * =========================================================
   * DURATION CHANGE
   * =========================================================
   */

  const handleDurationChange = (examId, value) => {
    setDurationChanges((previous) => ({
      ...previous,
      [examId]: Number(value),
    }));
  };

  /*
   * =========================================================
   * FETCH EXAMS
   * =========================================================
   */

  const fetchExam = async (term, level) => {
    try {
      if (!term || !level || !schoolId) {
        return;
      }

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
      console.log(data);
      const exams = Array.isArray(data) ? data : [];
      setExam(exams);
      /*
       * Initialize visibility state
       */
      const initialVisibility = {};
      const initialShuffle = {};

      exams.forEach((ex) => {
        initialVisibility[ex.id] = Boolean(ex.visible);
        initialShuffle[ex.id] = Boolean(ex.shuffleQuestions);
      });

      setVisibilityChanges(initialVisibility);
      setShuffleChanges(initialShuffle);
    } catch (error) {
      console.error("Failed to fetch examinations:", error);

      showAlert(getError(error));
    } finally {
      setLoading(false);
    }
  };
  console.log(exam);

  const handleTermChange = async (event) => {
    const term = event.target.value;
    setSelectedTerm(term);
    await fetchExam(term, selectedLevel);
  };

  /*
   * =========================================================
   * LEVEL CHANGE
   * =========================================================
   */

  const handleLevelChange = async (event) => {
    const level = event.target.value;

    setSelectedLevel(level);

    await fetchExam(selectedTerm, level);
  };

  /*
   * =========================================================
   * SUBJECT CHANGE
   * =========================================================
   */

  const handleSubjectChange = (event) => {
    setSelectedSubjectId(event.target.value);
  };

  /*
   * =========================================================
   * CREATE SUBJECT
   * =========================================================
   */

  const createSubject = async () => {
    const subjectName = subjectRef.current?.value?.trim();

    if (!subjectName) {
      showAlert("Subject name is required.");
      return;
    }

    if (!schoolId) {
      showAlert("School information could not be found.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${apiUrl}/api/subjects/create-subject`, {
        name: subjectName,
        schoolId,
      });

      /*
       * Clear input
       */
      if (subjectRef.current) {
        subjectRef.current.value = "";
      }

      /*
       * Refresh subjects
       */
      const { data } = await axios.get(
        `${apiUrl}/api/subjects/subjects/${schoolId}`,
      );

      setSubjects(Array.isArray(data) ? data : []);

      showAlert("Subject created successfully.");
    } catch (error) {
      console.error("Failed to create subject:", error);

      showAlert(getError(error));
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * CREATE EXAMINATION
   * =========================================================
   */

  const handleAddNewExam = async () => {
    if (!selectedTerm || !selectedLevel || !selectedSubjectId) {
      showAlert("Please select term, class, and subject.");
      return;
    }

    if (!schoolId) {
      showAlert("School information could not be found.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${apiUrl}/api/exams/create-exam`, {
        visible: true,
        termType: selectedTerm,
        level: selectedLevel,
        schoolId,
        subjectId: selectedSubjectId,
        examDuration: 40 * 60,
        questions: [],
      });

      await fetchExam(selectedTerm, selectedLevel);

      showAlert("Successfully added the new exam.");
    } catch (error) {
      console.error("Failed to create examination:", error);

      showAlert(getError(error));
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * UPDATE EXAM SETTINGS
   * =========================================================
   */

  const handleUpdateExams = async () => {
    if (!exam.length) {
      showAlert("There are no examinations to update.");
      return;
    }

    try {
      setLoading(true);

      const updates = Object.keys(visibilityChanges).map((id) => ({
        id,
        visible: Boolean(visibilityChanges[id]),
        examDuration: durationChanges[id],
        shuffleQuestions: Boolean(shuffleChanges[id]),
      }));

      await axios.put(`${apiUrl}/api/exams/update-exam-settings`, {
        updates,
      });

      /*
       * Refresh exams so the UI reflects
       * the values actually saved by the API.
       */
      await fetchExam(selectedTerm, selectedLevel);

      showAlert("Exam settings updated successfully.");
    } catch (error) {
      console.error("Failed to update exam settings:", error);

      showAlert(getError(error));
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * START SUBJECT EDIT
   * =========================================================
   */

  const handleEditClick = (subject) => {
    setEditingId(subject.id);
    setUpdatedName(subject.name);
  };

  /*
   * =========================================================
   * SAVE SUBJECT EDIT
   * =========================================================
   */

  const handleSaveClick = async (id) => {
    const trimmedName = updatedName.trim();

    if (!trimmedName) {
      showAlert("Subject name is required.");
      return;
    }

    try {
      setLoading(true);

      await axios.put(`${apiUrl}/api/subjects/subject/${id}`, {
        name: trimmedName,
      });

      /*
       * Refresh subjects
       */
      const { data } = await axios.get(
        `${apiUrl}/api/subjects/subjects/${schoolId}`,
      );

      setSubjects(Array.isArray(data) ? data : []);

      setEditingId(null);
      setUpdatedName("");

      showAlert("Subject updated successfully.");
    } catch (error) {
      console.error("Failed to update subject:", error);

      showAlert(getError(error));
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * CANCEL SUBJECT EDIT
   * =========================================================
   */

  const handleCancelEdit = () => {
    setEditingId(null);
    setUpdatedName("");
  };

  /*
   * =========================================================
   * SHARED CLASSES
   * =========================================================
   */

  const inputClass =
    "w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-white outline-none transition placeholder:text-light/60 focus:border-primary focus:ring-2 focus:ring-primary/10";

  const selectClass =
    "w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
      {/* =====================================================
          CUSTOM ALERT
      ====================================================== */}

      {openAlert && (
        <AlertDialog setOpenAlert={setOpenAlert} message={alertMessage} />
      )}

      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        {/* =====================================================
    HEADER
====================================================== */}

        <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-6">
            {/* HEADER CONTENT */}

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiSettings size={24} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Academic Administration
                </p>

                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                  Exam Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-light">
                  Create subjects, configure examinations, manage visibility,
                  duration, and question order.
                </p>
              </div>
            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* TOTAL */}

              <div className="rounded-xl border border-border bg-bg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-light">
                      Total
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {exam.length + subjects.length}
                    </p>

                    <p className="mt-1 text-xs text-light">Exams + Subjects</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FiSettings size={20} />
                  </div>
                </div>
              </div>

              {/* EXAMS */}

              <div className="rounded-xl border border-border bg-bg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-light">
                      Exams
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {exam.length}
                    </p>

                    <p className="mt-1 text-xs text-light">Currently loaded</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FiBookOpen size={20} />
                  </div>
                </div>
              </div>

              {/* SUBJECTS */}

              <div className="rounded-xl border border-border bg-bg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-light">
                      Subjects
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                      {subjects.length}
                    </p>

                    <p className="mt-1 text-xs text-light">School subjects</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FiBookOpen size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            CREATE SUBJECT
        ====================================================== */}

        <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiBookOpen />
            </div>

            <div>
              <h2 className="font-semibold text-white">Create New Subject</h2>

              <p className="text-sm text-light">
                Add a subject to your school's academic system.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              ref={subjectRef}
              type="text"
              placeholder="Enter subject name"
              className={inputClass}
              disabled={loading}
            />

            <button
              type="button"
              disabled={loading}
              onClick={createSubject}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiPlus />

              {loading ? "Please wait..." : "Add Subject"}
            </button>
          </div>
        </div>

        {/* =====================================================
            EXAM CONFIGURATION
        ====================================================== */}

        <div className="rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiSettings />
              </div>

              <div>
                <h2 className="font-semibold text-white">Create Examination</h2>

                <p className="text-sm text-light">
                  Select the academic period and subject for the examination.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* TERM */}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-light">
                Term
              </label>

              <select
                value={selectedTerm}
                onChange={handleTermChange}
                className={selectClass}
                disabled={loading}
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
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-light">
                Class
              </label>

              <select
                value={selectedLevel}
                onChange={handleLevelChange}
                className={selectClass}
                disabled={loading}
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

            {/* SUBJECT */}

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-light">
                Subject
              </label>

              <select
                value={selectedSubjectId}
                onChange={handleSubjectChange}
                className={selectClass}
                disabled={loading}
              >
                <option value="" disabled>
                  Select Subject
                </option>

                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleAddNewExam}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiPlus />

              {loading ? "Creating..." : "Create Examination"}
            </button>
          </div>
        </div>

        {/* =====================================================
            EXAM LIST
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-xl">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-white">
                  Examination Settings
                </h2>

                <p className="mt-1 text-sm text-light">
                  Manage visibility, duration, and question order for available
                  examinations.
                </p>
              </div>

              {exam.length > 0 && (
                <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {exam.length} {exam.length === 1 ? "Exam" : "Exams"}
                </span>
              )}
            </div>
          </div>

          {exam.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-light">
                <FiBookOpen size={24} />
              </div>

              <h3 className="font-semibold text-white">
                No examinations found
              </h3>

              <p className="mt-2 text-sm text-light">
                Select a term and class to view available examinations.
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
                        Examination
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Visibility
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Question Order
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Duration
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {exam.map((ex, index) => (
                      <tr
                        key={ex.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        {/* NUMBER */}

                        <td className="px-6 py-5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-light">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </td>

                        {/* EXAM */}

                        <td className="px-6 py-5">
                          <p className="font-semibold text-white">
                            {ex.subjectName}
                          </p>

                          <p className="mt-1 text-xs uppercase text-light">
                            {selectedLevel} • {selectedTerm} Term
                          </p>
                        </td>

                        {/* VISIBILITY */}

                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(visibilityChanges[ex.id])}
                              onClick={() => handleCheckboxChange(ex.id)}
                              className="group inline-flex items-center focus:outline-none"
                            >
                              <span
                                className={`
          relative h-6 w-11 rounded-full transition-colors duration-200
          ${visibilityChanges[ex.id] ? "bg-primary" : "bg-white/10"}
        `}
                              >
                                <span
                                  className={`
            absolute left-1 top-1 h-4 w-4 rounded-full bg-white
            transition-transform duration-200
            ${visibilityChanges[ex.id] ? "translate-x-5" : "translate-x-0"}
          `}
                                />
                              </span>
                            </button>

                            <span className="flex items-center gap-1.5 text-sm text-light">
                              {visibilityChanges[ex.id] ? (
                                <>
                                  <FiEye className="text-success" />
                                  Visible
                                </>
                              ) : (
                                <>
                                  <FiEyeOff />
                                  Hidden
                                </>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* QUESTION ORDER */}

                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(shuffleChanges[ex.id])}
                              aria-label={`Toggle question shuffling for ${ex.subjectName}`}
                              onClick={() => handleShuffleChange(ex.id)}
                              className="group inline-flex items-center focus:outline-none"
                            >
                              <span
                                className={`
          relative h-6 w-11 rounded-full transition-colors duration-200
          ${shuffleChanges[ex.id] ? "bg-primary" : "bg-white/10"}
        `}
                              >
                                <span
                                  className={`
            absolute left-1 top-1 h-4 w-4 rounded-full bg-white
            transition-transform duration-200
            ${shuffleChanges[ex.id] ? "translate-x-5" : "translate-x-0"}
          `}
                                />
                              </span>
                            </button>

                            <span className="text-sm text-light">
                              {shuffleChanges[ex.id]
                                ? "Randomized"
                                : "Original order"}
                            </span>
                          </div>
                        </td>

                        {/* DURATION */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <FiClock className="text-light" />

                            <select
                              value={durationChanges[ex.id] || ""}
                              onChange={(event) =>
                                handleDurationChange(ex.id, event.target.value)
                              }
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                            >
                              <option disabled value="">
                                Select duration
                              </option>

                              <option value={20 * 60}>20 minutes</option>

                              <option value={25 * 60}>25 minutes</option>

                              <option value={30 * 60}>30 minutes</option>

                              <option value={40 * 60}>40 minutes</option>

                              <option value={50 * 60}>50 minutes</option>

                              <option value={60 * 60}>1 hour</option>

                              <option value={70 * 60}>1 hour 10 minutes</option>

                              <option value={80 * 60}>1 hour 20 minutes</option>

                              <option value={90 * 60}>1 hour 30 minutes</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE
              ================================================== */}

              <div className="divide-y divide-border lg:hidden">
                {exam.map((ex, index) => (
                  <div key={ex.id} className="p-5">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <p className="font-semibold text-white">
                            {ex.subjectName}
                          </p>

                          <p className="mt-1 text-xs text-light">
                            {selectedLevel} • {selectedTerm} Term
                          </p>
                        </div>
                      </div>

                      {visibilityChanges[ex.id] ? (
                        <span className="flex items-center gap-1 rounded-full bg-success-variant px-2.5 py-1 text-xs font-semibold text-success">
                          <FiEye />
                          Visible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs text-light">
                          <FiEyeOff />
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* VISIBILITY */}
                      <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-light">
                          Visibility
                        </p>

                        <label className="inline-flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(visibilityChanges[ex.id])}
                            onChange={() => handleCheckboxChange(ex.id)}
                            className="peer sr-only"
                          />

                          <span className="relative h-6 w-11 rounded-full bg-white/10 transition peer-checked:bg-primary">
                            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                          </span>

                          <span className="text-sm text-light">
                            {visibilityChanges[ex.id]
                              ? "Students can see this exam"
                              : "Students cannot see this exam"}
                          </span>
                        </label>
                      </div>
                      {/* QUESTION ORDER */}

                      <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-light">
                          Question Order
                        </p>

                        <label className="inline-flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(shuffleChanges[ex.id])}
                            onChange={() => handleShuffleChange(ex.id)}
                            className="peer sr-only"
                          />

                          <span className="relative h-6 w-11 rounded-full bg-white/10 transition peer-checked:bg-primary">
                            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                          </span>

                          <span className="text-sm text-light">
                            {shuffleChanges[ex.id]
                              ? "Questions are randomized"
                              : "Original question order"}
                          </span>
                        </label>
                      </div>
                      {/* DURATION */}
                      <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-light">
                          Exam Duration
                        </p>

                        <select
                          value={durationChanges[ex.id] || ""}
                          onChange={(event) =>
                            handleDurationChange(ex.id, event.target.value)
                          }
                          className={selectClass}
                        >
                          <option disabled value="">
                            Select duration
                          </option>

                          <option value={20 * 60}>20 minutes</option>

                          <option value={25 * 60}>25 minutes</option>

                          <option value={30 * 60}>30 minutes</option>

                          <option value={40 * 60}>40 minutes</option>

                          <option value={50 * 60}>50 minutes</option>

                          <option value={60 * 60}>1 hour</option>

                          <option value={70 * 60}>1 hour 10 minutes</option>

                          <option value={80 * 60}>1 hour 20 minutes</option>

                          <option value={90 * 60}>1 hour 30 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* =================================================
                  SAVE SETTINGS
              ================================================== */}

              <div className="flex justify-end border-t border-border p-5 sm:p-6">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleUpdateExams}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiSave />

                  {loading ? "Saving..." : "Save Exam Settings"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            SUBJECT MANAGEMENT
        ====================================================== */}

        <div className="rounded-2xl border border-border bg-bg-deep shadow-xl">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">Subject Management</h2>

                <p className="mt-1 text-sm text-light">
                  View and update your school's subjects.
                </p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {subjects.length}{" "}
                {subjects.length === 1 ? "Subject" : "Subjects"}
              </span>
            </div>
          </div>

          {subjects.length === 0 ? (
            <div className="p-10 text-center text-sm text-light">
              No subjects available.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {subjects.map((subject, index) => (
                <div
                  key={subject.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  {editingId === subject.id ? (
                    /* =================================================
                       EDIT SUBJECT
                    ================================================== */

                    <div className="flex w-full flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={updatedName}
                        onChange={(event) => setUpdatedName(event.target.value)}
                        className={inputClass}
                        autoFocus
                        disabled={loading}
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleSaveClick(subject.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiSave />

                          {loading ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleCancelEdit}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-light transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiX />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* =================================================
                       SUBJECT DISPLAY
                    ================================================== */

                    <>
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <p className="font-semibold text-white">
                            {subject.name}
                          </p>

                          <p className="mt-1 text-xs text-light">Subject</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEditClick(subject)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-light transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                      >
                        <FiEdit2 />
                        Edit Subject
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExamManagement;
