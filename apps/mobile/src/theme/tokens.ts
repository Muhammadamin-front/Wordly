import { processColor, StyleSheet } from "react-native";

export type AppTheme = "light" | "dark";

export const colors = {
  paper: "#F3E6CB",
  raised: "#FFF8EA",
  // Foreground for rust/teal/espresso controls. Keep it separate from
  // `raised`: raised becomes a dark surface in dark mode, onAccent must not.
  onAccent: "#FFF8EB",
  // A deliberately separate dark surface token. `brand950` shares its value
  // with the light-theme ink foreground and is therefore swapped in dark mode.
  inkSurface: "#24130D",
  cream: "#FAF1DD",
  ink: "#24130C",
  brown: "#54250F",
  rust: "#B94E28",
  rustDark: "#7E2D1C",
  teal: "#467878",
  sage: "#6C9390",
  muted: "#6C4935",
  line: "rgba(84, 37, 15, 0.38)",
  danger: "#DC2626",
  brand50: "#FFF8EA",
  brand100: "#F7E8CC",
  brand200: "#E8C99A",
  brand300: "#D69C63",
  brand400: "#C86A3B",
  brand500: "#B94E28",
  brand600: "#A83A25",
  brand700: "#7E2D1C",
  brand800: "#54250F",
  brand900: "#382015",
  brand950: "#24130C",
  gold300: "#A1C2BD",
  gold400: "#6C9390",
  gold500: "#467878",
};

export const fonts = { display: "BebasNeue", ui: "Manrope", uiMedium: "ManropeMedium", uiBold: "ManropeBold" };

let activeTheme: AppTheme = "light";

const darkColorMap: Record<string, string> = {
  "#F3E6CB": "#24130C",
  "#FFF8EA": "#43261A",
  "#FAF1DD": "#321B12",
  "#24130C": "#FFF8EA",
  "#54250F": "#160B07",
  "#B94E28": "#D6744D",
  "#7E2D1C": "#E7A184",
  "#467878": "#82B8B4",
  "#6C9390": "#9AC6C2",
  "#6C4935": "#D1B49D",
  "rgba(84, 37, 15, 0.38)": "rgba(232, 201, 154, 0.30)",
  "#DC2626": "#F87171",
  "#F7E8CC": "#4A2A1C",
  "#E8C99A": "#6F4532",
  "#D69C63": "#C98E6F",
  "#C86A3B": "#DB865F",
  "#A83A25": "#D6744D",
  "#382015": "#F4D7C1",
  "#A1C2BD": "#B7D6D2",
};

const colorProperties = [
  "backgroundColor", "borderColor", "borderBottomColor", "borderEndColor", "borderLeftColor",
  "borderRightColor", "borderStartColor", "borderTopColor", "color", "outlineColor", "overlayColor",
  "shadowColor", "textDecorationColor", "textShadowColor", "tintColor",
];

function processThemedColor(value: unknown) {
  const resolved = activeTheme === "dark" && typeof value === "string" ? (darkColorMap[value] ?? value) : value;
  return processColor(resolved as string);
}

if (typeof StyleSheet.setStyleAttributePreprocessor === "function") {
  for (const property of colorProperties) {
    StyleSheet.setStyleAttributePreprocessor(property, processThemedColor);
  }
}

export function setActiveTheme(theme: AppTheme) {
  activeTheme = theme;
}
