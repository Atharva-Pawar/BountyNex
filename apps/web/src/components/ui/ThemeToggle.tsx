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
      className="relative flex h-8 w-8 items-center justify-center rounded-sm text-fog transition-colors duration-150 hover:bg-obsidian hover:text-paper"
    >
      <Sun
        className="h-4 w-4 transition-all duration-300"
        style={
          isDark
            ? { opacity: 1, transform: "scale(1) rotate(0deg)" }
            : { opacity: 0, transform: "scale(0.5) rotate(-90deg)" }
        }
      />
      <Moon
        className="absolute h-4 w-4 transition-all duration-300"
        style={
          isDark
            ? { opacity: 0, transform: "scale(0.5) rotate(90deg)" }
            : { opacity: 1, transform: "scale(1) rotate(0deg)" }
        }
      />
    </button>
  );
}