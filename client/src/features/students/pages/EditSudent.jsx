import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiSave, FiUser, FiLock } from "react-icons/fi";
import { MdSchool } from "react-icons/md";

import { apiUrl, getError } from "../../../utils";

const EditStudent = () => {
  const { studentId = "" } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [student, setStudent] = useState({
    id: "",
    level: "",
    password: "",
    name: "",
    username: "",
    surname: "",
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await axios.get(
          `${apiUrl}/api/students/student/${studentId}`,
        );

        setStudent(data);
      } catch (error) {
        console.error("Error fetching student:", getError(error));
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await axios.patch(`${apiUrl}/api/students/student/${studentId}`, student);

      alert("Student updated successfully");
      navigate(-1);
    } catch (error) {
      console.error(getError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-variant text-primary">
                <FiUser className="text-2xl" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-light">
                  Student Management
                </p>

                <h1 className="text-2xl font-bold text-white">Edit Student</h1>

                <p className="mt-1 text-sm text-light">
                  Update the {"student's"} account information.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-border
                bg-white/5
                px-4
                py-2.5
                text-sm
                font-medium
                text-light
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <FiArrowLeft />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleUpdateStudent}
          className="rounded-2xl border border-border bg-bg-deep p-5 shadow-xl sm:p-6"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
            <MdSchool className="text-xl text-primary" />

            <div>
              <h2 className="font-semibold text-white">Student Information</h2>

              <p className="text-xs text-light">
                Make the necessary changes below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-light">
                First Name
              </label>

              <input
                type="text"
                name="name"
                value={student.name}
                onChange={handleInputChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-bg
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-light/50
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
                placeholder="Enter first name"
              />
            </div>

            {/* Surname */}
            <div>
              <label className="mb-2 block text-sm font-medium text-light">
                Surname
              </label>

              <input
                type="text"
                name="surname"
                value={student.surname}
                onChange={handleInputChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-bg
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
                placeholder="Enter surname"
              />
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-light">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={student.username}
                onChange={handleInputChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-bg
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
                placeholder="Enter username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-light">
                <FiLock className="text-primary" />
                Password
              </label>

              <input
                type="text"
                name="password"
                value={student.password}
                onChange={handleInputChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-bg
                  px-4
                  py-3
                  font-mono
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
                placeholder="Enter password"
              />
            </div>

            {/* Level */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-light">
                Class Level
              </label>

              <select
                name="level"
                value={student.level}
                onChange={handleInputChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-bg
                  px-4
                  py-3
                  text-sm
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
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                rounded-xl
                border
                border-border
                bg-white/5
                px-5
                py-3
                text-sm
                font-medium
                text-light
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              Cancel
            </button>

            <button
              disabled={loading}
              type="submit"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-5
                py-3
                text-sm
                font-semibold
                text-bg
                shadow-lg
                shadow-primary/10
                transition
                hover:brightness-110
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FiSave />

              {loading ? "Updating..." : "Update Student"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditStudent;
