import React from "react";
import { ConfigProvider, theme } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import zhCN from "antd/locale/zh_CN";

// 自定义主题色
const customToken = {
  colorPrimary: "#FFA726", // 主色调：温暖的橙色
  colorInfo: "#2196F3", // 信息色：流畅的蓝色
  colorWarning: "#FFE082", // 警告色：蜂巢色
  colorSuccess: "#90CAF9", // 成功色：流动感
  borderRadius: 6,
  // 自定义其他衍生色
  colorPrimaryBg: "#FFF3E0",
  colorPrimaryBgHover: "#FFE0B2",
  colorPrimaryBorder: "#FFB74D",
  colorPrimaryHover: "#FF9800",
  colorPrimaryActive: "#F57C00",
  colorPrimaryTextHover: "#FF9800",
  colorPrimaryText: "#F57C00",
  colorPrimaryTextActive: "#E65100",
};

// 暗色主题自定义
const darkToken = {
  ...customToken,
  colorBgContainer: "#1E1E1E",
  colorBgElevated: "#2D2D2D",
  colorBorder: "#434343",
  colorText: "rgba(255, 255, 255, 0.85)",
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  React.useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm:
          themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: themeMode === "dark" ? darkToken : customToken,
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
