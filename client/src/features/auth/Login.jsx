import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FormInput } from "../../components/shared/form/FormInput";
import axios from "axios";
import { apiUrl, getError } from "../../utils";
import { IoIosEyeOff, IoMdEye } from "react-icons/io";
import { FiArrowLeft, FiLogIn, FiShield } from "react-icons/fi";
import Spinner from "../../components/ui/Spinner";

const Login = () => {
  const navigate = useNavigate();
  const nameRef = useRef(null);

  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInStudent");

    if (loggedInUser) {
      navigate("/student");
      return;
    }

    nameRef.current?.focus();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const loginData = {
      username: values.username,
      password: values.password,
    };

    try {
      const { data } = await axios.post(
        `${apiUrl}/api/users/user-student-login`,
        loginData,
      );

      const loggedInUser = {
        ...data,
        role: data.role,
      };

      localStorage.setItem("loggedInStudent", JSON.stringify(loggedInUser));

      if (data.role === "ADMIN") {
        localStorage.setItem("isAdmin", "true");
        navigate("/admin");
      } else if (data.role === "USER") {
        localStorage.setItem("isAdmin", "true");
        navigate("/user");
      } else if (data.role === "STUDENT") {
        localStorage.setItem("isAdmin", "false");
        navigate("/student");
      } else {
        localStorage.removeItem("loggedInStudent");
        localStorage.removeItem("isAdmin");

        setError("Invalid user role.");
      }
    } catch (error) {
      console.error("Login failed:", error);

      // =========================================================
      // SERVER RESPONDED WITH AN ERROR
      // =========================================================

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Unable to complete login. Please try again.",
        );
      }

      // =========================================================
      // REQUEST WAS SENT BUT NO RESPONSE WAS RECEIVED
      // =========================================================
      else if (error.request) {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      }

      // =========================================================
      // REQUEST COULD NOT BE CREATED
      // =========================================================
      else {
        setError(
          "Something went wrong while trying to log in. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   setLoading(true);
  //   setError("");

  //   const loginData = {
  //     username: values.username,
  //     password: values.password,
  //   };

  //   try {
  //     try {
  //       const { data } = await axios.post(
  //         `${apiUrl}/api/users/login-user`,
  //         loginData,
  //       );

  //       const loggedInUser = {
  //         ...data,
  //         role: data.role || "USER",
  //       };

  //       localStorage.setItem("loggedInStudent", JSON.stringify(loggedInUser));

  //       localStorage.setItem("isAdmin", "true");

  //       if (loggedInUser.role === "ADMIN") {
  //         navigate("/admin");
  //       } else if (loggedInUser.role === "USER") {
  //         navigate("/user");
  //       } else {
  //         localStorage.removeItem("loggedInStudent");
  //         localStorage.removeItem("isAdmin");

  //         setError("Invalid user role.");
  //       }

  //       return;
  //     } catch (userError) {
  //       console.log(
  //         "User login failed, trying student login...",
  //         getError(userError),
  //       );
  //     }

  //     const { data: student } = await axios.post(
  //       `${apiUrl}/api/students/login-student`,
  //       loginData,
  //     );

  //     const loggedInStudent = {
  //       ...student,
  //       role: "STUDENT",
  //       token: student.token || null,
  //     };

  //     localStorage.setItem("loggedInStudent", JSON.stringify(loggedInStudent));

  //     localStorage.setItem("isAdmin", "false");

  //     navigate("/student");
  //   } catch (studentError) {
  //     console.error("Login failed:", studentError);

  //     setError(getError(studentError) || "Invalid username or password.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <main className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FiShield size={26} />
            </div>

            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-light">
              Sign in to access your examination portal.
            </p>
          </div>

          {/* Login Card */}
          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-border bg-bg-deep/70 p-5 shadow-2xl backdrop-blur-sm sm:p-7"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Sign in to your account
              </h2>

              <p className="mt-1 text-sm text-light">
                Enter your username and password to continue.
              </p>
            </div>

            <div className="space-y-4">
              <FormInput
                // errMes="Username should be 3-16 characters and must not include any special character!"
                label="Username"
                type="text"
                placeholder="Enter your username"
                name="username"
                required={true}
                nameRef={nameRef}
                // pattern="^[A-Za-z0-9]{3,16}$"
                value={values.username}
                onChange={handleInputChange}
              />

              <FormInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                name="password"
                required={true}
                value={values.password}
                onChange={handleInputChange}
                eyeOpen={<IoMdEye />}
                eyeClose={<IoIosEyeOff />}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3">
                <p className="text-sm leading-5 text-danger">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-bg/30 border-t-bg" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  <span>Login</span>
                </>
              )}
            </button>

            {/* Back */}
            <Link
              to="/"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-light transition hover:text-primary"
            >
              <FiArrowLeft size={16} />
              Go home
            </Link>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-light/70">
            Secure examination portal
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
