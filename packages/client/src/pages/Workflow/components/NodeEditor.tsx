import React from "react";
import { Form, Input, Button, Drawer } from "antd";
import { Node } from "reactflow";
import BrowserNode from "./FormItems/BrowserNode";
import InputParams from "./FormItems/InputParams";
import StartNode from "./FormItems/StartNode";
import EndNode from "./FormItems/EndNode";
import LoopNode from "./FormItems/LoopNode";

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
      console.log("node", node.data);
      form.setFieldsValue(node.data);
    }
  }, [node, form]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      onSave({
        ...node,
        data: values,
      });
      onClose();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleClose = () => {
    handleSubmit();
  };

  const renderFormItem = () => {
    switch (node?.type) {
      case "start":
        return <StartNode />;
      case "browser":
        return <BrowserNode form={form} />;
      case "loop":
        return <LoopNode />;
      case "end":
        return <EndNode />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      title="节点配置"
      placement="right"
      width={480}
      onClose={handleClose}
      open={open}
    >
      <Form form={form} layout="vertical">
        <InputParams />
        <Form.Item
          label="名称"
          name="label"
          rules={[{ required: true, message: "请输入节点名称" }]}
        >
          <Input placeholder="请输入节点名称" />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input placeholder="请输入节点描述" />
        </Form.Item>

        {renderFormItem()}

        {node?.type !== "start" && node?.type !== "end" && (
          <Form.Item label="输出" name={["output", "result"]}>
            <Input
              disabled
              placeholder={
                node?.type === "browser" ? "输出最后一个 result" : "输出 result"
              }
            />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default NodeEditor;
