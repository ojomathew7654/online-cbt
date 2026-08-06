import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartPie,
  FaClipboardCheck,
  FaFileImport,
  FaGraduationCap,
  FaPowerOff,
  FaUsers,
  FaUserPlus,
} from "react-icons/fa";
import { FiSettings, FiUserCheck } from "react-icons/fi";
import Dialog from "../../components/ui/Dialog";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("loggedInStudent");
    localStorage.removeItem("isAdmin");

    navigate("/login", { replace: true });
  };

  const links = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: FaChartPie,
    },
    {
      label: "Register Student",
      path: "/register",
      icon: FaUserPlus,
    },
    {
      label: "Students",
      path: "/studentlist",
      icon: FaUsers,
    },
    {
      label: "User Management",
      path: "/users",
      icon: FaUsers,
    },
    {
      label: "Exam Management",
      path: "/exam-management",
      icon: FiSettings,
    },
    {
      label: "Import Exam",
      path: "/setexam",
      icon: FaFileImport,
    },
    {
      label: "All Exams",
      path: "/allExam",
      icon: FaClipboardCheck,
    },
    {
      label: "Assign Exams",
      path: "/assign-exam",
      icon: FiUserCheck,
    },
    {
      label: "Scores",
      path: "/score",
      icon: FaGraduationCap,
    },
  ];

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-bg-deep lg:flex">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-primary text-bg">
            <img
              src="/logo.png"
              alt="Exam System logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <h1 className="font-display text-lg font-bold text-white">
              Exam System
            </h1>

            <p className="text-xs text-light">Administration</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-light">
            Management
          </p>

          <div className="space-y-1.5">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-1 rounded-xl px-4 py-3 transition-all",
                      isActive
                        ? "bg-primary text-bg shadow-lg shadow-primary/10"
                        : "text-light hover:bg-bg hover:text-white",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />

                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={() => setOpenDialog(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-light transition hover:bg-danger-variant hover:text-danger"
          >
            <FaPowerOff size={17} />

            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation */}
      {openDialog && (
        <Dialog
          setOpenDialog={setOpenDialog}
          message="Are you sure you want to log out of the administration portal?"
          action={handleLogout}
          title="Logout Confirmation"
        />
      )}
    </>
  );
};

export default AdminSidebar;
