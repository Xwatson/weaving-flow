import React, { useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  theme,
  Breadcrumb,
  BreadcrumbProps,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  BookOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCollapsed } from "@/store/slices/themeSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import styles from "./index.module.less";
import { trpc } from "@/utils/trpc";

const { Header, Sider, Content } = Layout;

const MenuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "仪表盘",
    path: "/admin/dashboard",
  },
  {
    key: "workflow",
    icon: <BookOutlined />,
    label: "工作流",
    path: "/admin/workflow",
  },
  {
    key: "docs",
    icon: <AppstoreOutlined />,
    label: "文档",
    path: "/admin/docs",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "设置",
    path: "/admin/settings",
  },
];

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

  // 生成面包屑项
  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const items: BreadcrumbProps["items"] = [];
    let url = "";

    // 过滤掉 ID 路径
    const filteredSnippets = pathSnippets.filter((snippet) => {
      // 简单的 UUID 格式检查
      return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        snippet
      );
    });

    filteredSnippets.forEach((snippet, index) => {
      url += `/${snippet}`;
      const isLast = index === filteredSnippets.length - 1;
      const otherSnippets: Record<string, string> = {
        admin: "首页",
        edit: "编辑",
      };

      const title =
        MenuItems.find((item) => item.key === snippet)?.label ||
        otherSnippets[snippet];

      items.push({
        title: isLast ? title : <Link to={url}>{title}</Link>,
      });
    });

    return items;
  };

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
          items={MenuItems.map((item) => ({
            ...item,
            key: item.path,
            label: <Link to={item.path}>{item.label}</Link>,
          }))}
        />
      </Sider>
      <Layout>
        <Header
          className={styles.header}
          style={{ background: colorBgContainer }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => dispatch(setCollapsed(!collapsed))}
              style={{ marginRight: 16 }}
            />
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
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
