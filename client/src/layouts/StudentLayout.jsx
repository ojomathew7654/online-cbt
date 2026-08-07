import { Outlet, useLocation } from "react-router-dom";
import StudentSidebar from "../navigation/StudentSidebar";

const StudentLayout = () => {
  const location = useLocation();

  const isExamPage = location.pathname.startsWith("/selected-exam/");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-white">
      {!isExamPage && <StudentSidebar />}

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
