import { Navigate, Route, Routes } from "react-router-dom";
import type { Role } from "./types";
import { useAuth } from "./providers/AuthProvider";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { PublicLayout } from "./components/layout/PublicPage";
import { Landing } from "./pages/public/Landing";
import { BrowseBounties } from "./pages/public/BrowseBounties";
import { BountyDetails } from "./pages/public/BountyDetails";
import { Login } from "./pages/public/Login";
import { Register } from "./pages/public/Register";

import { ResearcherDashboard } from "./pages/researcher/ResearcherDashboard";
import { MyReports } from "./pages/researcher/MyReports";
import { SubmitReport } from "./pages/researcher/SubmitReport";
import { RewardsPage } from "./pages/RewardsPage";
import { WalletPage } from "./pages/WalletPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { ResearcherProfile as ProfilePage } from "./pages/researcher/ResearcherProfile";

import { OrgDashboard } from "./pages/organization/OrgDashboard";
import { CreateBounty } from "./pages/organization/CreateBounty";
import { ManageBounties } from "./pages/organization/ManageBounties";
import { BountySubmissions } from "./pages/organization/BountySubmissions";
import { ReviewReport } from "./pages/organization/ReviewReport";
import { OrgProfile } from "./pages/organization/OrgProfile";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminOrganizations } from "./pages/admin/AdminOrganizations";
import { AdminBounties } from "./pages/admin/AdminBounties";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminTransactions } from "./pages/admin/AdminTransactions";

function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !roles.includes(user.role)) {
    return <Navigate to={user ? "/" : "/login"} replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/bounties" element={<BrowseBounties />} />
        <Route path="/bounties/:id" element={<BountyDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Researcher */}
      <Route
        element={
          <RequireRole roles={["RESEARCHER"]}>
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route path="/researcher" element={<ResearcherDashboard />} />
        <Route path="/researcher/browse" element={<BrowseBounties />} />
        <Route path="/researcher/reports" element={<MyReports />} />
        <Route path="/researcher/rewards" element={<RewardsPage scope="researcher" />} />
        <Route path="/researcher/wallet" element={<WalletPage scope="researcher" />} />
        <Route path="/researcher/transactions" element={<TransactionsPage scope="researcher" />} />
        <Route path="/researcher/profile" element={<ProfilePage />} />
      </Route>
      <Route
        path="/bounties/:id/submit"
        element={
          <RequireRole roles={["RESEARCHER"]}>
            <SubmitReport />
          </RequireRole>
        }
      />

      {/* Organization */}
      <Route
        element={
          <RequireRole roles={["ORGANIZATION"]}>
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route path="/organization" element={<OrgDashboard />} />
        <Route path="/organization/create" element={<CreateBounty />} />
        <Route path="/organization/bounties" element={<ManageBounties />} />
        <Route path="/organization/submissions" element={<BountySubmissions all />} />
        <Route path="/organization/bounties/:id/reports" element={<BountySubmissions />} />
        <Route path="/organization/reports/:id" element={<ReviewReport />} />
        <Route path="/organization/rewards" element={<RewardsPage scope="organization" />} />
        <Route path="/organization/wallet" element={<WalletPage scope="organization" />} />
        <Route path="/organization/transactions" element={<TransactionsPage scope="organization" />} />
        <Route path="/organization/profile" element={<OrgProfile />} />
      </Route>

      {/* Admin */}
      <Route
        element={
          <RequireRole roles={["ADMIN"]}>
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/organizations" element={<AdminOrganizations />} />
        <Route path="/admin/bounties" element={<AdminBounties />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
