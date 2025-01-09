import React from "react";
import { Outlet } from "react-router-dom";
import { Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { toggleTheme } from "@/store/slices/themeSlice";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import styles from "./index.module.less";
import { Browser } from "@/components/Browser";

const MainLayout: React.FC = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  return (
    <div className={styles.container}>
      <Browser />
      <Button
        className={styles.themeButton}
        icon={themeMode === "dark" ? <BulbFilled /> : <BulbOutlined />}
        onClick={() => dispatch(toggleTheme())}
      />
      <Outlet />
    </div>
  );
};

export default MainLayout;
