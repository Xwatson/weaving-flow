import React, { useEffect } from "react";
import { Layout, Menu, Button, Dropdown, theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  BookOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCollapsed } from "@/store/slices/themeSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import styles from "./index.module.less";
import { trpc } from "@/utils/trpc";

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const collapsed = useSelector((state: RootState) => state.theme.collapsed);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

  const items = [
    {
      key: "1",
      label: <span onClick={handleLogout}>退出登录</span>,
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <Layout
      className={themeMode === "dark" ? styles.dark : ""}
      style={{ minHeight: "100vh" }}
    >
      <Sider
        className={styles.sider}
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: colorBgContainer }}
      >
        <div className={styles.logo}>
          <Link to="/">{collapsed ? "WF" : "Weaving Flow"}</Link>
        </div>
        <Menu
          theme={themeMode === "dark" ? "dark" : "light"}
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ background: colorBgContainer }}
          items={[
            {
              key: "/admin/dashboard",
              icon: <DashboardOutlined />,
              label: <Link to="/admin/dashboard">仪表盘</Link>,
            },
            {
              key: "/admin/workflow",
              icon: <AppstoreOutlined />,
              label: <Link to="/admin/workflow">工作流</Link>,
            },
            {
              key: "/admin/docs",
              icon: <BookOutlined />,
              label: <Link to="/admin/docs">文档</Link>,
            },
            {
              key: "/admin/settings",
              icon: <SettingOutlined />,
              label: <Link to="/admin/settings">设置</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          className={styles.header}
          style={{ background: colorBgContainer }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => dispatch(setCollapsed(!collapsed))}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <div className={styles.userInfo}>
            <Dropdown menu={{ items }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {user?.name}
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
