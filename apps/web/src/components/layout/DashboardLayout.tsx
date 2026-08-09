import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Award,
  BadgeDollarSign,
  BarChart3,
  Bug,
  Building2,
  Crosshair,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "../../providers/AuthProvider";
import { cn } from "../../lib/utils";
import { useWalletBinding } from "../../hooks/useWallet";
import { Logo } from "./PublicLayout";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const NAV: Record<string, NavItem[]> = {
  RESEARCHER: [
    { to: "/researcher", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: "/researcher/browse", label: "Browse Bounties", icon: <Crosshair className="h-4 w-4" /> },
    { to: "/researcher/reports", label: "My Reports", icon: <FileText className="h-4 w-4" /> },
    { to: "/researcher/rewards", label: "Rewards", icon: <Award className="h-4 w-4" /> },
    { to: "/researcher/wallet", label: "Wallet", icon: <Wallet className="h-4 w-4" /> },
    { to: "/researcher/transactions", label: "Transactions", icon: <BadgeDollarSign className="h-4 w-4" /> },
    { to: "/researcher/profile", label: "Profile", icon: <ShieldCheck className="h-4 w-4" /> },
  ],
  ORGANIZATION: [
    { to: "/organization", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: "/organization/create", label: "Create Bounty", icon: <Crosshair className="h-4 w-4" /> },
    { to: "/organization/bounties", label: "My Bounties", icon: <Bug className="h-4 w-4" /> },
    { to: "/organization/submissions", label: "Submissions", icon: <FileText className="h-4 w-4" /> },
    { to: "/organization/rewards", label: "Rewards", icon: <Award className="h-4 w-4" /> },
    { to: "/organization/wallet", label: "Wallet", icon: <Wallet className="h-4 w-4" /> },
    { to: "/organization/transactions", label: "Transactions", icon: <BadgeDollarSign className="h-4 w-4" /> },
    { to: "/organization/profile", label: "Profile", icon: <Building2 className="h-4 w-4" /> },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { to: "/admin/organizations", label: "Organizations", icon: <Building2 className="h-4 w-4" /> },
    { to: "/admin/bounties", label: "Bounties", icon: <Bug className="h-4 w-4" /> },
    { to: "/admin/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
    { to: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { to: "/admin/transactions", label: "Transactions", icon: <BadgeDollarSign className="h-4 w-4" /> },
  ],
};

function WalletStatus() {
  const { address } = useWalletBinding();
  return (
    <div className="flex items-center gap-3">
      <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
      {address && (
        <span className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent lg:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Bound to profile
        </span>
      )}
    </div>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = user ? NAV[user.role] ?? [] : [];

  useEffect(() => {
    if (!user || user.role === "GUEST") navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user || user.role === "GUEST") return null;

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface/80 backdrop-blur-md transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Logo />
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5 text-ink-dim" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-ink-dim hover:bg-surface-2 hover:text-ink",
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-border p-3">
          <button
            onClick={() => void logout().then(() => navigate("/"))}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-dim hover:bg-surface-2 hover:text-danger"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5 text-ink-dim" />
            </button>
            <div>
              <p className="text-xs text-ink-faint uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-medium text-ink">
                {user.name} <span className="text-ink-faint">· {user.role}</span>
              </p>
            </div>
          </div>
          <WalletStatus />
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminRouteRedirect() {
  return <Link to="/admin">Go to admin dashboard</Link>;
}
