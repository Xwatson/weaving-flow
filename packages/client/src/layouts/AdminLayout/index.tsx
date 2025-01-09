import { useState } from "react";
import { Layout, Menu, Button, theme, Dropdown } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ApiOutlined,
  BookOutlined,
  KeyOutlined,
  LogoutOutlined,
  UserOutlined,
  ScheduleOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { RootState } from "@/store";
import { toggleTheme } from "@/store/slices/themeSlice";
import styles from "./index.module.less";

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: "/admin/dashboard",
    icon: <DashboardOutlined />,
    label: "仪表盘",
  },
  {
    key: "/admin/workflow",
    icon: <ScheduleOutlined />,
    label: "工作流",
  },
  {
    key: "/admin/crawler",
    icon: <ApiOutlined />,
    label: "爬虫",
  },
  {
    key: "/admin/bookmarks",
    icon: <BookOutlined />,
    label: "书签",
  },
  {
    key: "/admin/credentials",
    icon: <KeyOutlined />,
    label: "凭证",
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, colorBgElevated },
  } = theme.useToken();
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout
      style={{ minHeight: "100vh" }}
      className={themeMode === "dark" ? styles.dark : ""}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={themeMode === "dark" ? "dark" : "light"}
        className={styles.sider}
      >
        <div className={styles.logo}>
          {!collapsed && <span>Weaving Flow</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          theme={themeMode === "dark" ? "dark" : "light"}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgElevated,
          }}
          className="flex items-center justify-between shadow-md"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <div className={styles.headerRight}>
            <Button
              type="text"
              icon={themeMode === "dark" ? <BulbFilled /> : <BulbOutlined />}
              onClick={() => dispatch(toggleTheme())}
              className="mr-4"
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: 8,
            minHeight: 280,
          }}
          className="shadow-sm"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
