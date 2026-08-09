import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bug, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent glow-border">
        <Bug className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-ink">
          Bounty<span className="text-accent glow-text">Nex</span>
        </span>
      )}
    </Link>
  );
}

export function PublicNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ink-dim md:flex">
          <NavLink
            to="/bounties"
            className={({ isActive }) => cn("hover:text-accent", isActive && "text-accent")}
          >
            Browse Bounties
          </NavLink>
          <NavLink to="/#how-it-works" className="hover:text-accent">
            How it works
          </NavLink>
          <NavLink to="/#security" className="hover:text-accent">
            Security
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath(user!.role)}>
                <Button variant="secondary" size="sm">
                  <ShieldCheck className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <button
                onClick={() => void logout().then(() => navigate("/"))}
                className="rounded-lg p-2 text-ink-dim hover:bg-surface-2 hover:text-ink"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function dashboardPath(role: string): string {
  switch (role) {
    case "RESEARCHER":
      return "/researcher";
    case "ORGANIZATION":
      return "/organization";
    case "ADMIN":
      return "/admin";
    default:
      return "/login";
  }
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-ink-dim">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/bounties" className="hover:text-accent">Browse Bounties</Link>
            <Link to="/register" className="hover:text-accent">Join as researcher</Link>
            <Link to="/register" className="hover:text-accent">Launch a program</Link>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-ink-faint">
          BountyNex runs on the Ethereum Sepolia testnet. Never use real funds. © {new Date().getFullYear()} BountyNex
        </p>
      </div>
    </footer>
  );
}
