import React from "react";
import { Form, Input, InputNumber } from "antd";

interface LoopNodeProps {}

const LoopNode: React.FC<LoopNodeProps> = () => {
  return (
    <>
      <Form.Item
        label="循环次数"
        name="count"
        rules={[{ required: true, message: "请输入循环次数" }]}
      >
        <InputNumber min={1} defaultValue={1} />
      </Form.Item>
    </>
  );
};

export default LoopNode;
