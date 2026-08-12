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
import { ThemeToggle } from "../ui/ThemeToggle";

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
        <span className="hidden items-center gap-1.5 rounded-md border border-accent/20 bg-accent/5 px-2 py-1 font-mono text-[10px] text-accent lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Bound
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
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-56 border-r border-border bg-surface lg:translate-x-0 transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <Logo />
        </div>
        <nav className="space-y-0.5 p-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-150",
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-ink-dim hover:bg-surface-2 hover:text-ink",
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-border bg-surface p-2">
          <button
            onClick={() => void logout().then(() => navigate("/"))}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-surface-2 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-1.5 text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden sm:block">
              <p className="text-[11px] text-ink-faint uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-medium text-ink">
                {user.name} <span className="text-ink-faint font-normal">· {user.role}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <WalletStatus />
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Bug className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold tracking-tight text-ink">
        Bounty<span className="text-accent">Nex</span>
      </span>
    </Link>
  );
}

export function AdminRouteRedirect() {
  return <Link to="/admin">Go to admin dashboard</Link>;
}
