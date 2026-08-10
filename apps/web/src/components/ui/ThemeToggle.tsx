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
      className="relative flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink-dim transition-all duration-200 hover:border-border-strong hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <Sun
        className="h-[16px] w-[16px] transition-all duration-300"
        style={
          isDark
            ? { opacity: 1, transform: "scale(1) rotate(0deg)" }
            : { opacity: 0, transform: "scale(0.5) rotate(-90deg)" }
        }
      />
      <Moon
        className="h-[16px] w-[16px] absolute transition-all duration-300"
        style={
          isDark
            ? { opacity: 0, transform: "scale(0.5) rotate(90deg)" }
            : { opacity: 1, transform: "scale(1) rotate(0deg)" }
        }
      />
    </button>
  );
}
