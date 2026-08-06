import { useEffect, useRef, useState } from "react";
import { FormInput } from "../../../components/shared/form/FormInput";
import axios from "axios";
import { getError } from "../../../components/shared/getError";
import { apiUrl } from "../../../utils";
import { FiBookOpen, FiLoader, FiUserPlus, FiUsers } from "react-icons/fi";

const Register = () => {
  const [loading, setLoading] = useState(false);

  const initialValues = {
    level: "",
    password: "",
    confirmPassword: "",
    name: "",
    username: "",
    surname: "",
  };

  const [values, setValues] = useState(initialValues);

  const nameRef = useRef(null);

  const LEVEL_OPTIONS = ["js1", "js2", "js3", "ss1", "ss2", "ss3"].map(
    (level) => ({
      value: level,
      label: level.toUpperCase(),
    }),
  );

  const schoolId = JSON.parse(
    localStorage.getItem("loggedInStudent"),
  )?.schoolId;

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${apiUrl}/api/students/create-student`, {
        level: values.level,
        password: values.password,
        name: values.name,
        username: values.username,
        surname: values.surname,
        schoolId,
      });

      alert("Student registered successfully");
      setValues(initialValues);
    } catch (error) {
      console.log(getError(error));
      alert(getError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <div className="w-full">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FiUserPlus size={26} />
            </div>

            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Register Student
            </h1>

            <p className="mt-2 text-sm text-light">
              Create a new student account for your school.
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleAddStudent}
            className="rounded-2xl border border-border bg-bg-deep/70 p-5 shadow-2xl backdrop-blur-sm sm:p-7"
          >
            {/* Form Header */}
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiUsers size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-white">
                  Student Information
                </h2>

                <p className="text-xs text-light">
                  Enter the student's details below.
                </p>
              </div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                label="Surname"
                type="text"
                nameRef={nameRef}
                placeholder="Enter surname"
                name="surname"
                required={true}
                value={values.surname}
                onChange={handleInputChange}
              />

              <FormInput
                label="First Name"
                type="text"
                placeholder="Enter first name"
                name="name"
                required={true}
                value={values.name}
                onChange={handleInputChange}
              />

              <FormInput
                errMes="Username should be 3-16 characters and must not include any special character or space."
                label="Username"
                type="text"
                placeholder="Enter username"
                name="username"
                required={true}
                pattern="^[A-Za-z0-9]{3,16}$"
                value={values.username}
                onChange={handleInputChange}
              />

              <FormInput
                label="Password"
                errMes="Password should be 8-20 characters and include at least 1 number and 1 letter."
                type="password"
                placeholder="Enter password"
                name="password"
                required={true}
                pattern="^(?=.*[0-9])(?=.*[a-zA-Z]).{8,20}$"
                value={values.password}
                onChange={handleInputChange}
              />
            </div>

            {/* Class */}
            <div className="mt-5">
              <label
                htmlFor="level"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-white/80"
              >
                <FiBookOpen size={16} className="text-primary" />
                Student Class
              </label>

              <select
                value={values.level}
                onChange={handleInputChange}
                name="level"
                id="level"
                required
                className="h-12 w-full cursor-pointer rounded-xl border border-border bg-bg px-4 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled hidden>
                  Select class
                </option>

                {LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={18} />
                  Registering Student...
                </>
              ) : (
                <>
                  <FiUserPlus size={18} />
                  Register Student
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-light/60">
            Student accounts created here will be associated with your school.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
