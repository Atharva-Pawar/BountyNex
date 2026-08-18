import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bug, LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { cn } from "../../lib/utils";
import { lockScroll, unlockScroll } from "../../lib/scroll-lock";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ThemeToggle } from "../ui/ThemeToggle";

const navLinkClass =
  "relative after:absolute after:-bottom-[3px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-acid-lime after:transition-transform after:duration-200 after:ease-out hover:after:scale-x-100";

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-graphite bg-surface transition-colors duration-150 group-hover:border-smoke">
        <Bug className="h-3.5 w-3.5 text-acid-lime" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="text-[15px] font-medium tracking-tight text-paper transition-colors duration-150">
          BountyNex
        </span>
      )}
    </Link>
  );
}

const NAV_LINKS = [
  { to: "/bounties", label: "Browse Bounties" },
  { to: "/#how-it-works", label: "How It Works" },
  { to: "/#security", label: "Security" },
];

export function PublicNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const profilePath = user && user.role !== "GUEST" ? `/${user.role.toLowerCase()}/profile` : "/profile";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setSigningOut(false);
      setSignOutOpen(false);
    }
  }

  useEffect(() => {
    if (mobileOpen) lockScroll();
    return () => unlockScroll();
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-graphite bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-[13px] md:flex">
            {NAV_LINKS.map((link) =>
              link.to.startsWith("/#") ? (
                <a
                  key={link.to}
                  href={link.to}
                  className={cn(navLinkClass, "text-fog transition-colors duration-150 hover:text-paper")}
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      navLinkClass,
                      "transition-colors duration-150 hover:text-paper",
                      isActive ? "text-paper font-medium after:scale-x-100" : "text-fog",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              {user?.role !== "GUEST" && user?.researcherProfile?.handle ? (
                <span className="hidden max-w-[140px] truncate font-mono text-[12px] text-fog xl:block">
                  @{user.researcherProfile.handle}
                </span>
              ) : null}
              <Link to={profilePath} className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  <User className="h-3.5 w-3.5" /> Profile
                </Button>
              </Link>
              <Link to={dashboardPath(user!.role)} className="hidden sm:block">
                <Button variant="secondary" size="sm">
                  <ShieldCheck className="h-3.5 w-3.5" /> Dashboard
                </Button>
              </Link>
              <button
                onClick={() => setSignOutOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-sm text-fog transition-colors duration-150 hover:bg-obsidian hover:text-paper"
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
              <Link to="/register" className="hidden sm:block">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-fog transition-colors duration-150 hover:bg-obsidian hover:text-paper md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-12 z-40 border-b border-graphite bg-surface/95 backdrop-blur-md animate-fade-in md:hidden">
          <nav className="flex flex-col gap-1 p-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm transition-colors duration-150 hover:bg-obsidian",
                  "text-mist",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-graphite pt-3">
              {isAuthenticated ? (
                <>
                  <Link to={profilePath} className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      <User className="h-3.5 w-3.5" /> Profile
                    </Button>
                  </Link>
                  <Link to={dashboardPath(user!.role)} className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">
                      <ShieldCheck className="h-3.5 w-3.5" /> Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      setSignOutOpen(true);
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </Button>
                </>
              ) : (
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">
                    Get started
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      <ConfirmDialog
        open={signOutOpen}
        onCancel={() => setSignOutOpen(false)}
        onConfirm={() => void handleSignOut()}
        title="Sign out?"
        description="Are you sure you want to sign out of your BountyNex account?"
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        variant="danger"
        loading={signingOut}
      />
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
    <footer className="border-t border-graphite">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Logo />
            <p className="text-xs text-ash">Crowdsourced security, built for the open web.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px]">
            <Link to="/bounties" className="text-fog transition-colors duration-150 hover:text-paper">
              Browse Bounties
            </Link>
            <Link to="/register" className="text-fog transition-colors duration-150 hover:text-paper">
              Join as researcher
            </Link>
            <Link to="/register" className="text-fog transition-colors duration-150 hover:text-paper">
              Launch a program
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-sm border border-graphite px-2 py-1 font-mono text-[10px] text-ash">
              ETH · SEPOLIA
            </span>
            <span className="rounded-sm border border-graphite px-2 py-1 font-mono text-[10px] text-ash">
              TESTNET
            </span>
          </div>
        </div>
        <p className="mt-8 border-t border-graphite pt-6 text-center text-xs text-ash md:text-left">
          BountyNex runs on the Ethereum Sepolia testnet. Never use real funds. &copy; {new Date().getFullYear()} BountyNex
        </p>
      </div>
    </footer>
  );
}