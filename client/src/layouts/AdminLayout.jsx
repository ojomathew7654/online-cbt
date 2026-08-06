import { Outlet } from "react-router-dom";
import AdminSidebar from "../navigation/admin/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-white">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main application area */}
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
