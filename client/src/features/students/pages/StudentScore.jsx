import { useState } from "react";
import axios from "axios";
import { FiTrash2, FiBarChart2, FiFilter } from "react-icons/fi";

import { apiUrl, getError } from "../../../utils";
import Spinner from "../../../components/ui/Spinner";

const StudentScore = () => {
  const [students, setStudents] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [exam, setExam] = useState([]);
  const [examId, setExamId] = useState(null);
  const [loading, setLoading] = useState(false);

  const schoolId = JSON.parse(
    localStorage.getItem("loggedInStudent"),
  )?.schoolId;

  const fetchExam = async (term, level) => {
    if (!term || !level) return;

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

      setExam(data);
    } catch (error) {
      console.error(getError(error));
    } finally {
      setLoading(false);
    }
  };

  const studentsWithScore = async (id, level) => {
    if (!schoolId || !id || !level) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${apiUrl}/api/students/students-with-exam/${schoolId}/${id}/${level}`,
      );

      setStudents(data);
    } catch (error) {
      console.error(getError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = async (event) => {
    const term = event.target.value;

    setSelectedTerm(term);
    setExamId(null);
    setStudents([]);

    await fetchExam(term, selectedLevel);
  };

  const handleLevelChange = async (event) => {
    const level = event.target.value;

    setSelectedLevel(level);
    setExamId(null);
    setStudents([]);

    await fetchExam(selectedTerm, level);
  };

  const handleExamChange = async (event) => {
    const id = event.target.value;

    setExamId(id);

    if (id) {
      await studentsWithScore(id, selectedLevel);
    } else {
      setStudents([]);
    }
  };

  const handleDeleteExam = async (studentId) => {
    if (!examId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam score?",
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await axios.delete(
        `${apiUrl}/api/students/delete-student-subject/${studentId}/${examId}`,
      );

      await studentsWithScore(examId, selectedLevel);
    } catch (error) {
      console.error(getError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiBarChart2 className="text-2xl" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Students Exam Scores
              </h1>

              <p className="mt-1 text-sm text-light">
                View and manage student examination results.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <FiFilter className="text-primary" />

            <h2 className="text-sm font-semibold text-white">
              Examination Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-light">
                Term
              </label>

              <select
                value={selectedTerm}
                onChange={handleTermChange}
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              >
                <option value="" disabled>
                  Select Term
                </option>
                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-light">
                Class
              </label>

              <select
                value={selectedLevel}
                onChange={handleLevelChange}
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              >
                <option value="" disabled>
                  Select Class
                </option>
                <option value="js1">JS 1</option>
                <option value="js2">JS 2</option>
                <option value="js3">JS 3</option>
                <option value="ss1">SS 1</option>
                <option value="ss2">SS 2</option>
                <option value="ss3">SS 3</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-light">
                Examination
              </label>

              <select
                value={examId || ""}
                onChange={handleExamChange}
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              >
                <option value="">Select Exam</option>

                {exam.map((examItem) => (
                  <option key={examItem.id} value={examItem.id}>
                    {examItem.subjectName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-border bg-bg-deep">
            <Spinner size="5rem" />
          </div>
        ) : examId ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-white">Examination Results</h2>

              <p className="mt-1 text-sm text-light">
                View students who submitted the selected exam.
              </p>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-white/[0.025]">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                      No
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                      Subject
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                      Name
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                      Surname
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                      Score
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-light">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 text-sm text-light">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-white">
                        {student.subjectName}
                      </td>

                      <td className="px-5 py-4 text-sm text-light">
                        {student.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-light">
                        {student.surname}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                          {student.score}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteExam(student.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-danger-variant px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger/20"
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className="rounded-xl border border-border bg-bg p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <p className="font-semibold text-white">
                          {student.name} {student.surname}
                        </p>

                        <p className="text-xs text-light">
                          {student.subjectName}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                      {student.score}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteExam(student.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger-variant py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20"
                  >
                    <FiTrash2 />
                    Delete Exam Score
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-deep px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-light">
              <FiBarChart2 className="text-2xl" />
            </div>

            <h2 className="font-semibold text-white">
              No Examination Selected
            </h2>

            <p className="mt-2 max-w-md text-sm text-light">
              Select a term, class, and examination to view students who wrote
              the selected exam.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentScore;
