import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { trpc } from "@/utils/trpc";
import styles from "./index.module.less";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      message.success("登录成功");
      navigate("/admin/dashboard");
    },
    onError: () => {
      message.error("登录失败，请检查邮箱和密码");
    },
  });

  const onFinish = async (values: LoginForm) => {
    loginMutation.mutate(values);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} title="登录">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.button}
              loading={loginMutation.isLoading}
              block
            >
              登录
            </Button>
            <div className={styles.links}>
              <Link to="/register">注册账号</Link>
              <Link to="/forgot-password">忘记密码？</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
