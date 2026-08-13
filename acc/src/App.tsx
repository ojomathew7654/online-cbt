import { Routes, Route } from "react-router-dom";
// Import REAL pages
import SessionsPage from "./pages/admin/SessionsPage";
import AccountsPage from "./pages/admin/AccountsPage";
import JournalPage from "./pages/admin/JournalPage";
import FeesPage from "./pages/admin/FeesPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import ExpensesPage from "./pages/admin/ExpensesPage";
import LoansPage from "./pages/admin/LoansPage";
import DonationsPage from "./pages/admin/DonationsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import AuditPage from "./pages/admin/AuditPage";

// Optional (if you're using context)
import { AppProvider } from "./context/AppContext";

import LoginPage from "./pages/auth/LoginPage";
import { ToastProvider } from "./context/ToastContext";
import StudentsPage from "./pages/admin/StudentsPage";
import Layout from "./components/layouts/Layout";
import DashboardPage from "./pages/admin/DashboardPage";
import SuperAdminPage from "./pages/superadmin/SuperAdminPage";
import OtherTransactionsPage from "./pages/admin/OtherTransactionsPage";
import SuperAdminUsersPage from "./pages/superadmin/SuperAdminUsersPage";

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — all wrapped by Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route
              path="/other-transactions"
              element={<OtherTransactionsPage />}
            />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/super-admin" element={<SuperAdminPage />} />
            <Route
              path="/super-admin/users"
              element={<SuperAdminUsersPage />}
            />
          </Route>
        </Routes>
      </ToastProvider>
    </AppProvider>
  );
}
