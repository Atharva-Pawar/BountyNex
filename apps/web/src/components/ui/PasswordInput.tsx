import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "./Field";
import { cn } from "../../lib/utils";

export function PasswordInput({ className, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  const type = visible ? "text" : "password";
  const isHidden = type === "password";
  const toggleLabel = isHidden ? "Show password" : "Hide password";

  return (
    <div className="relative">
      <Input className={cn("pr-10", className)} {...props} type={type} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={toggleLabel}
        title={toggleLabel}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-ash transition-colors duration-150 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid-lime/30"
      >
        {isHidden ? (
          <EyeOff className="pointer-events-none h-4 w-4" aria-hidden />
        ) : (
          <Eye className="pointer-events-none h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
