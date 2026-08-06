import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiUsers, FiChevronDown } from "react-icons/fi";

import Dialog from "../../../components/ui/Dialog";
import { apiUrl, getError } from "../../../utils";
import Spinner from "../../../components/ui/Spinner";

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const schoolId = JSON.parse(
    localStorage.getItem("loggedInStudent"),
  )?.schoolId;

  const handleLevelChange = async (event) => {
    const selectedLevel = event.target.value;

    if (!selectedLevel) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${apiUrl}/api/students/get-students-by-level/${selectedLevel}/${schoolId}`,
      );

      setStudents(data);
    } catch (error) {
      console.error(getError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = (studentId) => {
    setStudentToDelete(studentId);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setLoading(true);

      await axios.delete(`${apiUrl}/api/students/student/${studentToDelete}`);

      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.id !== studentToDelete),
      );

      setOpenDialog(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error(getError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {openDialog && (
        <Dialog
          message="Are you sure you want to delete this student?"
          action={confirmDelete}
          setOpenDialog={setOpenDialog}
        />
      )}

      <section className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-variant text-primary">
                  <FiUsers className="text-2xl" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-light">
                    Student Management
                  </p>

                  <h1 className="text-2xl font-bold text-white">
                    All Students
                  </h1>

                  <p className="mt-1 text-sm text-light">
                    View and manage students by class level.
                  </p>
                </div>
              </div>

              {/* Level Select */}
              <div className="relative w-full md:w-56">
                <select
                  onChange={handleLevelChange}
                  defaultValue=""
                  className="
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-border
                    bg-bg
                    px-4
                    py-3
                    pr-10
                    text-sm
                    font-medium
                    text-white
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                  "
                >
                  <option value="" disabled>
                    Select level
                  </option>
                  <option value="js1">JSS 1</option>
                  <option value="js2">JSS 2</option>
                  <option value="js3">JSS 3</option>
                  <option value="ss1">SSS 1</option>
                  <option value="ss2">SSS 2</option>
                  <option value="ss3">SSS 3</option>
                </select>

                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-light" />
              </div>
            </div>
          </div>

          {/* Students */}
          <div className="overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-xl">
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <Spinner size="4rem" />
              </div>
            ) : students.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-light">
                  <FiUsers className="text-2xl" />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  No students available
                </h2>

                <p className="mt-1 max-w-md text-sm text-light">
                  Select a class level above to view the students in that class.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-white/[0.025]">
                      <th className="w-16 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-light">
                        No
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Name
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Surname
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Username
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Password
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-light">
                        Class
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-light">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {students.map((student, index) => (
                      <tr
                        key={student.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-5 text-center">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-light">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-sm font-medium text-white">
                          {student.name}
                        </td>

                        <td className="px-5 py-5 text-sm text-light">
                          {student.surname}
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-light">
                            {student.username}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-lg bg-white/5 px-3 py-1.5 font-mono text-sm text-light">
                            {student.password}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-full bg-primary-variant px-3 py-1.5 text-xs font-semibold uppercase text-primary">
                            {student.level}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/edit-student/${student.id}`}
                              title="Edit student"
                              className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-lg
                                bg-primary-variant
                                text-primary
                                transition
                                hover:bg-primary/20
                              "
                            >
                              <FiEdit2 />
                            </Link>

                            <button
                              type="button"
                              title="Delete student"
                              onClick={() => handleDeleteStudent(student.id)}
                              disabled={loading}
                              className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-lg
                                bg-danger-variant
                                text-danger
                                transition
                                hover:bg-danger/20
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AllStudents;
