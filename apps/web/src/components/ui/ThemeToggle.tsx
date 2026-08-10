import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-ink-dim transition-all duration-200 hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <Sun
        className="h-[18px] w-[18px] transition-all duration-300"
        style={
          isDark
            ? { opacity: 1, transform: "scale(1) rotate(0deg)" }
            : { opacity: 0, transform: "scale(0.5) rotate(-90deg)" }
        }
      />
      <Moon
        className="h-[18px] w-[18px] absolute transition-all duration-300"
        style={
          isDark
            ? { opacity: 0, transform: "scale(0.5) rotate(90deg)" }
            : { opacity: 1, transform: "scale(1) rotate(0deg)" }
        }
      />
    </button>
  );
}
