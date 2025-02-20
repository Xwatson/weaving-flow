import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { trpc } from "@/utils/trpc";
import styles from "./index.module.less";

interface RegisterForm {
  email: string;
  password: string;
  name?: string;
}

const Register = () => {
  const navigate = useNavigate();
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      message.success("注册成功");
      navigate("/");
    },
    onError: () => {
      message.error("注册失败，请检查输入");
    },
  });

  const onFinish = (values: RegisterForm) => {
    registerMutation.mutate(values);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} title="注册">
        <Form name="register" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6个字符" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item name="name" rules={[{ required: false }]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="姓名（选填）"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.button}
              loading={registerMutation.isLoading}
              block
            >
              注册
            </Button>
            <div className={styles.links}>
              <Link to="/login">已有账号？立即登录</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
