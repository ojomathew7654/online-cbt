import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./features/auth/pages/Login";
import Home from "./features/dashboard/Home";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./features/dashboard/AdminDashboard";
import Register from "./features/auth/pages/Register";
import SetExam from "./features/exams/pages/SetExam";
import AllExam from "./features/exams/pages/AllExam";
import ExamManagement from "./features/exams/pages/ExamManagement";
import AddSingleQue from "./features/exam-editor/pages/AddSingleQue";
import EditQuestion from "./features/exam-editor/pages/EditQuestion";
import AllStudents from "./features/students/pages/AllStudents";
import EditStudent from "./features/students/pages/EditSudent";
import StudentScore from "./features/students/pages/StudentScore";
// import Admin from "./features/settings/AdminSettings";
import UserLayout from "./layouts/UserLayout";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./features/dashboard/StudentDashboard";
import Exam from "./features/exams/pages/Exam";
import ExamHistory from "./features/exams/pages/ExamHistory";
import UserManagement from "./features/dashboard/UserManagement";
import AssignExam from "./features/exams/pages/AssignExam";
import ExamQuestions from "./features/exams/pages/ExamQuestions";
import RoleLayout from "./layouts/RoleLayout ";
import TeacherDashboard from "./features/dashboard/TeacherDashboard";

const getUser = () => {
  try {
    const storedUser = localStorage.getItem("loggedInStudent");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Invalid stored user:", error);
    localStorage.removeItem("loggedInStudent");
    return null;
  }
};

const RequireAuth = ({ children }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RequireRole = ({ role, roles, children }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles || [role];

  if (!allowedRoles.includes(user.role)) {
    // Stored session is invalid for this route.
    localStorage.removeItem("loggedInStudent");
    localStorage.removeItem("isAdmin");

    return <Navigate to="/login" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  // =========================================================
  // PUBLIC / AUTH
  // =========================================================
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },

  {
    path: "/",
    element: <Home />,
  },

  // =========================================================
  // ADMIN
  // =========================================================
  {
    element: (
      <RequireRole role="ADMIN">
        <AdminLayout />
      </RequireRole>
    ),

    children: [
      {
        path: "/admin",
        element: <AdminDashboard />,
      },

      {
        path: "/register",
        element: <Register />,
      },

      {
        path: "/users",
        element: <UserManagement />,
      },

      {
        path: "/setexam",
        element: <SetExam />,
      },

      {
        path: "/assign-exam",
        element: <AssignExam />,
      },

      {
        path: "/allExam",
        element: <AllExam />,
      },
      {
        path: "/exam-management",
        element: <ExamManagement />,
      },

      {
        path: "/studentlist",
        element: <AllStudents />,
      },

      {
        path: "/edit-student/:studentId",
        element: <EditStudent />,
      },

      {
        path: "/score",
        element: <StudentScore />,
      },
    ],
  },

  // =========================================================
  // USER / TEACHER
  // =========================================================
  {
    element: (
      <RequireRole role="USER">
        <UserLayout />
      </RequireRole>
    ),

    children: [
      {
        path: "/user",
        element: <TeacherDashboard />,
      },
    ],
  },

  // =========================================================
  // SHARED ADMIN + USER / TEACHER
  // =========================================================
  {
    element: (
      <RequireRole roles={["ADMIN", "USER"]}>
        <RoleLayout />
      </RequireRole>
    ),

    children: [
      {
        path: "/add-question/:examId",
        element: <AddSingleQue />,
      },

      {
        path: "/edit-question/:questionId",
        element: <EditQuestion />,
      },
      {
        path: "/exam/:examId",
        element: <ExamQuestions />,
      },
    ],
  },
  // =========================================================
  // STUDENT
  // =========================================================

  {
    element: (
      <RequireRole role="STUDENT">
        <StudentLayout />
      </RequireRole>
    ),

    children: [
      {
        path: "/student",
        element: <StudentDashboard />,
      },

      {
        path: "/selected-exam/:examId",
        element: <Exam />,
      },

      {
        path: "/exam-history",
        element: <ExamHistory />,
      },
    ],
  },

  // =========================================================
  // UNAUTHORIZED
  // =========================================================

  {
    path: "/unauthorized",
    element: (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-bg-deep p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger-variant">
            <span className="text-2xl">!</span>
          </div>

          <h1 className="text-3xl font-semibold text-white">Access Denied</h1>

          <p className="mt-3 text-light">
            You do not have permission to access this page.
          </p>

          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="mt-6 rounded-xl bg-primary px-6 py-3 font-medium text-bg transition hover:opacity-90"
          >
            Back to Login
          </button>
        </div>
      </div>
    ),
  },

  // =========================================================
  // FALLBACK
  // =========================================================

  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
