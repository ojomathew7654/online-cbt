import { Outlet } from "react-router-dom";
import AdminSidebar from "../navigation/admin/AdminSidebar";
import UserSidebar from "../navigation/user/UserSidebar";

const RoleLayout = () => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInStudent"));

  const role = loggedInUser?.role;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-white">
      <aside className="shrink-0">
        {role === "ADMIN" ? <AdminSidebar /> : <UserSidebar />}
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default RoleLayout;
