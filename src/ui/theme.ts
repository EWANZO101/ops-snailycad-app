import { useColorScheme } from "react-native";

/** colours close to the SnailyCAD website, in light and dark */
const light = {
  background: "#f5f5f5",
  card: "#ffffff",
  border: "#e5e5e5",
  text: "#171717",
  muted: "#525252",
  primary: "#2563eb",
  primaryText: "#ffffff",
  danger: "#dc2626",
  dangerBackground: "#fef2f2",
  success: "#16a34a",
  input: "#ffffff",
};

const dark: typeof light = {
  background: "#171717",
  card: "#262626",
  border: "#3f3f46",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  primary: "#3b82f6",
  primaryText: "#ffffff",
  danger: "#f87171",
  dangerBackground: "#450a0a",
  success: "#4ade80",
  input: "#1f1f1f",
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === "dark" ? dark : light;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16 };
