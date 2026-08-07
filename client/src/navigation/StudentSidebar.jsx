import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaChartPie,
  FaClipboardCheck,
  FaPowerOff,
  FaUserGraduate,
} from "react-icons/fa";
import Dialog from "../components/ui/Dialog";

const StudentSidebar = () => {
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = () => {
    setOpenDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("loggedInStudent");
    localStorage.removeItem("isAdmin");

    setOpenDialog(false);

    navigate("/login", { replace: true });
  };

  const links = [
    {
      label: "Dashboard",
      path: "/student",
      icon: FaChartPie,
    },

    {
      label: "Exam History",
      path: "/exam-history",
      icon: FaBookOpen,
    },
  ];

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-bg-deep lg:flex">
        {/* Header */}
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-bg">
            <FaUserGraduate size={22} />
          </div>

          <div>
            <h1 className="font-display text-lg font-bold text-white">
              Exam System
            </h1>

            <p className="text-xs text-light">Student Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-light">
            Student Menu
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
                      "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
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

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-light transition hover:bg-danger-variant hover:text-danger"
          >
            <FaPowerOff size={17} />

            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      {openDialog && (
        <Dialog
          setOpenDialog={setOpenDialog}
          message="Are you sure you want to log out of your student account?"
          action={confirmLogout}
          title="Logout Confirmation"
        />
      )}
    </>
  );
};

export default StudentSidebar;
