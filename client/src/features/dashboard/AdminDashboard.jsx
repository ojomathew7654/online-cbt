import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUsers,
  FiBook,
  FiClipboard,
  FiArrowRight,
  FiActivity,
  FiShield,
  FiEye,
  FiEyeOff,
  FiSettings,
  FiDatabase,
  FiUserPlus,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";

import Spinner from "../../components/ui/Spinner";
import Dialog from "../../components/ui/Dialog";
import { apiUrl, getError } from "../../utils";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [updatingHistoryAccess, setUpdatingHistoryAccess] = useState(false);
  const [deletingHistory, setDeletingHistory] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInStudent"));
    } catch {
      return null;
    }
  })();

  const schoolId = user?.schoolId;

  const fetchDashboard = async (showRefreshing = false) => {
    if (!schoolId) {
      setError("School information could not be found.");
      setLoading(false);
      return;
    }

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data } = await axios.get(
        `${apiUrl}/api/users/admin/dashboard/${schoolId}`,
      );

      setDashboard(data);
    } catch (error) {
      console.error("Failed to fetch admin dashboard:", getError(error));

      setError(
        getError(error) || "Unable to load the administration dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [schoolId]);

  const handleAllowStudentToggle = async () => {
    if (!dashboard || updatingHistoryAccess) return;

    const newValue = !dashboard.viewExamHistory;

    try {
      setUpdatingHistoryAccess(true);

      await axios.put(`${apiUrl}/api/users/school/${schoolId}`, {
        viewExamHistory: newValue,
      });

      setDashboard((prev) => ({
        ...prev,
        viewExamHistory: newValue,
      }));
    } catch (error) {
      console.error("Error updating exam history access:", getError(error));
    } finally {
      setUpdatingHistoryAccess(false);
    }
  };

  const deleteAllExamHistory = async () => {
    try {
      setDeletingHistory(true);

      await axios.delete(`${apiUrl}/api/students/delete-answers/${schoolId}`);

      setDashboard((prev) => ({
        ...prev,
        examHistoryCount: 0,
      }));

      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting exam history:", getError(error));
    } finally {
      setDeletingHistory(false);
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner size="4rem" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-2xl border border-danger/20 bg-bg-deep/70 p-8 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <FiActivity size={24} />
            </div>

            <h1 className="mt-5 text-xl font-semibold text-white">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-light">{error}</p>

            <button
              type="button"
              onClick={() => fetchDashboard()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110"
            >
              <FiRefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const stats = [
    {
      title: "Total Students",
      value: dashboard?.totalStudents ?? 0,
      description: "Registered students",
      icon: FiUsers,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      title: "Total Subjects",
      value: dashboard?.totalSubjects ?? 0,
      description: "Available subjects",
      icon: FiBook,
      iconClass: "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Total Exams",
      value: dashboard?.totalExams ?? 0,
      description: "Created examinations",
      icon: FiClipboard,
      iconClass: "bg-purple-500/10 text-purple-400",
    },
    {
      title: "Exam History Records",
      value: dashboard?.examHistoryCount ?? 0,
      description: "Stored examination records",
      icon: FiDatabase,
      iconClass: "bg-amber-500/10 text-amber-400",
    },
  ];

  const quickActions = [
    {
      title: "Manage Students",
      description: "Register, edit and manage students",
      icon: FiUsers,
      path: "/studentlist",
    },
    {
      title: "Register Student",
      description: "Add a new student to the school",
      icon: FiUserPlus,
      path: "/register",
    },
    {
      title: "Create Examination",
      description: "Create a new examination",
      icon: FiPlus,
      path: "/setexam",
    },
    {
      title: "Manage Examinations",
      description: "View and manage existing examinations",
      icon: FiClipboard,
      path: "/exam-management",
    },
    {
      title: "Manage Users",
      description: "Manage teacher and system accounts",
      icon: FiUsers,
      path: "/users",
    },
    {
      title: "Assign Examination",
      description: "Assign examinations to students",
      icon: FiClipboard,
      path: "/assign-exam",
    },
  ];

  return (
    <>
      {openDeleteDialog && (
        <Dialog
          message="Are you sure you want to delete all examination history? This action cannot be undone."
          action={deleteAllExamHistory}
          setOpenDialog={setOpenDeleteDialog}
        />
      )}

      <section className="min-h-screen bg-bg px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1800px]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-primary">
                  <FiActivity size={16} />
                  <span>Administration</span>
                </div>

                <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
                  Admin Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-light sm:text-base">
                  Manage students, subjects, examinations and examination
                  records from one central dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-bg-deep/70 px-4 py-3 text-sm font-medium text-light transition hover:border-primary/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-lg transition hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-light">{stat.title}</p>

                      <p className="mt-2 text-3xl font-semibold text-white">
                        {stat.value.toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-light">
                        {stat.description}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Quick Management */}
            <div className="xl:col-span-2">
              <div className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-white">
                    Quick Management
                  </h2>

                  <p className="mt-1 text-sm text-light">
                    Quickly access the administration features you use most.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.title}
                        type="button"
                        onClick={() => navigate(action.path)}
                        className="group rounded-xl border border-border bg-bg p-4 text-left transition hover:border-primary/40 hover:bg-white/[0.025]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon size={19} />
                          </div>

                          <FiArrowRight
                            size={18}
                            className="text-light transition group-hover:translate-x-1 group-hover:text-primary"
                          />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-white">
                          {action.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-light">
                          {action.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
                  <FiShield size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    System Status
                  </h2>

                  <p className="text-sm text-light">Administration portal</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-bg p-4">
                  <span className="text-sm text-light">Administration</span>

                  <span className="flex items-center gap-2 text-sm font-medium text-success">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-bg p-4">
                  <span className="text-sm text-light">Student History</span>

                  <span
                    className={`flex items-center gap-2 text-sm font-medium ${
                      dashboard.viewExamHistory ? "text-success" : "text-light"
                    }`}
                  >
                    {dashboard.viewExamHistory ? (
                      <>
                        <FiEye size={15} />
                        Allowed
                      </>
                    ) : (
                      <>
                        <FiEyeOff size={15} />
                        Restricted
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Administration Controls */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Student History Access */}
            <div className="rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {dashboard.viewExamHistory ? (
                    <FiEye size={21} />
                  ) : (
                    <FiEyeOff size={21} />
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-white">
                    Student Exam History
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-light">
                    Control whether students can access their previous
                    examination history.
                  </p>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-bg p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          dashboard.viewExamHistory ? "bg-success" : "bg-danger"
                        }`}
                      />

                      <span className="text-sm text-white">Current status</span>
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        dashboard.viewExamHistory
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {dashboard.viewExamHistory ? "Allowed" : "Restricted"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAllowStudentToggle}
                    disabled={updatingHistoryAccess}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingHistoryAccess ? (
                      <>
                        <Spinner size="1rem" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSettings size={17} />
                        {dashboard.viewExamHistory
                          ? "Restrict Student Access"
                          : "Allow Student Access"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Exam History Cleanup */}
            <div className="rounded-2xl border border-danger/20 bg-danger/5 p-5 shadow-xl sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                  <FiDatabase size={21} />
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-white">
                    Examination History Cleanup
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-light">
                    Remove stored examination history after students have
                    reviewed their results.
                  </p>

                  <div className="mt-4 rounded-xl border border-danger/10 bg-bg/50 p-4">
                    <p className="text-xs text-light">
                      Stored examination records
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-white">
                      {dashboard.examHistoryCount.toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenDeleteDialog(true)}
                    disabled={
                      deletingHistory || dashboard.examHistoryCount === 0
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingHistory ? (
                      <>
                        <Spinner size="1rem" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiDatabase size={17} />
                        Delete All History
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="mt-6 rounded-2xl border border-border bg-bg-deep/60 p-5 shadow-xl sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Examination System Overview
              </h2>

              <p className="mt-1 text-sm text-light">
                Current records available in your school examination system.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-bg p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FiUsers size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-light">Students</p>
                    <p className="text-xl font-semibold text-white">
                      {dashboard.totalStudents.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-bg p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <FiBook size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-light">Subjects</p>
                    <p className="text-xl font-semibold text-white">
                      {dashboard.totalSubjects.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-bg p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <FiClipboard size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-light">Examinations</p>
                    <p className="text-xl font-semibold text-white">
                      {dashboard.totalExams.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
