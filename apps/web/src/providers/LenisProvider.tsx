import { createContext, useContext, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

let lenisInstance: any = null;

interface LenisContextType {
  scrollTo: (target: string | number, options?: any) => void;
}

const LenisContext = createContext<LenisContextType | null>(null);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let timeoutId: NodeJS.Timeout;

    import("lenis").then(({ default: Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.005 * (t -= 1) * t + 1),
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time: number) {
        if (lenisInstance) {
          lenisInstance.raf(time);
        }
        timeoutId = setTimeout(raf, 16) as any;
      }
      raf(0);
    });

    return () => {
      clearTimeout(timeoutId);
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
    };
  }, [theme]);

  const scrollTo = (target: string | number, options?: any) => {
    if (lenisInstance) {
      lenisInstance.scrollTo(target, options);
    } else {
      const element = typeof target === "string" ? document.querySelector(target) : target;
      if (element instanceof Element) {
        element.scrollIntoView({ behavior: "smooth", ...options });
      }
    }
  };

  return <LenisContext.Provider value={{ scrollTo }}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  const ctx = useContext(LenisContext);
  if (!ctx) throw new Error("useLenis must be used within LenisProvider");
  return ctx;
}
