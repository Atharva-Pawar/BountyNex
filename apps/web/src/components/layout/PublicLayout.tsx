import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bug, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Bug className="h-4 w-4" />
      </span>
      {!compact && (
        <span className="text-base font-semibold tracking-tight text-ink">
          Bounty<span className="text-accent">Nex</span>
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
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-ink-dim md:flex">
          <NavLink
            to="/bounties"
            className={({ isActive }) => cn("transition-colors hover:text-ink", isActive && "text-accent font-medium")}
          >
            Browse Bounties
          </NavLink>
          <Link to="/#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </Link>
          <Link to="/#security" className="transition-colors hover:text-ink">
            Security
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath(user!.role)}>
                <Button variant="secondary" size="sm">
                  <ShieldCheck className="h-3.5 w-3.5" /> Dashboard
                </Button>
              </Link>
              <button
                onClick={() => void logout().then(() => navigate("/"))}
                className="rounded-md p-1.5 text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                title="Logout"
                aria-label="Logout"
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
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-ink-dim">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/bounties" className="transition-colors hover:text-ink">Browse Bounties</Link>
            <Link to="/register" className="transition-colors hover:text-ink">Join as researcher</Link>
            <Link to="/register" className="transition-colors hover:text-ink">Launch a program</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-faint">
          BountyNex runs on the Ethereum Sepolia testnet. Never use real funds. © {new Date().getFullYear()} BountyNex
        </p>
      </div>
    </footer>
  );
}
