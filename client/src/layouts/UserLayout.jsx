// import { Outlet } from "react-router-dom";
import UserSidebar from "../navigation/UserSidebar";

// const UserLayout = () => {
//   return (
//     <div className="flex h-screen w-full overflow-hidden bg-bg text-white">
//       <UserSidebar />

//       <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default UserLayout;

import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-white">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main application area */}
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
