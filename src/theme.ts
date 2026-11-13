import { createContext, useContext } from "react";
import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const colors = {
  bgTop: "#0B1220",
  bgDeep: "#05080F",
  navy: "#162C6D",
  card: "#0A101D",
  text: "#F4F6FA",
  muted: "rgba(214, 224, 245, 0.62)",
  accent: "#3B82F6",
  forestry: "#2E9E5B",
  agriculture: "#E6B428",
  recreation: "#8B5CF6",
  industrial: "#E04848",
  road: "#E2483D",
  river: "#3B9BF2",
  power: "#F5C542",
};

// Recordings are 1920x1246 full-screen captures; the top 42px is the
// (black) macOS menu bar, which we crop away.
export const REC = {
  width: 1920,
  height: 1246,
  menuBar: 42,
};

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/* ---------------- Theme variants (dark = original, light = Mac-style) ---------------- */
export type Theme = {
  mode: "dark" | "light";
  text: string;
  muted: string;
  eyebrow: string;
  headline: string; // CSS background for gradient headline text
  headlineShadow: string;
  glassBg: string;
  glassShadow: string;
  plane: string;
  planeBase: string;
  gridLine: string;
};

export const darkTheme: Theme = {
  mode: "dark",
  text: "#F4F6FA",
  muted: "rgba(214, 224, 245, 0.62)",
  eyebrow: "#93B4FF",
  headline: "linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%)",
  headlineShadow:
    "drop-shadow(0px 12px 24px rgba(0,0,0,0.65)) drop-shadow(0px 4px 8px rgba(0,0,0,0.5))",
  glassBg: "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 100%)",
  glassShadow:
    "0 0 0 1px rgba(255,255,255,0.12), 0 25px 50px -12px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -1px 1px rgba(0,0,0,0.5)",
  plane: "rgba(10,16,29,0.18)",
  planeBase: "rgba(10,16,29,0.9)",
  gridLine: "rgba(255,255,255,0.7)",
};

export const lightTheme: Theme = {
  mode: "light",
  text: "#1D1D1F",
  muted: "#6E6E73",
  eyebrow: "#6E6E73",
  headline: "linear-gradient(180deg, #1D1D1F 0%, #4A4A50 100%)",
  headlineShadow: "drop-shadow(0px 10px 18px rgba(0,0,0,0.10))",
  glassBg: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(250,250,250,0.82) 100%)",
  glassShadow:
    "0 0 0 1px rgba(0,0,0,0.06), 0 24px 48px -16px rgba(0,0,0,0.22), 0 6px 12px -6px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,1)",
  plane: "rgba(255,255,255,0.35)",
  planeBase: "rgba(255,255,255,0.95)",
  gridLine: "rgba(29,29,31,0.55)",
};

export const ThemeContext = createContext<Theme>(darkTheme);
export const useTheme = () => useContext(ThemeContext);
