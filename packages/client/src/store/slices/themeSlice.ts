import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
}

// 获取系统主题偏好
const getSystemTheme = (): ThemeMode => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

// 获取初始主题
const getInitialTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme as ThemeMode;
  }
  return getSystemTheme();
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

// 监听系统主题变化
if (typeof window !== "undefined" && window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const savedTheme = localStorage.getItem("theme");
      // 只有当用户没有手动设置主题时，才跟随系统主题
      if (!savedTheme) {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    });
  // 首次设置
  if (initialState.mode === "dark") {
    document.documentElement.classList.add("dark");
  }
}

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
      if (state.mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
