import React, { useEffect } from "react";
import { Form, Input, Button, Card, message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { trpc } from "@/utils/trpc";

const WorkflowEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: workflow, isLoading } = trpc.workflow.getById.useQuery(
    { id: id! },
    { 
      enabled: isEdit,
      retry: false
    }
  );
  
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const createMutation = trpc.workflow.create.useMutation({
    onSuccess: () => {
      message.success("工作流创建成功");
      navigate("/admin/workflow");
    },
    onError: (error) => {
      message.error(error.message || "创建失败");
    }
  });

  const updateMutation = trpc.workflow.update.useMutation({
    onSuccess: () => {
      message.success("工作流更新成功");
      navigate("/admin/workflow");
    },
    onError: (error) => {
      message.error(error.message || "更新失败");
    }
  });

  useEffect(() => {
    if (workflow) {
      form.setFieldsValue({
        name: workflow.name,
        description: workflow.description,
        config: workflow.config ? JSON.stringify(workflow.config) : "",
      });
    }
  }, [workflow, form]);

  const onFinish = async (values: any) => {
    const data = {
      ...values,
      config: values.config ? JSON.parse(values.config) : {},
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      // 错误已经在 mutation 的 onError 中处理
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title={isEdit ? "编辑工作流" : "创建工作流"}>
        {isEdit && isLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              name: "",
              description: "",
              config: "",
            }}
          >
            <Form.Item
              label="名称"
              name="name"
              rules={[{ required: true, message: "请输入工作流名称" }]}
            >
              <Input placeholder="请输入工作流名称" />
            </Form.Item>

            <Form.Item label="描述" name="description">
              <Input.TextArea placeholder="请输入工作流描述" />
            </Form.Item>

            <Form.Item label="配置" name="config">
              <Input.TextArea
                placeholder="请输入 JSON 格式的配置"
                rows={4}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isLoading || updateMutation.isLoading}
              >
                {isEdit ? "更新" : "创建"}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/admin/workflow")}
              >
                取消
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default WorkflowEdit;
