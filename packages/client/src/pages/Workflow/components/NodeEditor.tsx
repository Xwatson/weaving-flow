import React from "react";
import { Form, Input, Button, Drawer, InputNumber, Switch } from "antd";
import { Node } from "reactflow";
import BrowserFormItem from "./BrowserFormItem";

interface NodeEditorProps {
  node: Node | null;
  open: boolean;
  onClose: () => void;
  onSave: (nodeData: any) => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  open,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (node) {
      form.setFieldsValue(node.data);
    }
  }, [node, form]);

  React.useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave({
        ...node,
        data: values,
      });
      onClose();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Drawer
      title="节点配置"
      placement="right"
      width={400}
      onClose={onClose}
      open={open}
      extra={
        <Button type="primary" onClick={handleSubmit}>
          保存
        </Button>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="名称"
          name="label"
          rules={[{ required: true, message: "请输入节点名称" }]}
        >
          <Input placeholder="请输入节点名称" />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea placeholder="请输入节点描述" />
        </Form.Item>

        {/* 根据节点类型添加不同的配置字段 */}
        {node?.type === "input" && (
          <Form.Item label="输入配置" name={["config", "inputType"]}>
            <Input placeholder="请输入配置" />
          </Form.Item>
        )}

        {node?.type === "browser" && <BrowserFormItem />}

        {node?.type === "output" && (
          <Form.Item label="输出配置" name={["config", "outputType"]}>
            <Input placeholder="请输入配置" />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default NodeEditor;
