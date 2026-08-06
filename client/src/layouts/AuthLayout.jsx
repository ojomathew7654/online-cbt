import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="min-h-screen bg-bg text-white">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
